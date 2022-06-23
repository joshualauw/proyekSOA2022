const {
  createOrder,
  cancelOrder,
  getOrder,
  setPriceAlert,
  getPriceAlert,
  updateAlert,
  getStock,
  deleteAlert,
  getOrderById,
  getPriceAlertById,
} = require("./ivan.controller");
const { checkToken, permitPremiumUser } = require("../helpers/functions");
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
  [genFormValidation(orderSchema, "body"), checkToken, permitPremiumUser],
  createOrder
);
Router.delete("/order/:id", [checkToken, permitPremiumUser], cancelOrder);
Router.get("/order/", [checkToken, permitPremiumUser], getOrder);

Router.get("/order/:id", [checkToken, permitPremiumUser], getOrderById);
Router.get("/alert/", [checkToken, permitPremiumUser], getPriceAlert);
Router.get("/alert/:id", [checkToken, permitPremiumUser], getPriceAlertById);
Router.post(
  "/alert",
  [genFormValidation(alertSchema, "body"), checkToken, permitPremiumUser],
  setPriceAlert
);
Router.put(
  "/alert/:id",
  [genFormValidation(alertSchema, "body"), checkToken, permitPremiumUser],
  updateAlert
);
Router.delete("/alert/:id", [checkToken, permitPremiumUser], deleteAlert);
Router.get(
  "/symbol/:q",
  [genFormValidation(searchSymbolSchema, "query"), checkToken],
  getStock
);
module.exports = Router;
