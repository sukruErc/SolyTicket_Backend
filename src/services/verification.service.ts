// services/verificationService.ts

import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export const sendVerificationCode = async (userId: string, contact: string) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  // Store verification code in the database
  await prisma.verificationCode.create({
    data: {
      userId,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Code expires in 15 minutes
    },
  });

  // Send verification code
  const message = `Your verification code is ${verificationCode}`;
  await sendEmail(contact, "Verification Code", message);
};

export const verifyCode = async (
  userId: string,
  code: string,
): Promise<boolean> => {
  const record = await prisma.verificationCode.findFirst({
    where: {
      userId,
      code,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return false;
  }

  // Code is valid, delete it from the database
  await prisma.verificationCode.delete({ where: { id: record.id } });
  return true;
};

const transporter = nodemailer.createTransport({
  host: "mail.artitel.com.tr",
  port: 587,
  secure: false,
  auth: {
    user: "sukrucan.ercoban@artitel.com.tr",
    pass: "sukru2023can.",
  },
});

// Send email
export const sendEmail = async (to: string, subject: string, text: string) => {
  const info = await transporter.sendMail({
    from: "sukrucan.ercoban@artitel.com.tr",
    to,
    subject,
    text,
  });
  console.log("Message sent: %s", info.messageId);
};
