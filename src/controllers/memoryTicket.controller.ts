import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import memoryTicketService from "../services/memoryTicket.service";

const generateMemoryTicket = catchAsync(async (req, res) => {
  const data = await memoryTicketService.generateMemoryTicket();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

export default {
  generateMemoryTicket,
};
