import express from "express";
import helmet from "helmet";
import cors from "cors";
import httpStatus from "http-status";
import { ApiError } from "./utils";
import { error, xss } from "./middlewares";
import router from "./routes/v1/index";
import bodyParser from "body-parser";
import session from "express-session";
import "./services/subscriptionBatch";
import KeycloakConnect from "keycloak-connect";
import { keycloakConfig } from "./config/keycloak";
import { sessionConfig } from "./config/session";

const app = express();

export const memoryStore = new session.MemoryStore();

app.use(session(sessionConfig));

const keycloak = new KeycloakConnect(
  {
    store: memoryStore,
  },
  keycloakConfig,
);

keycloak.middleware();

// set security HTTP headers
app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// enable cors
app.use(cors());

// v1 api routes
app.use("/v1", router);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(error.errorConverter);

// handle error
app.use(error.errorHandler);

export default app;
