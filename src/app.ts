import cookieParser from "cookie-parser";
import express, { Application } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import passport from "passport";
import expressSession from "express-session";
import { applySecurity } from "./middleware/security";
import router from "./router";

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
  res.send("Hey there! Welcome to our API.");
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;