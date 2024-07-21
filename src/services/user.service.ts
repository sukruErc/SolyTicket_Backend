import { User, Role, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import prisma from "../dbClient";
import blockchainService from "./blockchain.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import memoryTicketService from "./memoryTicket.service";
import {
  generateResetToken,
  sendResetEmail,
  sendVerificationCode,
  verifyCode,
} from "./verification.service";
import { ApiResponse } from "../models/models";
import axios, { AxiosError } from "axios";
import qs from "qs";

const USER_KEYS = [
  "id",
  "name",
  "email",
  "type",
  "subscribeType",
  "status",
  "bcAddress",
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
      // mnemonic: wallet ? wallet.mnemonic?.phrase : "",
      // privateKey: wallet ? wallet.privateKey : "",
      password: hashedPassword,
      image: "String?",
      birthday: new Date(birthday),
      phone: phone,
      // mnemonicIsShown: false,
    },
  });

  await prisma.blockchainInfo.create({
    data: {
      mnemonic: wallet ? wallet.mnemonic?.phrase : "",
      privateKey: wallet ? wallet.privateKey : "",
      userId: newUser.id,
      mnemonicIsShown: false,
    },
  });
  //todo secrekey

  await sendVerificationCode(newUser.id, email);

  return {
    success: true,
    date: new Date(),
    message: "Verification code sent",
    data: { userId: newUser.id },
  };
};

const getAccessTokenKeycloak = async () => {
  const getTokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const reqData = {
    grant_type: "client_credentials",
    client_id: process.env.KEYCLOAK_CLIENT_ID,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
  };

  const {
    data: { access_token },
  } = await axios({
    url: getTokenUrl,
    data: reqData,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).catch((error) => {
    throw new Error(error);
  });
  return access_token;
};

const createUserWithKeycloack = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  birthday: string,
  type: Role = Role.CUSTOMER,
  image?: string,
): Promise<ApiResponse<any>> => {
  try {
    if (await getUserByEmail(email)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Bu Mail Hesabı Kullanılıyor, Lütfen Başka Bir Mail deneyiniz.",
      );
    }

    const createUserUrl = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;

    const access_token = await getAccessTokenKeycloak();

    // create keycloak user
    await axios({
      url: createUserUrl,
      data: {
        username: email,
        email,
        firstName: name,
        lastName: name,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
      },

      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).catch((error) => {
      throw new ApiError(httpStatus.CONFLICT, error.response.data.errorMessage);
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const wallet = await blockchainService.createMetamaskWallet();

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        type,
        status: false,
        bcAddress: wallet ? wallet.address : "",
        password: hashedPassword,
        image: "String?",
        birthday: new Date(birthday),
        phone,
      },
    });

    await prisma.blockchainInfo.create({
      data: {
        mnemonic: wallet ? wallet.mnemonic?.phrase : "",
        privateKey: wallet ? wallet.privateKey : "",
        userId: newUser.id,
        mnemonicIsShown: false,
      },
    });

    await sendVerificationCode(newUser.id, email);

    return {
      success: true,
      date: new Date(),
      message: "Keycloack user created",
      data: { userId: newUser.id },
    };
  } catch (error) {
    throw error;
  }
};

const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

const keycloakFindUser = async (adminAccessToken: string, email: string) => {
  let keycloakUserResponse;
  try {
    keycloakUserResponse = await axios({
      url: `${process.env.KEYCLOAK_URL}/admin/realms/${
        process.env.KEYCLOAK_REALM
      }/users?email=${encodeURIComponent(email)}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `Kullanıcısı arama hatası: ${
          error.response ? error.response.data : error.message
        }`,
      );
    } else {
      console.error(`Bilinmeyen hata: ${error}`);
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Kullanıcısı aranamadı",
    );
  }

  if (!keycloakUserResponse.data || keycloakUserResponse.data.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Kullanıcısı bulunamadı");
  }
  return keycloakUserResponse;
};

const verify = async (
  code: string,
  userId: string,
  password: string,
): Promise<ApiResponse<any>> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Kullanıcı bulunamadı");
    }

    const isValid = await verifyCode(userId, code);
    if (!isValid) {
      const verificationCode = await prisma.verificationCode.findMany({
        where: { userId: userId },
      });

      if (verificationCode) {
        await prisma.verificationCode.delete({
          where: { id: verificationCode[0].id },
        });
      }
      await prisma.blockchainInfo.delete({ where: { userId: userId } });
      await prisma.user.delete({ where: { id: userId } });
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Süresi dolmuş veya geçersiz kod",
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: true },
    });

    const adminAccessToken = await getAccessTokenKeycloak();

    const keycloakUserResponse = await keycloakFindUser(
      adminAccessToken,
      user.email,
    );

    const keycloakUserId = keycloakUserResponse.data[0].id;

    try {
      await axios({
        url: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakUserId}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          emailVerified: true,
          enabled: true,
          requiredActions: [],
        },
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          `Kullanıcısını güncelleme hatası: ${
            error.response ? error.response.data : error.message
          }`,
        );
      } else {
        console.error(`Bilinmeyen hata: ${error}`);
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Kullanıcısı güncellenemedi",
      );
    }
    let data = await keycloakLoginHelper(user.email, password);

    return {
      success: true,
      date: new Date(),
      message: "Doğrulama başarılı",
      data: { ...data, role: user.type, name: user.name, userId: user.id },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else {
      console.error(`Bilinmeyen hata: ${error}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "İç sunucu hatası");
    }
  }
};

const keycloakLoginHelper = async (username: string, password: string) => {
  const getTokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const loginData = {
    grant_type: "password",
    client_id: process.env.KEYCLOAK_CLIENT_ID,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    username: username,
    password: password,
  };
  const loginRequestData = qs.stringify(loginData);
  try {
    const { data } = await axios({
      url: getTokenUrl,
      data: loginRequestData,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `Kullanıcı girişi hatası: ${
          error.response ? error.response.data : error.message
        }`,
      );
    } else {
      console.error(`Bilinmeyen hata: ${error}`);
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, "Kullanıcısı girişi başarısız");
  }
};

const loginToKeycloak = async (
  username: string,
  password: string,
): Promise<ApiResponse<any>> => {
  try {
    const data = await keycloakLoginHelper(username, password);
    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Kullanıcı bulunamadı");
    }
    return {
      success: true,
      date: new Date(),
      message: "Doğrulama başarılı",
      data: { ...data, role: user.type, name: user.name, userId: user.id },
    };
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `Kullanıcı girişi hatası: ${
          error.response ? error.response.data : error.message
        }`,
      );
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Kullanıcısı girişi başarısız",
      );
    } else {
      console.error(`Bilinmeyen hata: ${error}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "İç sunucu hatası");
    }
  }
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
      // mnemonic: wallet ? wallet.mnemonic?.phrase : "",
      // privateKey: wallet ? wallet.privateKey : "",
      password: "",
      image: picture,
      // mnemonicIsShown: false,
    },
  });
  await prisma.blockchainInfo.create({
    data: {
      mnemonic: wallet ? wallet.mnemonic?.phrase : "",
      privateKey: wallet ? wallet.privateKey : "",
      userId: newUser.id,
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
    { userId: newUser.id, role: newUser.type, name: newUser.name },
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
      // mnemonic: "",
      // privateKey: "",
      password: hashedPassword,
      image: "String?",
      birthday: birthday,
      // mnemonicIsShown: true,
    },
  });

  await prisma.blockchainInfo.create({
    data: {
      mnemonic: "",
      privateKey: "",
      userId: newUser.id,
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
    { userId: newUser.id, role: newUser.type, name: newUser.name },
    "solyKey",
    {
      expiresIn: "1d",
    },
  );

  return { accessToken, userId: newUser.id };
};

const login = async (
  email: string,
  password: string,
): Promise<ApiResponse<string>> => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // const isPasswordMatch = await bcrypt.compare(password, user.password);

  // if (!isPasswordMatch) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  // }

  // const wallet = await blockchainService.createMetamaskWallet();

  const accessToken = jwt.sign(
    { userId: user.id, role: user.type, name: user.name },
    "solyKey",
    {
      expiresIn: "1d",
    },
  );

  return {
    success: true,
    date: new Date(),
    message: "SUCCESS",
    data: accessToken,
  };
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

const getUserByUsername = async <Key extends keyof User>(
  name: string,
  keys: Key[] = USER_KEYS as Key[],
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findFirst({
    where: { name },
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
  const user = await prisma.blockchainInfo.findUnique({
    where: { userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.mnemonicIsShown) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Kullanıcı bu işlemi gerçekleştiremez",
    );
  }

  const updatedUser = await prisma.blockchainInfo.update({
    where: { id: userId },
    data: {
      mnemonicIsShown: true,
    },
  });

  return { mnemonic: user.mnemonic, privateKey: user.privateKey };
};

const requestPasswordReset = async (
  email: string,
): Promise<ApiResponse<any>> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = generateResetToken();
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

  await prisma.passwordResetToken.create({
    data: {
      token: resetToken,
      expiresAt: resetTokenExpires,
      userId: user.id,
    },
  });

  // await sendResetEmail(email, resetToken);
  return {
    success: true,
    date: new Date(),
    message: "Verification successful",
    data: { resetToken: resetToken },
  };
};

const resetPassword = async (
  email: string,
  token: string,
  newPassword: string,
): Promise<ApiResponse<any>> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }
  const resetTokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token: token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!resetTokenRecord) {
    throw new Error("Kodun süresi dolmuştur");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: resetTokenRecord.userId },
    data: { password: hashedPassword },
  });

  const adminAccessToken = await getAccessTokenKeycloak();

  const keycloakUserResponse = await keycloakFindUser(
    adminAccessToken,
    user.email,
  );

  const keycloakUserId = keycloakUserResponse.data[0].id;
  try {
    await axios({
      url: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakUserId}/reset-password`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        type: "password",
        value: newPassword,
        temporary: false,
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `Keycloak şifre sıfırlama hatası: ${
          error.response ? error.response.data : error.message
        }`,
      );
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Keycloak şifre sıfırlama başarısız",
      );
    } else {
      console.error(`Bilinmeyen hata: ${error}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "İç sunucu hatası");
    }
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetTokenRecord.userId },
  });

  // const accessToken = jwt.sign(
  //   { userId: user.id, role: user.type, name: user.name },
  //   "solyKey",
  //   {
  //     expiresIn: "1d",
  //   },
  // );

  return {
    success: true,
    date: new Date(),
    message: "Verification successful",
    // data: accessToken,
  };
};

export default {
  createUser,
  createUserWithKeycloack,
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
  resetPassword,
  requestPasswordReset,
  loginToKeycloak,
};
