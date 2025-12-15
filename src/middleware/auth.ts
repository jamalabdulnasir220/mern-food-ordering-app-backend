import { auth } from "express-oauth2-jwt-bearer";
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/user.js";

declare global {
  namespace Express {
    interface Request {
      auth0Id: string;
      userId: string;
    }
  }
}

const audience = process.env.AUTH0_AUDIENCE;
const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;

if (!audience || !issuerBaseURL) {
  throw new Error(
    "Missing required environment variables: AUTH0_AUDIENCE and/or AUTH0_ISSUER_BASE_URL"
  );
}

export const jwtCheck = auth({
  audience,
  issuerBaseURL,
  tokenSigningAlg: "RS256",
});

export const parseJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Decode the JWT without verifying (verification is done by jwtCheck middleware)
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub as string;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.auth0Id = auth0Id;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

