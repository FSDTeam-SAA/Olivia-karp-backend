import cookieParser from "cookie-parser";
import express, { Application } from "express";
import expressSession from "express-session";
import passport from "passport";
import "./config/passport";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import { applySecurity } from "./middleware/security";
import router from "./router";
import serverTemplate from "./utils/serverTemplate";
const app: Application = express();

app.use(
  expressSession({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());

applySecurity(app);

app.use("/api/v1", router);

app.get("/", (_req, res) => {
  res.send(serverTemplate());
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
