import express, { Router } from "express";
import userRoute from "./user.route";
import pendingEventRoute from "./pendingEvent.route";
import eventRoute from "./event.route";
import filterTypeRoute from "./filterType.route";

const router = express.Router();

interface Routes {
  path: string;
  route: Router;
}

const routes: Routes[] = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/pending-events",
    route: pendingEventRoute,
  },
  {
    path: "/events",
    route: eventRoute,
  },
  {
    path: "/filter-type",
    route: filterTypeRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
