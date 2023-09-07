import Joi from "joi";

const createPendingEvent = {
  body: Joi.object().keys({
    date: Joi.date().required(),
    desc: Joi.string().required(),
    eventName: Joi.string().required(),
    image: Joi.string().required(),
    locationId: Joi.string().required(),
    eventAddress: Joi.string().required(),
    price: Joi.string().required(),
    searchTitle: Joi.string().required(),
    seatNum: Joi.number().required(),
    time: Joi.string().required(),
    userId: Joi.string().required(),
    categoryId: Joi.string().required(),
    eventCategoryTypeId: Joi.string().required(),
    ticketPriceEntity: Joi.object().required(),
  }),
};

const updatePendingEvent = {
  body: Joi.object().keys({
    eventId: Joi.date().required(),
    date: Joi.date().required(),
    desc: Joi.string().required(),
    eventName: Joi.string().required(),
    image: Joi.string().required(),
    locationId: Joi.string().required(),
    eventAddress: Joi.string().required(),
    price: Joi.string().required(),
    searchTitle: Joi.string().required(),
    seatNum: Joi.number().required(),
    time: Joi.string().required(),
    categoryId: Joi.string().required(),
    eventCategoryTypeId: Joi.string().required(),
    ticketPriceEntit: Joi.object().required(),
  }),
};

const getById = {
  creatorId: Joi.string().required(),
}

const getEventId = {
  eventId: Joi.string().required(),
}



export default {
  createPendingEvent,
  updatePendingEvent,
  getById,
  getEventId
};
