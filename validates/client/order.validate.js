const Joi = require("joi");

module.exports.createPost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().trim().min(5).max(50).required().messages({
      "string.empty": "Vui lòng nhập họ tên!",
      "string.min": "Họ tên phải có ít nhất 5 ký tự!",
      "string.max": "Họ tên không được vượt quá 50 ký tự!",
    }),
    phone: Joi.string()
      .trim()
      .replace(/\s+/g, "")
      .pattern(/^((84)|0[35789])[0-9]{8}$/)
      .required()
      .messages({
        "string.empty": "Vui lòng nhập số điện thoại!",
        "string.pattern.base": "Số điện thoại không đúng định dạng!",
      }),
  }).unknown(true);

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    convert: true,
  });

  if (error) {
    const errorMessage = error.details[0].message;
    return res.json({
      code: "error",
      message: errorMessage,
    });
  }

  req.body.fullName = value.fullName;
  req.body.phone = value.phone;

  next();
};
