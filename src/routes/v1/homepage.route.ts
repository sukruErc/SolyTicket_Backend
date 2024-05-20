import express from "express";
import homePageController from "../../controllers/homepage.controller";

const router = express.Router();

router.route("/get-homepage-values").get(homePageController.getHomepageValues);

router.route("/get-recent-events").get(homePageController.getRecentEvents);

router
  .route("/get-categories-with-count")
  .get(homePageController.getCategoriesWithCount);

router
  .route("/get-locations-for-homepage")
  .get(homePageController.getLocationsForHomepage);

router
  .route("/get-highlighted-events")
  .get(homePageController.gethighlightedEvent);

export default router;
