import express from "express";
import validate from "../../middlewares/validate";
import { userValidation } from "../../validations";
import { userController } from "../../controllers";

const router = express.Router();

router
  .route("/")
  .get(validate(userValidation.getUsers), userController.getUsers);

router
  .route("/signup")
  .post(validate(userValidation.createUser), userController.createUser);

router
  .route("/metamask-signup")
  .post(
    validate(userValidation.createMetamaskUser),
    userController.createMetamaskUser,
  );

router
  .route("/google-signup")
  .post(
    validate(userValidation.createGoogleUser),
    userController.createGoogleUser,
  );

router
  .route("/login")
  .post(validate(userValidation.login), userController.login);

router
  .route("/:userId")
  .get(validate(userValidation.getUser), userController.getUser)
  .patch(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

export default router;
