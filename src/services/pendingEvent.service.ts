import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import eventService from "./event.service";
import { parse } from 'json5';
import ticketService from "./ticket.service";
import { PendingEvent } from "@prisma/client";


const createPendingEvent = async (
  date: Date,
  desc: string,
  eventName: string,
  image: string,
  location: string,
  price: string,
  searchTitle: string,
  seatNum: number,
  time: string,
  userId: string,
  categoryId: string,
  eventCategoryTypeId: string,
  ticketPriceEntity: Record<string, any>,
): Promise<boolean> => {
  try {
    const newPendingEvent = await prisma.pendingEvent.create({
      data: {
        creatorId: { connect: { id: userId } },
        date,
        eventName,
        eventCategory: { connect: { id: categoryId } },
        eventCategoryType: { connect: { id: eventCategoryTypeId } },
        image,
        location,
        price,
        seatNum,
        time,
        desc,
        searchTitle,
        ticketPriceEntity,
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};


const updatePendingEvent = async (
  eventId: string,
  date: Date,
  desc: string,
  eventName: string,
  image: string,
  location: string,
  price: string,
  searchTitle: string,
  seatNum: number,
  time: string,
  categoryId: string,
  eventCategoryTypeId: string,
  ticketPriceEntity: Record<string, any>,
): Promise<boolean> => {
  try {
    const newPendingEvent = await prisma.pendingEvent.update({
      where: {
        id: eventId,
      },

      data: {
        date,
        eventName,
        eventCategory: { connect: { id: categoryId } },
        eventCategoryType: { connect: { id: eventCategoryTypeId } },
        image,
        location,
        price,
        seatNum,
        time,
        desc,
        searchTitle,
        ticketPriceEntity,
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};


async function getAllPendingEvents(): Promise<PendingEvent[]> {
  try {
    const pendingEvents = await prisma.pendingEvent.findMany({
      where: {
        isActive: false,
      },
    });

    return pendingEvents;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

const getPendingEventByCreatorId = async (creatorId: string): Promise<PendingEvent[]> => {
  try {
    const userId = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (userId) {
      const pendingEvent = await prisma.pendingEvent.findMany({
        where: {
          creatorId: userId,
        },
      });
      return pendingEvent;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "User did not found");
    }
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching pending event by creatorId");
  }
};

const approvePendingEvent = async (eventId: string): Promise<boolean> => {
  try {
    const event = await prisma.pendingEvent.update({
      where: {
        id: eventId,
      },
      data: {
        isActive: true,
      },
    });

    const eventResult = await eventService.createEventFromPendingApprove(
      eventId,
    );

    const ticketPriceEntity = event.ticketPriceEntity as {
      [s: string]: string | number | boolean | null | undefined;
    };

    const object = {
      "category": { "price": 10, "count": 10 }
    }
    Object.entries(ticketPriceEntity).forEach(async ([category, values]) => {
      const parsedValues = values as unknown as { price: number, count: number };

      if (parsedValues && parsedValues.price)
        await ticketService.createEventFromPendingApprove(category, parsedValues.price, parsedValues.count, event.id)
    });

    //todo

    return true;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const rejectPendingEvent = async (eventId: string): Promise<boolean> => {
  try {
    await prisma.pendingEvent.delete({
      where: {
        id: eventId,
      },
    });

    return true;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

export default {
  createPendingEvent,
  updatePendingEvent,
  getAllPendingEvents,
  getPendingEventByCreatorId,
  approvePendingEvent,
  rejectPendingEvent,
};
