import cookieParser from "cookie-parser";
import express, { Application } from "express";
import expressSession from "express-session";
import passport from "passport";
import "./config/passport";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import { applySecurity } from "./middleware/security";
import paymentController from "./modules/payment/payment.controller";
import router from "./router";
import serverTemplate from "./utils/serverTemplate";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
const app: Application = express();

app.use(
  expressSession({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  }),
);

app.set("trust proxy", 1);

app.post(
  "/api/v1/main",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhookHandler,
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

// app.use(express.json());
app.use(cookieParser());

applySecurity(app);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/main")) {
    // Skip JSON parsing, Stripe needs raw body
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);

app.use("/api/v1", router);

app.get("/", (_req, res) => {
  res.send(serverTemplate());
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
