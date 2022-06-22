const {
  createOrder,
  cancelOrder,
  getOrder,
  setPriceNotification,
  getPriceNotification,
  updateNotification,
  getStock,
} = require("./ivan.controller");
const { checkToken } = require("../helpers/functions");
const Router = require("express").Router();
const Joi = require("joi");
const { orderSchema, alertSchema, searchSymbolSchema } = require("./schema");
const { AxiosError } = require("axios");

function genFormValidation(schema, reqName) {
  return (req, res, next) => {
    const validationResult = schema.validate(req[reqName]);
    
    if (validationResult.error) {
      return res
        .status(400)
        .send({ message: validationResult.error.details[0].message });
    } else {
      req.data = validationResult.value;
      next();
    }
  };
}

Router.post(
  "/order",
  [genFormValidation(orderSchema, 'body'), checkToken],
  createOrder
);
Router.delete("/order/:id", checkToken, cancelOrder);
Router.get("/order/:id?", checkToken, getOrder);
Router.get("/alert/:id?", [checkToken], getPriceNotification);
Router.post(
  "/alert",
  [genFormValidation(alertSchema, 'body'), checkToken],
  setPriceNotification
);
Router.put(
  "/alert/:id",
  [genFormValidation(alertSchema, 'body'), checkToken],
  updateNotification
);
Router.get(
  "/symbol/:q",
  [genFormValidation( searchSymbolSchema, 'query' ), checkToken],
  getStock
);

module.exports = Router;