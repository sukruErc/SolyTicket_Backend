import { AdEvent, Location } from "@prisma/client";
import { ethers } from "ethers";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { Event } from "@prisma/client";
import { ApiResponse } from "../models/models";

interface HomepageValues {
  upcomingEventsCount: number;
  ticketSoldCount: number;
  totalCustomerCount: number;
}

interface CategorywithCount {
  id: string;
  categoryName: string;
  count: number;
}

interface LocationsForHomepage {
  id: string;
  locationName: string;
}

async function getHomepageValues(): Promise<ApiResponse<HomepageValues>> {
  try {
    const today = new Date();
    const [upcomingEventsCount, ticketSoldCount, totalCustomerCount] =
      await Promise.all([
        prisma.event.count({
          where: {
            date: {
              gt: new Date(),
            },
          },
        }),
        prisma.tickets.count(),
        prisma.user.count({
          where: {
            type: "CUSTOMER",
          },
        }),
      ]);

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: { upcomingEventsCount, ticketSoldCount, totalCustomerCount },
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
}

const getRecentEvents = async (limit: number = 10): Promise<Event[]> => {
  try {
    const upcomingEvents = await prisma.event.findMany({
      where: {
        date: {
          gt: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
      take: limit,
    });

    return upcomingEvents;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const getCategoriesWithCount = async (): Promise<CategorywithCount[]> => {
  try {
    const upcomingEventsByCategory = await prisma.category.findMany({
      select: {
        name: true,
        id: true,
        Event: {
          where: {
            date: {
              gt: new Date(),
            },
          },
          select: {
            _count: true,
          },
        },
      },
    });

    const formattedResults: CategorywithCount[] = upcomingEventsByCategory.map(
      (category) => ({
        id: category.id,
        categoryName: category.name,
        count: category.Event.length,
      }),
    );

    return formattedResults;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const gethighlightedEvent = async (): Promise<AdEvent[]> => {
  try {
    const currentDate = new Date();
    const activeAdEvents = await prisma.adEvent.findMany({
      where: {
        AND: [
          { startDate: { lte: currentDate } },
          { endDate: { gte: currentDate } },
        ],
      },
    });

    return activeAdEvents;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const getLocationsForHomepage = async (
  limit: number = 10,
): Promise<LocationsForHomepage[]> => {
  try {
    const locations = await prisma.location.findMany({
      take: limit,
    });

    const formattedResults: LocationsForHomepage[] = locations.map(
      (location) => ({
        id: location.id,
        locationName: location.name,
      }),
    );

    return formattedResults;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

export default {
  getHomepageValues,
  getRecentEvents,
  getCategoriesWithCount,
  gethighlightedEvent,
  getLocationsForHomepage,
};
