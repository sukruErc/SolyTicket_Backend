import { Location } from "@prisma/client";
import { ethers } from "ethers";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { createCanvas, loadImage, registerFont } from "canvas";

async function generateMemoryTicket(): Promise<string> {
  try {
    registerFont("C:/Users/T470/Documents/fonts/NeuePlakExtendedSemiBold.ttf", {
      family: "Neue Plak",
    });
    const image = await loadImage("C:/Users/T470/Documents/soly_logo.jpg");

    // Set up canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);

    // Set font properties
    ctx.font = '60px "Neue Plak Expanded" sans-serif';

    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text to the canvas
    ctx.fillText(
      "Your Text Here",
      canvas.width / 2 - 600,
      canvas.height / 2 - 600,
    );

    // Convert canvas to a Base64-encoded image
    const base64Image = canvas.toDataURL("image/jpeg");

    return base64Image;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

export default {
  generateMemoryTicket,
};
