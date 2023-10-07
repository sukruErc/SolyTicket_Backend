import { Role } from "@prisma/client";
import Joi from "joi";

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.CUSTOMER, Role.ORGANIZER),
    phone: Joi.string().required(),
    birthday: Joi.string().required(),
  }),
};

const createMetamaskUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    wallet: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.CUSTOMER, Role.ORGANIZER),
    birthday: Joi.string().required(),
  }),
};

const createGoogleUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    picture: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.CUSTOMER, Role.ORGANIZER),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

export default {
  createUser,
  createMetamaskUser,
  createGoogleUser,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
