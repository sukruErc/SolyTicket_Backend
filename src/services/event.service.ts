import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import { Event } from "@prisma/client";

const createEventFromPendingApprove = async (
  pendingEventId: string,
): Promise<boolean> => {
  try {
    const pendingEvent = await getPendingEventById(pendingEventId);

    if (!pendingEvent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }

    const newEvent = await prisma.event.create({
      data: {
        creatorId: { connect: { id: pendingEvent.userId } },
        date: pendingEvent.date,
        desc: pendingEvent.desc,
        eventName: pendingEvent.eventName,
        eventCategory: { connect: { id: pendingEvent.categoryId } },
        eventCategoryType: { connect: { id: pendingEvent.categoryTypeId } },
        image: pendingEvent.image,
        location: pendingEvent.location,
        priceLabel: pendingEvent.price,
        seatNum: pendingEvent.seatNum,
        time: pendingEvent.time,
        searchTitle: pendingEvent.searchTitle,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getEventById = async<Key extends keyof Event>(eventId: string): Promise<Pick<Event, Key> | null> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    return event;

  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}

const getEventByCategory = async<Key extends keyof Event>(categoryId: string): Promise<Event[]> => {
  try {
    const event = await prisma.event.findMany({
      where: {
        categoryId: categoryId,
      },
    });

    return event;

  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}

const getEventByCategoryType = async<Key extends keyof Event>(categoryTypeId: string): Promise<Event[]> => {
  try {
    const event = await prisma.event.findMany({
      where: {
        categoryTypeId: categoryTypeId,
      },
    });

    return event;

  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}

const getEventByNameSearch = async<Key extends keyof Event>(eventName: string): Promise<Event[]> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        eventName: {
          contains: eventName,
        },
      },
    });

    return events;
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }

}



async function getPendingEventById(id: string) {
  return prisma.pendingEvent.findUnique({
    where: {
      id,
    },
  });
}

export default {
  createEventFromPendingApprove,
  getEventById,
  getEventByCategory,
  getEventByCategoryType,
  getEventByNameSearch
};
