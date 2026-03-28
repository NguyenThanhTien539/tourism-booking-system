const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { AccountAdmin } = require("../../models/accounts-admin.model");
const generateHelper = require("../../helpers/generate.helper");
const mailHelper = require("../../helpers/mail.helper");
const { ForgotPassword } = require("../../models/forgot-password.model");

module.exports.login = (req, res) => {
  res.render("admin/pages/login.pug", {
    pageTitle: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  const existAccount = await AccountAdmin.findOne({ email: email });

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thông",
    });
    return;
  }

  const isPasswordValidate = await bcrypt.compare(
    password,
    existAccount.password,
  );

  if (!isPasswordValidate) {
    res.json({
      code: "error",
      message: "Mật khẩu không đúng",
    });
    return;
  }
  if (existAccount.status != "active") {
    res.json({
      code: "error",
      message: "Tài khoản chưa được kích hoạt",
    });
    return;
  }

  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword ? "7d" : "1d",
    },
  );

  res.cookie("token", token, {
    maxAge: rememberPassword ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });

  res.json({
    code: "success",
    message: "Đăng nhập thành công",
  });
  return;
};

module.exports.logoutPost = (req, res) => {
  res.clearCookie("token");
  res.json({
    code: "success",
    message: "Bạn đã đăng xuất thành công",
  });
};

module.exports.register = (req, res) => {
  res.render("admin/pages/register.pug", {
    pageTitle: "Đăng ký",
  });
};
module.exports.registerInitial = (req, res) => {
  res.render("admin/pages/register-initial.pug", {
    pageTitle: "Tài khoản đã được khởi tạo",
  });
};

module.exports.registerPost = async (req, res) => {
  const existAccount = await AccountAdmin.findOne({ email: req.body.email });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống",
    });
    return;
  }

  req.body.status = "initial";
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  req.body = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    status: req.body.status,
  };

  const newAccount = new AccountAdmin(req.body);
  await newAccount.save();

  res.json({
    code: "success",
    message: "Đăng ký tài khoản thành công",
  });
};

module.exports.forgotPassword = (req, res) => {
  res.render("admin/pages/forgot-password.pug", {
    pageTitle: "Quên mật khẩu ",
  });
};

module.exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;
  const existAccount = await AccountAdmin.findOne({ email: email });

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Không tồn tại email trong hệ thống",
    });
    return;
  }

  const existAccountInForgotPassword = await ForgotPassword.findOne({
    email: email,
  });

  if (existAccountInForgotPassword) {
    res.json({
      code: "error",
      message: "Vui lòng gửi lại yêu câu sau 5 phút",
    });
    return;
  }

  const length = 5;
  const otp = generateHelper.generateRandomNumber(length);

  const record = new ForgotPassword({
    email: email,
    otp: otp,
    expireAt: Date.now() + 5 * 60 * 1000,
  });
  await record.save();

  const title = "Mã OTP lấy lại mật khẩu";
  const content = `Mã OTP của bạn là <b>${otp}</b>. Mã OTP có hiệu lực trong 5 phút, vui lòng không cung cấp cho bất kỳ ai`;
  mailHelper.sendMail(email, title, content);

  res.json({
    code: "success",
    message: "Đã gửi OTP qua email của bạn",
  });
};

module.exports.otpPassword = (req, res) => {
  res.render("admin/pages/otp-password.pug", {
    pageTitle: "Nhập mã OTP",
  });
};

module.exports.otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;
  console.log(email);
  console.log(otp);
  const existRecord = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!existRecord) {
    res.json({
      code: "error",
      message: "Mã OTP không chính xác",
    });
    return;
  }

  const account = await AccountAdmin.findOne({ email: email });
  const token = jwt.sign(
    {
      id: account.id,
      email: account.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });

  res.json({
    code: "success",
    message: "Xác thực thành công",
  });
};

module.exports.resetPassword = (req, res) => {
  res.render("admin/pages/reset-password.pug", {
    pageTitle: "Đổi mật khẩu",
  });
};

module.exports.resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(password, salt);

  await AccountAdmin.updateOne(
    { _id: req.account.id },
    { password: newPassword },
  );

  res.json({
    code: "success",
    message: "Đổi mật khẩu thành công",
  });
};
