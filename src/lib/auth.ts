import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { BasicStrategy } from "passport-http";
import { Sql } from "./entity/sql";
import { EntitySchema } from "./entity/types";

export type User = {
  id: number;
  fullname: string;
  email: string;
  name: string;
  guid: string;
  roles?: string[];
  // další vlastnosti podle potřeby
};

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

const SECRET_KEY = process.env.SECRET_KEY || "your_jwt_secret_key";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    validateBasicAuth(req, res, next);
  }
};

// Middleware pro ověření Basic Auth
export const validateBasicAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    return next();
  }
  passport.authenticate(
    "basic",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user; // Uživatel ověřen, připojíme ho k `req`
      next();
    }
  )(req, res, next);
};

const authRoutes = ({
  schema,
  sqlAdmin,
}: {
  schema: EntitySchema;
  sqlAdmin: Sql;
}) => {
  const router = express.Router();
  router.use(passport.initialize());

  passport.use(
    new BasicStrategy(async (username, password, done) => {
      const dbUser = await sqlAdmin.select({
        entity: "users",
        fields: ["fullname", "email", "id", "guid", "roles.key"],
        where: {
          password: password,
          email: username,
        },
      });

      if (dbUser.length > 1) {
        throw "too many users";
      }
      if (dbUser.length > 0) {
        const user: User = {
          id: dbUser[0].id,
          name: dbUser[0].fullname,
          fullname: dbUser[0].fullname,
          email: dbUser[0].email,
          guid: dbUser[0].guid,
          roles: dbUser[0].roles?.map((r: any) => r.key) || [],
        };
        return done(null, user);
      } else {
        return done(null, false); //  { message: "Incorrect username or password." }
      }
    })
  );
  passport.use(
    "local",
    new LocalStrategy(async (username, password, done) => {
      const dbUser = await sqlAdmin.select({
        entity: "users",
        fields: ["fullname", "email", "id", "guid", "roles.key"],
        where: {
          password: password,
          email: username,
        },
      });
      if (dbUser.length > 0) {
        const user: User = {
          id: dbUser[0].id,
          name: dbUser[0].fullname,
          fullname: dbUser[0].fullname,
          email: dbUser[0].email,
          guid: dbUser[0].guid,
          roles: dbUser[0].roles?.map((r: any) => r.key) || [],
        };
        return done(null, user);
      } else {
        return done(null, false); //  { message: "Incorrect username or password." }
      }
    })
  );

  router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user)
        return res.status(401).json({ message: "Authentication failed" });

      const token = jwt.sign(
        {
          guid: user.guid,
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          roles: user.roles,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.cookie("jwt", token, { httpOnly: true });
      res.json({ message: "Login successful" });
    })(req, res, next);
  });

  router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("jwt");
    res.json({ message: "Logout successful" });
  });

  router.get("/checkAuth", authenticate, (req: Request, res: Response) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.json({ user: null });
    }
  });

  return router;
};
export default authRoutes;
