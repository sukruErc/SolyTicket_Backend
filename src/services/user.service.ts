import { User, Role, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import prisma from "../dbClient";
import blockchainService from "./blockchain.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import memoryTicketService from "./memoryTicket.service";
import { sendVerificationCode, verifyCode } from "./verification.service";
import { ApiResponse } from "../models/models";

const USER_KEYS = [
  "id",
  "name",
  "email",
  "type",
  "subscribeType",
  "status",
  "bcAddress",
  "mnemonic",
  "privateKey",
  "password",
  "image",
  "phone",
  "birthday",
  "createdAt",
  "updatedAt",
];

const createUser = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  birthday: string,
  type: Role = Role.CUSTOMER,
  image?: string,
): Promise<ApiResponse<any>> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Bu Mail Hesabı Kullanılıyor, Lütfen Başka Bir Mail deneyiniz.",
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const wallet = await blockchainService.createMetamaskWallet();

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      type,
      status: true,
      bcAddress: wallet ? wallet.address : "",
      mnemonic: wallet ? wallet.mnemonic?.phrase : "",
      privateKey: wallet ? wallet.privateKey : "",
      password: hashedPassword,
      image: "String?",
      birthday: birthday,
      phone: phone,
      mnemonicIsShown: false,
    },
  });
  //todo secrekey

  await sendVerificationCode(newUser.id, email);

  return { success: true, date: new Date(), message: "Verification code sent" };
};

const verify = async (
  code: string,
  userId: string,
): Promise<ApiResponse<any>> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Kullanıcı Bulunamadı");
  }

  const isValid = await verifyCode(userId, code);

  if (!isValid) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired verification code",
    );
  }
  const accessToken = jwt.sign(
    { userId: user.id, role: user.type },
    "solyKey",
    {
      expiresIn: "1d",
    },
  );

  return {
    success: true,
    date: new Date(),
    message: "Verification successful",
    data: accessToken,
  };
};

const createGoogleUser = async (
  email: string,
  picture: string,
  name: string,
  type: Role = Role.CUSTOMER,
  nameForNFT?: string,
  image?: string,
): Promise<any> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const wallet = await blockchainService.createMetamaskWallet();

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      type,
      status: true,
      bcAddress: wallet ? wallet.address : "",
      mnemonic: wallet ? wallet.mnemonic?.phrase : "",
      privateKey: wallet ? wallet.privateKey : "",
      password: "",
      image: picture,
      mnemonicIsShown: false,
    },
  });

  if (nameForNFT && image) {
    await memoryTicketService.generateMemoryTicket(
      image,
      nameForNFT,
      "ttestt3",
      newUser.id,
    );
  }
  //todo secrekey
  const accessToken = jwt.sign(
    { userId: newUser.id, role: newUser.type },
    "solyKey",
    {
      expiresIn: "1d",
    },
  );

  return { accessToken, userId: newUser.id };
};

const createMetamaskUser = async (
  email: string,
  password: string,
  wallet: string,
  name: string,
  birthday: string,
  type: Role = Role.CUSTOMER,
  nameForNFT?: string,
  image?: string,
): Promise<any> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      type,
      status: true,
      bcAddress: wallet,
      mnemonic: "",
      privateKey: "",
      password: hashedPassword,
      image: "String?",
      birthday: birthday,
      mnemonicIsShown: true,
    },
  });

  if (nameForNFT && image) {
    await memoryTicketService.generateMemoryTicket(
      image,
      nameForNFT,
      "ttestt3",
      newUser.id,
    );
  }
  //todo secrekey
  const accessToken = jwt.sign(
    { userId: newUser.id, role: newUser.type },
    "solyKey",
    {
      expiresIn: "1d",
    },
  );

  return { accessToken, userId: newUser.id };
};

const login = async (email: string, password: string): Promise<string> => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }

  const wallet = await blockchainService.createMetamaskWallet();

  const accessToken = jwt.sign(
    { userId: user.id, role: user.type },
    "solyKey",
    {
      expiresIn: "1d",
    },
  );

  return accessToken;
};

const queryUsers = async <Key extends keyof User>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = USER_KEYS as Key[],
): Promise<Pick<User, Key>[]> => {
  const page = options.page ?? 0;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const users = await prisma.user.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });

  prisma.$disconnect();
  return users as Pick<User, Key>[];
};

const getUserById = async <Key extends keyof User>(
  id: string,
  keys: Key[] = USER_KEYS as Key[],
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = USER_KEYS as Key[],
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

const updateUserById = async <Key extends keyof User>(
  userId: string,
  updateBody: Prisma.UserUpdateInput,
  keys: Key[] = ["id", "email", "name", "role"] as Key[],
): Promise<Pick<User, Key> | null> => {
  const user = await getUserById(userId, ["id", "email", "name"]);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  });

  return updatedUser as Pick<User, Key> | null;
};

const deleteUserById = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await prisma.user.delete({ where: { id: user.id } });

  return user;
};

const getMne = async (userId: string): Promise<any> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.mnemonicIsShown) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Kullanıcı bu işlemi gerçekleştiremez",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      mnemonicIsShown: true,
    },
  });

  return { mnemonic: user.mnemonic, privateKey: user.privateKey };
};

export default {
  createUser,
  createMetamaskUser,
  createGoogleUser,
  login,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getMne,
  verify,
};
