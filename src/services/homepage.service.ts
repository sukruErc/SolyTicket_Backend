import { Location } from "@prisma/client";
import { ethers } from "ethers";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";

interface HomepageValues {
  upcomingEventsCount: number;
  ticketSoldCount: number;
  totalCustomerCount: number;
}
async function getHomepageValues(): Promise<HomepageValues> {
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

    return { upcomingEventsCount, ticketSoldCount, totalCustomerCount };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
}

export default {
  getHomepageValues,
};
