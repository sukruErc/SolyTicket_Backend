import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import eventService from "../services/event.service";
import { Request, Response } from "express";

const getEventById = catchAsync(async (req, res) => {
  const data = await eventService.getEventById(req.params.eventId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventByCategory = catchAsync(async (req, res) => {
  const data = await eventService.getEventByCategory(req.params.categoryId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventByCategoryType = catchAsync(async (req, res) => {
  const data = await eventService.getEventByCategoryType(
    req.params.categoryTypeId,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventByNameSearch = catchAsync(async (req, res) => {
  const data = await eventService.getEventByNameSearch(req.params.eventName);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventsByFilter = catchAsync(async (req: Request, res: Response) => {
  const { page, size, endDate, locationId, categoryTypeId, sortBy, sortOrder } =
    req.query;

  const data = await eventService.getEventsByFilter(
    parseInt(page as string, 10),
    parseInt(size as string, 10),
    locationId as string,
    endDate as string,
    categoryTypeId as string,
    sortBy as "date" | "eventName",
    sortOrder as "asc" | "desc",
  );

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Events could not be found");
  }

  res.send(data);
});

export default {
  getEventById,
  getEventByCategory,
  getEventByCategoryType,
  getEventByNameSearch,
  getEventsByFilter,
};
