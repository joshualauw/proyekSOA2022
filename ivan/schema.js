const Joi = require('joi');

const {
    SIDE_BUY,
    SIDE_SELL,
    TYPE_MARKET,
    TYPE_LIMIT,
    ALERT_ABOVE,
    ALERT_BELOW
  } = require('./utils')

const orderSchema = Joi.object({
    side: Joi.string().valid(SIDE_BUY, SIDE_SELL).required() ,
    type: Joi.string().valid(TYPE_MARKET, TYPE_LIMIT).required(),
    symbol : Joi.string().min(2).max(10).required().uppercase(),
    exchange : Joi.string().optional().uppercase(),    
    qty  : Joi.number().required(),
    price: Joi.alternatives().conditional('type',
        {
            is: TYPE_LIMIT,
            then: Joi.number().required(),
            otherwise: Joi.forbidden()
        })
})

const alertSchema = Joi.object({
    exchange : Joi.string().optional().uppercase(),    
    symbol : Joi.string().min(2).max(10).required().uppercase(),
    type: Joi.string().valid(ALERT_ABOVE, ALERT_BELOW).required(),
    email  : Joi.string().email().required(),
    price: Joi.number().required()
})

module.exports = {
    orderSchema, alertSchema
}