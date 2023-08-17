import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import eventService from "../services/event.service";

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
    const data = await eventService.getEventByCategoryType(req.params.categoryTypeId);
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

export default {
    getEventById,
    getEventByCategory,
    getEventByCategoryType,
    getEventByNameSearch
}