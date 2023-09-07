import { Location } from "@prisma/client";
import { ethers } from "ethers";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";

async function getLocations(): Promise<Location[]> {
  try {
    const locations = await prisma.location.findMany({});

    return locations;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}


async function getCategories(): Promise<Location[]> {
  try {
    const categories = await prisma.category.findMany({});

    return categories;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

async function getCategoryTypes(
  options: {
    categoryId?: string;
  },): Promise<Location[]> {
  try {
    const categoryId = options.categoryId;

    const categoryType = await prisma.categoryType.findMany({ where: { categoryId: categoryId } });

    return categoryType;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

export default {
  getLocations,
  getCategoryTypes,
  getCategories
};
