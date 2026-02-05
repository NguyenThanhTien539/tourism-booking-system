const { City } = require("../../models/cities.model");
const { Tour } = require("../../models/tour.model");
const moment = require("moment");
module.exports.cart = (req, res) => {
  res.render("client/page/cart.pug", {
    pageTitle: "Giỏ hàng",
  });
};

module.exports.detail = async (req, res) => {
  try {
    const cartList = req.body;
    let detailedCartList = [];

    for (const item of cartList) {
      const detailedTour = await Tour.findOne({
        _id: item.tourId,
        status: "active",
        deleted: false,
      });

      const detailedCity = await City.findOne({
        _id: item.locationFrom,
      });

      detailedCartList.push({
        tourId: item.tourId,
        locationFrom: item.locationFrom,
        quantityAdult: item.stockAdult,
        quantityChildren: item.stockChildren,
        quantityBaby: item.stockBaby,
        avatar: detailedTour.avatar,
        name: detailedTour.name,
        departureDate: moment(detailedTour.departureDate).format("DD/MM/YYYY"),
        cityName: detailedCity.name,
        stockAdult: detailedTour.stockAdult,
        stockChildren: detailedTour.stockChildren,
        stockBaby: detailedTour.stockBaby,
        priceNewAdult: detailedTour.priceNewAdult,
        priceNewChildren: detailedTour.priceNewChildren,
        priceNewBaby: detailedTour.priceNewBaby,
        slug: detailedTour.slug,
      });
    }

    console.log(detailedCartList);
    res.json({
      code: "success",
      message: "Thành công",
      cart: detailedCartList,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Thất bại!",
    });
  }
};
