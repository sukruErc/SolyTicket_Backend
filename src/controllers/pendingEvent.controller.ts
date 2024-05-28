import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import pendingEventService from "../services/pendingEvent.service";

const createPendingEvent = catchAsync(async (req, res) => {
  const {
    date,
    desc,
    eventName,
    image,
    locationId,
    time,
    userId,
    categoryId,
    eventCategoryTypeId,
    ticketPriceEntity,
  } = req.body;
  const result = await pendingEventService.createPendingEvent(
    date,
    desc,
    eventName,
    image,
    locationId,
    time,
    userId,
    categoryId,
    eventCategoryTypeId,
    ticketPriceEntity,
  );
  res.status(httpStatus.CREATED).send({ result });
});

const updatePendingEvent = catchAsync(async (req, res) => {
  const {
    eventId,
    date,
    desc,
    eventName,
    image,
    locationId,
    time,
    categoryId,
    eventCategoryTypeId,
    ticketPriceEntity,
  } = req.body;
  const result = await pendingEventService.updatePendingEvent(
    eventId,
    date,
    desc,
    eventName,
    image,
    locationId,
    time,
    categoryId,
    eventCategoryTypeId,
    ticketPriceEntity,
  );
  res.status(httpStatus.CREATED).send({ result });
});

const getAllPendingEvents = catchAsync(async (req, res) => {
  const data = await pendingEventService.getAllPendingEvents();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "pending events could not found");
  }
  res.send(data);
});

const getPendingEventByCreatorId = catchAsync(async (req, res) => {
  const data = await pendingEventService.getPendingEventByCreatorId(
    req.body.creatorId,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "pending events could not found");
  }
  res.send(data);
});

const approvePendingEvent = catchAsync(async (req, res) => {
  const data = await pendingEventService.approvePendingEvent(req.body.eventId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "pending events could not found");
  }
  res.send(data);
});

const rejectPendingEvent = catchAsync(async (req, res) => {
  const data = await pendingEventService.rejectPendingEvent(req.body.eventId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "pending events could not found");
  }
  res.send(data);
});

export default {
  createPendingEvent,
  updatePendingEvent,
  getAllPendingEvents,
  getPendingEventByCreatorId,
  approvePendingEvent,
  rejectPendingEvent,
};
