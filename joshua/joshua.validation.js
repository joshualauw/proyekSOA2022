const Joi = require("joi");

const addWatchListValidate = (req, res, next) => {
  const schema = Joi.object({
    symbol: Joi.string().required(),
  });
  const validated = schema.validate(req.body);
  if (validated.error) {
    return res.status(400).send({ message: validated.error.details[0].message });
  }
  req.validated = validated.value;
  next();
};

module.exports = {
  addWatchListValidate,
};
