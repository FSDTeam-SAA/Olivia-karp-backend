import { Router } from "express";
import userRouter from "../modules/user/user.router";
import authRouter from "../modules/auth/auth.router";
import contactRouter from "../modules/contact/contact.router";
import { EventRoutes } from "../modules/event/event.routes";
import { MediaRoutes } from "../modules/media/media.routes";
import { BlogRoutes } from "../modules/blog/blog.routes";
import { CourseIdeaRoutes } from "../modules/courseIdea/courseIdea.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/contact",
    route: contactRouter,
  },
  {
    path: "/event",
    route: EventRoutes,
  },
  {
    path: "/media",
    route: MediaRoutes,
  },
  {
    path: "/blog",
    route: BlogRoutes,
  },
  {
    path: "/courseIdea",
    route: CourseIdeaRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
