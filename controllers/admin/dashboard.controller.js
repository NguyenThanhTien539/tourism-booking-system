const { AccountAdmin } = require("../../models/accounts-admin.model");
const { Order } = require("../../models/order.model");

module.exports.dashboard = async (req, res) => {
  const overview = {
    totalAdmin: 0,
    totalOrder: 0,
    totalRevenue: 0,
  };

  overview.totalAdmin = await AccountAdmin.countDocuments({
    deleted: false,
  });

  const orderList = await Order.find({
    deleted: false,
  });

  overview.totalOrder = orderList.length;
  overview.totalRevenue = orderList.reduce(
    (total, item) => total + item.total,
    0,
  );

  res.render("admin/pages/dashboard.pug", {
    pageTitle: "Tổng quan",
    overview: overview,
  });
};

module.exports.revenueChartPost = async (req, res) => {
  const { currentMonth, currentYear, previousMonth, previousYear, arrayDay } =
    req.body;

  const orderCurrentMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1),
    },
  });

  const orderPreviousMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(previousYear, previousMonth - 1, 1),
      $lt: new Date(previousYear, previousMonth, 1),
    },
  });

  const dataMonthCurrent = [];
  const dataMonthPrevious = [];
  for (const day of arrayDay) {
    let revenueCurrent = 0;
    for (const order of orderCurrentMonth) {
      const orderDate = new Date(order.createdAt).getDate();
      if (orderDate == day) {
        revenueCurrent += order.total;
      }
    }
    dataMonthCurrent.push(revenueCurrent);

    let revenuePrevious = 0;
    for (const order of orderPreviousMonth) {
      const orderDate = new Date(order.createdAt).getDate();
      if (orderDate == day) {
        revenuePrevious += order.total;
      }
    }
    dataMonthPrevious.push(revenuePrevious);
  }

  res.json({
    code: "success",
    message: "Thành công!",
    dataMonthCurrent: dataMonthCurrent,
    dataMonthPrevious: dataMonthPrevious,
  });
};
