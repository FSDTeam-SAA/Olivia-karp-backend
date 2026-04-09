import { NextFunction, Request, Response } from "express";
import config from "../config";
import logger from "../logger";
import { verifyToken } from "../utils/tokenGenerate";

const optionalAuth = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const extractedToken = req.headers.authorization;
      const token = extractedToken?.split(" ")[1];
      
      if (token) {
        const verifyUserData = verifyToken(token, config.JWT_SECRET as string);
        req.user = verifyUserData as any;
      }
    } catch (error: any) {
      // Intentionally swallow the error as auth is optional
      logger.info("Optional Auth: Token missing or invalid.");
    }
    
    next();
  };
};

export default optionalAuth;
