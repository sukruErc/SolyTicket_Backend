import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import homepageService from "../services/homepage.service";

const getHomepageValues = catchAsync(async (req, res) => {
  console.log("asddasdada");
  const data = await homepageService.getHomepageValues();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

export default {
  getHomepageValues,
};
