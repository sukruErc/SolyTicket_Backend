import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import memoryTicketService from "../services/memoryTicket.service";
import jwt, { JwtPayload } from "jsonwebtoken";

const generateMemoryTicket = catchAsync(async (req, res) => {
  const { displayName, activityName } = req.body;
  const token = req.headers.authorization;
  const jwtCode = token?.split(" ")[1];
  if (jwtCode) {
    const decoded = jwt.verify(jwtCode, "secretKey") as JwtPayload;
    const data = await memoryTicketService.generateMemoryTicket(
      displayName,
      activityName,
      decoded.userId!,
    );
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
    }
  }
  res.send("data");
});

const createMemoryContract = catchAsync(async (req, res) => {
  const { contractName, numberOfTickets, tag } = req.body;
  const data = await memoryTicketService.createMemoryContract(
    contractName,
    numberOfTickets,
    tag,
  );

  res.send(data);
});

const imageGenerator = catchAsync(async (req, res) => {
  const { displayName } = req.body;
  const data = await memoryTicketService.imageWithLabelConverter(displayName);

  res.send(data);
});

export default {
  generateMemoryTicket,
  createMemoryContract,
  imageGenerator,
};
