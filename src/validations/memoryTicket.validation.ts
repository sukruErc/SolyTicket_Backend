import Joi from "joi";

const createMemoryContract = {
  body: Joi.object().keys({
    contractName: Joi.string().required(),
    numberOfTickets: Joi.number().required(),
    tag: Joi.string().required(),
  }),
};

const createMemoryTicket = {
  body: Joi.object().keys({
    displayName: Joi.string().required(),
    activityName: Joi.string().required(),
  }),
};

export default {
  createMemoryContract,
  createMemoryTicket,
};
