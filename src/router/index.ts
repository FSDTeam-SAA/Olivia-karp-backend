import { Router } from "express";
import applyJobRouter from "../modules/applyJob/applyJob.router";
import authRouter from "../modules/auth/auth.router";
import { BlogRoutes } from "../modules/blog/blog.routes";
import contactRouter from "../modules/contact/contact.router";
import { CourseIdeaRoutes } from "../modules/courseIdea/courseIdea.routes";
import { EventRoutes } from "../modules/event/event.routes";
import jobRouter from "../modules/job/job.router";
import joinMentorsAndCoachRouter from "../modules/JoinMentorsAndCoache/JoinMentorsAndCoach.router";
import { MediaRoutes } from "../modules/media/media.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import userRouter from "../modules/user/user.router";
import { ApplyBlogRoutes } from "../modules/applyBlog/applyBlog.routes";

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
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/mentors-coaches",
    route: joinMentorsAndCoachRouter,
  },
  {
    path: "/apply-blog",
    route: ApplyBlogRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
