const moment = require("moment");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const qs = require("qs");

const { generateRandomNumber } = require("../../helpers/generate.helper");
const { sortObject } = require("../../helpers/sort.helper");
const { Order } = require("../../models/order.model");
const { Tour } = require("../../models/tour.model");
const { City } = require("../../models/cities.model");
const {
  paymentMethodList,
  paymentStatusList,
  statusList,
} = require("../../config/variable.config");

const normalizeBaseUrl = (value) => {
  return (value || "").trim().replace(/\/+$/, "");
};

module.exports.createPost = async (req, res) => {
  try {
    req.body.code = "OD" + generateRandomNumber(10);
    req.body.subTotal = 0;

    for (const item of req.body.items) {
      const itemInfo = await Tour.findOne({
        _id: item.tourId,
        deleted: false,
        status: "active",
      });

      if (itemInfo) {
        item.priceNewAdult = itemInfo.priceNewAdult;
        item.priceNewChildren = itemInfo.priceNewChildren;
        item.priceNewBaby = itemInfo.priceNewBaby;

        req.body.subTotal +=
          item.priceNewAdult * item.quantityAdult +
          item.priceNewChildren * item.quantityChildren +
          item.priceNewBaby * item.quantityBaby;

        item.departureDate = itemInfo.departureDate;

        await Tour.updateOne(
          {
            _id: item.tourId,
          },
          {
            stockAdult: itemInfo.stockAdult - item.quantityAdult,
            stockChildren: itemInfo.stockChildren - item.quantityChildren,
            stockBaby: itemInfo.stockBaby - item.quantityBaby,
          },
        );
      }
    }

    req.body.discount = 0;
    req.body.total = req.body.subTotal - req.body.discount;

    req.body.paymentStatus = "unpaid";
    req.body.status = "initial";

    const newRecord = new Order(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Chúc mừng bạn đã đặt hành thành công!",
      orderCode: req.body.code,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đặt hàng không thành công!",
    });
  }
};

module.exports.success = async (req, res) => {
  const { orderCode, phone } = req.query;

  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone,
  });

  if (!orderDetail) {
    res.redirect("/");
    return;
  }

  orderDetail.paymentMethodName = paymentMethodList.find(
    (item) => item.value == orderDetail.paymentMethod,
  ).label;

  orderDetail.paymentStatusName = paymentStatusList.find(
    (item) => item.value == orderDetail.paymentStatus,
  ).label;

  orderDetail.statusName = statusList.find(
    (item) => item.value == orderDetail.status,
  ).label;

  orderDetail.createdAtFormat = moment(orderDetail.createdAt).format(
    "HH:mm - DD/MM/YYYY",
  );

  for (const item of orderDetail.items) {
    const tourInfo = await Tour.findOne({
      _id: item.tourId,
    });

    if (tourInfo) {
      item.avatar = tourInfo.avatar;
      item.name = tourInfo.name;
      item.slug = tourInfo.slug;
      item.departureDateFormat = moment(item.departureDate).format(
        "DD/MM/YYYY",
      );

      const city = await City.findOne({
        _id: item.locationFrom,
      });

      item.cityName = city ? city.name : "";
    }
  }

  res.render("client/page/order-success.pug", {
    pageTitle: "Đặt hàng thành công",
    orderDetail: orderDetail,
  });
};

module.exports.paymentZaloPay = async (req, res) => {
  try {
    const { orderCode, phone } = req.query;

    const orderDetail = await Order.findOne({
      code: orderCode,
      phone: phone,
    });

    if (!orderDetail) {
      res.redirect("/");
      return;
    }

    const config = {
      app_id: process.env.ZALOPAY_APP_ID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: `${process.env.ZALOPAY_ENDPOINT}/v2/create`,
    };

    const websiteDomain = normalizeBaseUrl(process.env.WEBSITE_DOMAIN);

    //zalopay callback to this url after payment completion
    const callbackDomain = normalizeBaseUrl(process.env.ZALOPAY_CALLBACK_URL);

    if (
      !config.app_id ||
      !config.key1 ||
      !config.key2 ||
      !config.endpoint ||
      !websiteDomain ||
      !callbackDomain
    ) {
      console.log("Missing ZaloPay env config");
      res.json({
        code: "error",
        message: "Cấu hình thanh toán ZaloPay chưa đầy đủ!",
      });
      return;
    }

    const embed_data = {
      redirecturl: `${websiteDomain}/order/success?orderCode=${orderCode}&phone=${phone}`,
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: `${phone}-${orderCode}`,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng ${orderCode}`,
      bank_code: "",
      callback_url: `${callbackDomain}/order/payment-zalopay-result`,
    };

    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order });
    if (response.data.return_code == 1) {
      res.redirect(response.data.order_url);
      return;
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

module.exports.paymentZaloPayResultPost = async (req, res) => {
  const config = {
    key2: process.env.ZALOPAY_KEY2,
  };

  const result = {};

  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    if (!dataStr || !reqMac || !config.key2) {
      result.return_code = 0;
      result.return_message = "payload or config invalid";
      res.json(result);
      return;
    }

    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      const dataJson = JSON.parse(dataStr);
      const [phone, orderCode] = dataJson.app_user.split("-");

      if (!phone || !orderCode) {
        throw new Error("invalid app_user");
      }

      await Order.updateOne(
        {
          phone: phone,
          code: orderCode,
        },
        {
          paymentStatus: "paid",
        },
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
  }

  res.json(result);
};

module.exports.paymentVNPay = async (req, res) => {
  try {
    const { orderCode, phone } = req.query;

    const orderDetail = await Order.findOne({
      code: orderCode,
      phone: phone,
    });

    if (!orderDetail) {
      return res.redirect("/");
    }

    const websiteDomain = normalizeBaseUrl(process.env.WEBSITE_DOMAIN);
    const tmnCode = process.env.VNPAY_TMNCODE;
    const secretKey = process.env.VNPAY_SECRET_KEY;
    const vnpUrlConfig = process.env.VNPAY_URL;

    if (!websiteDomain || !tmnCode || !secretKey || !vnpUrlConfig) {
      return res.json({
        code: "error",
        message: "Cấu hình thanh toán VNPay chưa đầy đủ!",
      });
    }

    const createDate = moment().utcOffset(7).format("YYYYMMDDHHmmss");
    const expireDate = moment()
      .utcOffset(7)
      .add(15, "minutes")
      .format("YYYYMMDDHHmmss");

    const rawIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      "127.0.0.1";

    const ipAddr = String(rawIp)
      .split(",")[0]
      .trim()
      .replace(/^::ffff:/, "");

    const returnUrl = `${websiteDomain}/order/payment-vnpay-result`;

    // TxnRef chỉ giữ ký tự chữ+số
    const safeOrderCode = String(orderCode || "").replace(/[^A-Za-z0-9]/g, "");
    const safePhone = String(phone || "").replace(/[^A-Za-z0-9]/g, "");
    const orderId = `${safePhone}${safeOrderCode}${Date.now()}`.slice(0, 100);

    const amount = Number(orderDetail.total);

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${safeOrderCode || orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    vnp_Params.vnp_SecureHash = signed;

    const vnpUrl = `${vnpUrlConfig}?${qs.stringify(vnp_Params, { encode: false })}`;

    return res.redirect(vnpUrl);
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
};

module.exports.paymentVNPayResult = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNPAY_SECRET_KEY;
    const websiteDomain = normalizeBaseUrl(process.env.WEBSITE_DOMAIN);

    if (!secretKey || !websiteDomain) {
      res.redirect("/");
      return;
    }

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      if (
        vnp_Params.vnp_TransactionStatus == "00" &&
        vnp_Params.vnp_ResponseCode == "00"
      ) {
        const [phone, orderCode] = (vnp_Params.vnp_TxnRef || "").split("-");

        if (!phone || !orderCode) {
          res.redirect("/");
          return;
        }

        await Order.updateOne(
          {
            phone: phone,
            code: orderCode,
          },
          {
            paymentStatus: "paid",
          },
        );

        res.redirect(
          `${websiteDomain}/order/success?orderCode=${orderCode}&phone=${phone}`,
        );
        return;
      }
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
