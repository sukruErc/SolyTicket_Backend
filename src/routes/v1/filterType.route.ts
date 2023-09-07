import express from "express";
import validate from "../../middlewares/validate";
import filterTyoeValidation from "../../validations/filterType.validation";
import filterTypeController from "../../controllers/filterType.controller";

const router = express.Router();

router
    .route("/get-locations")
    .get(filterTypeController.getLocations);

router
    .route("/get-categories")
    .get(filterTypeController.getCategories);

router
    .route("/get-category-types")
    .get(validate(filterTyoeValidation.getCategoryTypeById), filterTypeController.getCategoryTypes);


export default router;
