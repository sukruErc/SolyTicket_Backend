import { query } from "express";
import Joi from "joi";

const getEventById = {
  params: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

const getEventByCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};

const getEventByCategoryType = {
  params: Joi.object().keys({
    categoryTypeId: Joi.string().required(),
  }),
};

const getEventByNameSearch = {
  params: Joi.object().keys({
    eventName: Joi.string().required(),
  }),
};

const getEventsByFilter = {
  query: Joi.object().keys({
    locationId: Joi.string(),
    page: Joi.number().required(),
    size: Joi.number().required(),
    endDate: Joi.string(),
    categoryTypeId: Joi.string(),
    sortBy: Joi.string().valid("date", "eventName"),
    sortOrder: Joi.string().valid("asc", "desc"),
  }),
};

export default {
  getEventById,
  getEventByCategory,
  getEventByCategoryType,
  getEventByNameSearch,
  getEventsByFilter,
};
