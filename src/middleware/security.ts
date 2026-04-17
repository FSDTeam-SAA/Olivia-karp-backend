import compression from "compression";
import cors from "cors";
import express, { Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, try again later.",
});

// Login-specific rate limiter
export const loginLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts, try again later.",
});

// CORS options
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://olivia-frontend-nu.vercel.app",
    "https://olivia-karp-dashboard.vercel.app",
    "actonclimate.com",
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  // Allow the server to receive cookies and authorization headers
  credentials: true,
  // Explicitly allow common headers used with JWT and file uploads
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  // Optional: Allows the frontend to read specific headers from the response
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
export const applySecurity = (app: Application) => {
  app.use(globalLimiter);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: true,
    }),
  );
  app.use(helmet.frameguard({ action: "deny" }));
  app.use(helmet.noSniff());

  app.use(cors(corsOptions));

  //! When you want to allow specific query parameters to be duplicated in the query string, you can use the whitelist option.
  app.use(
    hpp({
      whitelist: [],
    }),
  );
  app.use(compression());

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
};
