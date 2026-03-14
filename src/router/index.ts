import { Router } from "express";
import applyJobRouter from "../modules/applyJob/applyJob.router";
import authRouter from "../modules/auth/auth.router";
import { BlogRoutes } from "../modules/blog/blog.routes";
import contactRouter from "../modules/contact/contact.router";
import { CourseIdeaRoutes } from "../modules/courseIdea/courseIdea.routes";
import { EventRoutes } from "../modules/event/event.routes";
import jobRouter from "../modules/job/job.router";
import { MediaRoutes } from "../modules/media/media.routes";
import userRouter from "../modules/user/user.router";

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
  },
  {
    path: "/jobs",
    route: jobRouter,
  },
  {
    path: "/apply-job",
    route: applyJobRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
