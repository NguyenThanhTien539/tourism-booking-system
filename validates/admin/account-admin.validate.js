const Joi = require("joi");

module.exports.idParam = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().length(24).hex().required().messages({
      "string.empty": "ID không hợp lệ",
      "string.length": "ID không hợp lệ",
      "string.hex": "ID không hợp lệ",
      "any.required": "ID không hợp lệ",
    }),
  });

  const { error } = schema.validate(req.params);
  if (error) {
    return res.json({
      code: "error",
      message: error.details[0].message,
    });
  }

  next();
};

module.exports.changeMultiPatch = (req, res, next) => {
  const schema = Joi.object({
    option: Joi.string()
      .valid("active", "inactive", "delete", "undo", "destroy")
      .required()
      .messages({
        "any.only": "Hành động không hợp lệ",
        "string.empty": "Hành động không hợp lệ",
        "any.required": "Hành động không hợp lệ",
      }),
    ids: Joi.array()
      .items(Joi.string().length(24).hex().required())
      .min(1)
      .required()
      .messages({
        "array.base": "Danh sách ID không hợp lệ",
        "array.min": "Danh sách ID không hợp lệ",
        "any.required": "Danh sách ID không hợp lệ",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({
      code: "error",
      message: error.details[0].message,
    });
  }

  next();
};
