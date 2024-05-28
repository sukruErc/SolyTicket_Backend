import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import { Event, TicketCategory } from "@prisma/client";
import { ApiResponse } from "../models/models";
import { connect } from "http2";
import blockchainService from "../services/blockchain.service";

interface FilterEventsParams {
  page: number;
  pageSize: number;
  startDate: string;
  locationId?: string;
  endDate?: string;
  categoryTypeId?: string;
  sortBy?: "date" | "eventName";
  sortOrder?: "asc" | "desc";
}

const createEventFromPendingApprove = async (
  pendingEventId: string,
): Promise<Event> => {
  try {
    const pendingEvent = await getPendingEventById(pendingEventId);

    if (!pendingEvent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }

    const eventContractAddress = await blockchainService.CreateNewNftContract(
      "test",
      10,
    );

    if (!eventContractAddress) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Error in deploying contract");
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
        location: { connect: { id: pendingEvent.locationId } },
        contractAddress: eventContractAddress ? eventContractAddress : "",
        time: pendingEvent.time,

        // searchTitle: pendingEvent.searchTitle,
      },
    });
    if (!pendingEvent.ticketPriceEntity) {
      throw new ApiError(httpStatus.BAD_REQUEST, "ticketPriceEntity not found");
    }
    const ticketEntityString = JSON.stringify(pendingEvent.ticketPriceEntity);
    const ticketCategories = await createTicketCategories(
      ticketEntityString,
      newEvent.id,
    );

    // for (const ticketCat of ticketCategories) {
    //   for (let i = 0; i < ticketCat.quantity; i++) {
    //     await prisma.tickets.create({
    //       data: {
    //         owner: { connect: { id: pendingEvent.userId } },
    //         event: { connect: { id: newEvent.id } },
    //         ticketCategory: { connect: { id: ticketCat.id } },
    //         ticketTypeName: ticketCat.name,
    //       },
    //     });
    //   }
    // }

    return newEvent;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const createTicketCategories = async (
  ticketEntity: string,
  eventId: string,
): Promise<TicketCategory[]> => {
  const categories = JSON.parse(ticketEntity);
  let list = [];
  for (const category of categories) {
    const res = await prisma.ticketCategory.create({
      data: {
        event: { connect: { id: eventId } },
        name: category.name,
        price: parseFloat(category.price),
        quantity: parseInt(category.quantity),
      },
    });
    list.push(res);
  }
  return list;
};

const getEventById = async <Key extends keyof Event>(
  eventId: string,
): Promise<ApiResponse<Pick<Event, Key> | null>> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
        creatorId: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, date: new Date(), data: event };
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getEventByCategory = async <Key extends keyof Event>(
  categoryId: string,
): Promise<Event[]> => {
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
};

const getEventByCategoryType = async <Key extends keyof Event>(
  categoryTypeId: string,
): Promise<Event[]> => {
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
};

const getEventByNameSearch = async <Key extends keyof Event>(
  eventName: string,
): Promise<Event[]> => {
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
    console.error("Error searching events:", error);
    throw error;
  }
};

const getEventsByFilter = async (
  page: number,
  pageSize: number,
  locationId: string,
  endDate: string,
  categoryTypeId: string,
  sortBy = "date",
  sortOrder = "asc",
): Promise<ApiResponse<Event[]>> => {
  try {
    const filters: any = {};
    if (locationId) {
      filters.locationId = locationId;
    }

    filters.date = { gte: new Date() };

    if (endDate) {
      if (!filters.date) {
        filters.date = {};
      }
      filters.date.lte = new Date(endDate);
    }

    if (categoryTypeId) {
      filters.categoryTypeId = categoryTypeId;
    }

    const sortOptions: Record<string, any> = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder;
    }
    const events = await prisma.event.findMany({
      where: filters,
      orderBy: sortOptions,
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      date: new Date(),
      data: events,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

const buyEventTicket = async (
  eventId: string,
  ticketCategoryId: string,
  userId: string,
): Promise<ApiResponse<any>> => {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Event not found");
    }

    if (event.date < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Event has already passed");
    }

    const ticketCategory = await prisma.ticketCategory.findUnique({
      where: {
        id: ticketCategoryId,
      },
    });

    if (!ticketCategory) {
      throw new ApiError(httpStatus.BAD_REQUEST, "ticketCategory not found");
    }

    const availableTickets = await prisma.tickets.count({
      where: {
        ticketCategoryId: ticketCategoryId,
        // userId: "",
        // sold: false
      },
    });

    if (availableTickets === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "All tickets in this category are sold out",
      );
    }

    const userBoughtTicket = await prisma.tickets.findFirst({
      where: {
        userId: userId,
        eventId: eventId,
      },
    });

    if (userBoughtTicket) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User has already bought a ticket for this event",
      );
    }

    //TODO purchase payment

    const randomTicket = await prisma.tickets.findFirst({
      where: {
        ticketCategoryId: ticketCategoryId,
        // sold: false
      },
      // orderBy: {
      //   // Order randomly
      //   createdAt: 'asc',
      // },
    });

    if (!randomTicket) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No available ticket found for the given category",
      );
    }

    const updatedTicket = await prisma.tickets.update({
      where: {
        id: randomTicket.id,
      },
      data: {
        userId: userId,
      },
    });

    //TODO SEND NFT USER

    return {
      success: true,
      date: new Date(),
      data: updatedTicket,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
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
  getEventById,
  getEventByCategory,
  getEventByCategoryType,
  getEventByNameSearch,
  getEventsByFilter,
  buyEventTicket,
};
