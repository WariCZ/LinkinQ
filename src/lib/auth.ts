import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { BasicStrategy } from "passport-http";
import { db } from "../lib/knex";

export type User = {
  id: number;
  fullname: string;
  email: string;
  name: string;
  guid: string;
  // další vlastnosti podle potřeby
};

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}
const router = express.Router();

const SECRET_KEY = "your_jwt_secret_key";

router.use(passport.initialize());

passport.use(
  new BasicStrategy(async (username, password, done) => {
    var dbUser = await db("users")
      .setUser({ id: 1 })
      .select("fullname", "email", "id", "guid")
      .where({
        password: password,
        email: username,
      });
    if (dbUser.length > 0) {
      const user: User = {
        id: dbUser[0].id,
        name: dbUser[0].fullname,
        fullname: dbUser[0].fullname,
        email: dbUser[0].email,
        guid: dbUser[0].guid,
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

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    next();
  }
};
router.use(authenticateJWT);

router.get("/checkAuth", (req: Request, res: Response) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

export default router;
