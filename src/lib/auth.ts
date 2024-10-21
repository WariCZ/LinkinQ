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
  roles: string[];
  // další vlastnosti podle potřeby
};

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}
const router = express.Router();

const ACCESS_TOKEN_SECRET = "your_jwt_secret_key";
const REFRESH_TOKEN_SECRET = "your_jwt_refresh_secret_key";

const ACCESS_TOKEN_EXPIRE = "1h";
const REFRESH_TOKEN_EXPIRE = "7d";

//TODO: save to DB
const refreshTokens: { [key: string]: string } = {};

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
      var dbUser = await db("users")
        .setUser({ id: 1 })
        .select("fullname", "email", "id", "guid")
        .where({
          password: password,
          email: username,
        });

      const user: User = {
        id: dbUser[0].id,
        name: dbUser[0].fullname,
        fullname: dbUser[0].fullname,
        email: dbUser[0].email,
        guid: dbUser[0].guid,
        roles: [],
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
        roles: [],
      };
      return done(null, user);
    } else {
      return done(null, false); //  { message: "Incorrect username or password." }
    }
  })
);

export const authenticateWithMultipleStrategies = (strategies: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tryStrategy = async (index: number) => {
      if (index >= strategies.length) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const strategy = strategies[index];

      passport.authenticate(
        strategy,
        { session: false },
        (err: Error | null, user: User, info: any) => {
          if (err || !user) {
            return tryStrategy(index + 1);
          }
          req.user = user;
          next();
        }
      )(req, res, next);
    };

    // Start with the first strategy
    await tryStrategy(0);
  };
};

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
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );
    const refreshToken = jwt.sign(
      {
        guid: user.guid,
        id: user.id,
        email: user.email,
        fullname: user.fullname,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRE }
    );

    // TODO: save to DB
    refreshTokens[user.id] = refreshToken;

    res.cookie("jwt", token, { httpOnly: true });
    res.json({ message: "Login successful" });
  })(req, res, next);
});

router.post("/logout", (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    // Zneplatni refresh token
    const decoded: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    delete refreshTokens[decoded.id];
  }
  res.clearCookie("jwt");
  res.clearCookie("refreshToken");
  res.json({ message: "Logout successful" });
});

async function refreshAccessToken(refreshToken: string) {
  try {
    // Ověříme refresh token
    const decoded = jwt.verify(refreshToken, ACCESS_TOKEN_SECRET) as User;

    // Vytvoříme nový access token
    const newAccessToken = jwt.sign(
      {
        guid: decoded.guid,
        id: decoded.id,
        email: decoded.email,
        fullname: decoded.fullname,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    // Volitelně můžeme vytvořit nový refresh token
    const newRefreshToken = jwt.sign(
      {
        guid: decoded.guid,
        id: decoded.id,
        email: decoded.email,
        fullname: decoded.fullname,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRE }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Refresh token error", error);
    return null;
  }
}

// Middleware pro obnovení access tokenu
const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;
  const refreshToken = req.cookies.refreshToken;

  if (!token && refreshToken) {
    // Pokud access token neexistuje, ale refresh token ano, pokusíme se obnovit
    const newTokens = await refreshAccessToken(refreshToken);
    if (newTokens) {
      res.cookie("jwt", newTokens.accessToken, { httpOnly: true });
      res.cookie("refreshToken", newTokens.refreshToken, { httpOnly: true });
      req.user = jwt.decode(newTokens.accessToken) as User;
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "Session expired, please login again." });
    }
  }

  if (token) {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
      if (err && refreshToken) {
        // Token expiroval, pokusíme se ho obnovit
        refreshAccessToken(refreshToken)
          .then((newTokens) => {
            if (newTokens) {
              res.cookie("jwt", newTokens.accessToken, { httpOnly: true });
              res.cookie("refreshToken", newTokens.refreshToken, {
                httpOnly: true,
              });
              req.user = jwt.decode(newTokens.accessToken) as User;
              next();
            } else {
              res
                .status(401)
                .json({ message: "Session expired, please login again." });
            }
          })
          .catch(() =>
            res.status(401).json({ message: "Invalid refresh token." })
          );
      } else if (user) {
        req.user = user;
        next();
      } else {
        next();
        //res.status(401).json({ message: "Unauthorized" });
      }
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
