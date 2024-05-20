import express from "express";
import homePageController from "../../controllers/homepage.controller";

const router = express.Router();

router.route("/get-homepage-values").get(homePageController.getHomepageValues);

export default router;
