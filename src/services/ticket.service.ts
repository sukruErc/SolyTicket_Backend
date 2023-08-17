import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import { JsonValue } from "@prisma/client/runtime/library";

const createEventFromPendingApprove = async (
  categoryName: string,
  price: number,
  count: number,
  eventId: string
): Promise<boolean> => {
  try {
    const pendingEvent = await getPendingEventById(eventId);
    if (!pendingEvent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }

    // const newEvent = await prisma.tickets.create({
    //   data: {
    //     creatorId: { connect: { id: pendingEvent.userId } },
    //     date: pendingEvent.date,
    //     eventCategory: { connect: { id: pendingEvent.categoryId } },
    //     eventCategoryType: { connect: { id: pendingEvent.categoryTypeId } },
    //     // ticketTypeName: categoryName,
    //     // price: price
    //   },
    // });

    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

async function getPendingEventById(id: string) {
  return prisma.pendingEvent.findUnique({
    where: {
      id,
    },
  });
}

export default {
  createEventFromPendingApprove,
};
