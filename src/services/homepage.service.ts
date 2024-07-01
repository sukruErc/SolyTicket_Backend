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
  locationAddress: string;
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

const getRecentEvents = async (
  limit: number = 10,
): Promise<ApiResponse<Event[]>> => {
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
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
        creatorId: true,
      },
      take: limit,
    });

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: upcomingEvents,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const getCategoriesWithCount = async (): Promise<
  ApiResponse<CategorywithCount[]>
> => {
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

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: formattedResults,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const gethighlightedEvent = async (): Promise<ApiResponse<AdEvent[]>> => {
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

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: activeAdEvents,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const getLocationsForHomepage = async (
  limit: number = 4,
): Promise<ApiResponse<LocationsForHomepage[]>> => {
  try {
    const locations = await prisma.location.findMany({
      take: limit,
    });

    const formattedResults: LocationsForHomepage[] = locations.map(
      (location) => ({
        id: location.id,
        locationName: location.name,
        locationAddress: location.address,
      }),
    );

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: formattedResults,
    };
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
