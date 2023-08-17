import Joi from "joi"

const getEventById = {
    params: Joi.object().keys({
        eventId: Joi.string().required(),
    }),
}

const getEventByCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().required(),
    }),
}



const getEventByCategoryType = {
    params: Joi.object().keys({
        categoryTypeId: Joi.string().required(),
    }),
}

const getEventByNameSearch = {
    params: Joi.object().keys({
        eventName: Joi.string().required(),
    }),
}

export default {
    getEventById,
    getEventByCategory,
    getEventByCategoryType,
    getEventByNameSearch
}
