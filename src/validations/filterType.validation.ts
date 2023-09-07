import Joi from "joi";

const getCategoryTypeById = {
  query: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
}


export default {
  getCategoryTypeById
}
