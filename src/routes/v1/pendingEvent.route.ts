import express from "express";
import validate from "../../middlewares/validate";
import { pendingEventValidation } from "../../validations";
import { userController } from "../../controllers";
import pendingEventController from "../../controllers/pendingEvent.controller";
import authenticateMiddleware from "../../middlewares/authenticate";

const router = express.Router();

router
  .route("/create-event-for-pending")
  .post(
    validate(pendingEventValidation.createPendingEvent),
    authenticateMiddleware,
    pendingEventController.createPendingEvent,
  );


router
  .route("/update-event-for-pending")
  .put(
    validate(pendingEventValidation.updatePendingEvent),
    authenticateMiddleware,
    pendingEventController.updatePendingEvent,
  );


router
  .route("/get-all-event-for-pending")
  .get(
    authenticateMiddleware,
    pendingEventController.getAllPendingEvents,
  );

router
  .route("/get-all-event-for-pending-by-id")
  .get(
    validate(pendingEventValidation.getById),
    authenticateMiddleware,
    pendingEventController.getPendingEventByCreatorId,
  );

router
  .route("/approve-pending-event")
  .post(
    validate(pendingEventValidation.getEventId),
    authenticateMiddleware,
    pendingEventController.approvePendingEvent,
  );

router
  .route("/reject-pending-event")
  .post(
    validate(pendingEventValidation.getEventId),
    authenticateMiddleware,
    pendingEventController.rejectPendingEvent,
  );

export default router;
