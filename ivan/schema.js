const Joi = require("joi");

const {
  SIDE_BUY,
  SIDE_SELL,
  TYPE_MARKET,
  TYPE_LIMIT,
  ALERT_ABOVE,
  ALERT_BELOW,
  T_STOCK,
  T_CRYPTO,
  T_FOREX
} = require("./utils");

const orderSchema = Joi.object({
  side: Joi.string().valid(SIDE_BUY, SIDE_SELL).required(),
  type: Joi.string().valid(TYPE_MARKET, TYPE_LIMIT).required(),
  symbol: Joi.string().min(2).max(10).required().uppercase(),
  exchange: Joi.string().required().uppercase(),
  qty: Joi.number().required(),
  price: Joi.alternatives().conditional("type", {
    is: TYPE_LIMIT,
    then: Joi.number().required(),
    otherwise: Joi.forbidden(),
  }),
});

const alertSchema = Joi.object({
  
  exchange: Joi.string().required().uppercase(),
  symbol: Joi.string().min(2).max(10).required().uppercase(),
  type: Joi.string().valid(ALERT_ABOVE, ALERT_BELOW).required(),
  price: Joi.number().required(),
  email: Joi.string().email().optional(),
  note: Joi.string().optional(),
});

const searchSymbolSchema = Joi.object({
  currency: Joi.string().optional().length(3).uppercase(),
  type: Joi.string().valid(T_STOCK, T_CRYPTO).required(),

})

module.exports = {
  orderSchema,
  alertSchema,
  searchSymbolSchema
};
