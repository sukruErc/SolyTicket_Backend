import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import homepageService from "../services/homepage.service";

const getHomepageValues = catchAsync(async (req, res) => {
  const data = await homepageService.getHomepageValues();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getRecentEvents = catchAsync(async (req, res) => {
  const data = await homepageService.getRecentEvents();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getCategoriesWithCount = catchAsync(async (req, res) => {
  const data = await homepageService.getCategoriesWithCount();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const gethighlightedEvent = catchAsync(async (req, res) => {
  const data = await homepageService.gethighlightedEvent();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getLocationsForHomepage = catchAsync(async (req, res) => {
  const data = await homepageService.getLocationsForHomepage();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

export default {
  getHomepageValues,
  getRecentEvents,
  getCategoriesWithCount,
  gethighlightedEvent,
  getLocationsForHomepage,
};
