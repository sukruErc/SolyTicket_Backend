import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import eventService from "./event.service";
import { PendingEvent } from "@prisma/client";
import { ApiResponse } from "../models/models";

const createPendingEvent = async (
  date: Date,
  desc: string,
  eventName: string,
  image: string,
  locationId: string,
  time: string,
  userId: string,
  categoryId: string,
  eventCategoryTypeId: string,
  ticketPriceEntity: Record<string, any>,
): Promise<ApiResponse<any>> => {
  try {
    const newPendingEvent = await prisma.pendingEvent.create({
      data: {
        creatorId: { connect: { id: userId } },
        date,
        eventName,
        eventCategory: { connect: { id: categoryId } },
        eventCategoryType: { connect: { id: eventCategoryTypeId } },
        image,
        location: { connect: { id: locationId } },
        time,
        desc,
        ticketPriceEntity,
      },
    });
    return { date: new Date(), success: true, data: newPendingEvent };
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
  locationId: string,
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
        location: { connect: { id: locationId } },
        time,
        desc,
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

const getPendingEventByCreatorId = async (
  creatorId: string,
): Promise<PendingEvent[]> => {
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
      throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
    }
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching pending event by creatorId");
  }
};

const approvePendingEvent = async (
  eventId: string,
): Promise<ApiResponse<any>> => {
  try {
    // Fetch the pending event outside the transaction to reduce transaction duration
    const pendingEvent = await prisma.pendingEvent.findUnique({
      where: { id: eventId },
    });

    if (!pendingEvent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }

    // Create event and ticket categories within a single transaction
    const { newEvent, ticketCategories } = await prisma.$transaction(
      async (transaction) => {
        const newEvent = await eventService.createEventFromPendingApprove(
          pendingEvent,
          transaction,
        );
        const ticketCategories = await eventService.createTicketCategories(
          JSON.stringify(pendingEvent.ticketPriceEntity),
          newEvent.id,
          transaction,
        );
        return { newEvent, ticketCategories };
      },
      { maxWait: 30000, timeout: 30000 },
    );

    // Create tickets in a separate step
    await eventService.createTickets(
      newEvent,
      ticketCategories,
      pendingEvent,
      newEvent.contractAddress,
    );

    // Update pending event status
    await prisma.pendingEvent.update({
      where: { id: eventId },
      data: { isActive: true },
    });

    return { date: new Date(), success: true, data: newEvent };
  } catch (error) {
    console.error("Error approving event:", error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const rejectPendingEvent = async (eventId: string): Promise<boolean> => {
  try {
    await prisma.pendingEvent.delete({
      where: { id: eventId },
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
