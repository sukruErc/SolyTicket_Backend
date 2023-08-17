import express from "express";
import validate from "../../middlewares/validate";
import eventValidation from "../../validations/event.validation";
import eventController from "../../controllers/event.controller";

const router = express.Router();

router
    .route("/get-event-by-id")
    .post(
        validate(eventValidation.getEventById),
        eventController.getEventById,
    );

router
    .route("/get-event-by-category")
    .post(
        validate(eventValidation.getEventByCategory),
        eventController.getEventByCategory,
    );


router
    .route("/get-event-by-category-type")
    .post(
        validate(eventValidation.getEventByCategoryType),
        eventController.getEventByCategoryType,
    );


router
    .route("/get-event-by-name")
    .post(
        validate(eventValidation.getEventByNameSearch),
        eventController.getEventByNameSearch,
    );


export default router;
