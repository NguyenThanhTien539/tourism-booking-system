const { Order } = require("../../models/order.model");
const { Tour } = require("../../models/tour.model");
const { City } = require("../../models/cities.model");
const {
  paymentMethodList,
  paymentStatusList,
  statusList,
} = require("../../config/variable.config");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  const orderList = await Order.find(find).sort({
    createdAt: "desc",
  });

  for (const orderDetail of orderList) {
    const paymentMethodInfo = paymentMethodList.find(
      (item) => item.value == orderDetail.paymentMethod,
    );
    orderDetail.paymentMethodName = paymentMethodInfo
      ? paymentMethodInfo.label
      : orderDetail.paymentMethod;

    const paymentStatusInfo = paymentStatusList.find(
      (item) => item.value == orderDetail.paymentStatus,
    );
    orderDetail.paymentStatusName = paymentStatusInfo
      ? paymentStatusInfo.label
      : orderDetail.paymentStatus;

    orderDetail.statusInfo = statusList.find(
      (item) => item.value == orderDetail.status,
    ) || {
      label: orderDetail.status,
      color: "orange",
    };

    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm");
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format(
      "DD/MM/YYYY",
    );

    for (const item of orderDetail.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId,
      });
      if (tourInfo) {
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
      }
    }
  }

  res.render("admin/pages/order-list.pug", {
    pageTitle: "Quản lý đơn hàng",
    orderList: orderList,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false,
    });

    if (!orderDetail) {
      res.redirect(`/${pathAdmin}/order/list`);
      return;
    }

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format(
      "YYYY-MM-DDTHH:mm",
    );

    for (const item of orderDetail.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId,
      });
      if (tourInfo) {
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
        item.departureDateFormat = moment(item.departureDate).format(
          "DD/MM/YYYY",
        );

        const city = await City.findOne({
          _id: item.locationFrom,
        });

        item.cityName = city ? city.name : "";
      }
    }

    res.render("admin/pages/order-edit.pug", {
      pageTitle: `Đơn hàng: ${orderDetail.code}`,
      orderDetail: orderDetail,
      paymentMethodList: paymentMethodList,
      paymentStatusList: paymentStatusList,
      statusList: statusList,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/order/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Order.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhật đơn hàng thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
