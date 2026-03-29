const { Tour } = require("../../models/tour.model");
const { TourSections } = require("../../models/tour.section.model");
const { getCategoryChild } = require("../../helpers/category.helper");
const { Category } = require("../../models/category.model");
const moment = require("moment");

module.exports.home = async (req, res) => {
  //section 2
  const featuredTourListSection2 = await Tour.find({
    deleted: false,
    status: "active",
  }).limit(5);
  featuredTourListSection2.forEach((item) => {
    if (item.departureDate)
      item.departureDateFormat = moment(item.departureDate).format(
        "DD/MM/YYYY",
      );
    if (item.priceAdult && item.priceNewAdult) {
      const discount = Math.floor(
        ((item.priceAdult - item.priceNewAdult) / item.priceAdult) * 100,
      );
      item.discount = discount;
    }
  });
  //end section2

  const getTourListByCategory = async (parentCategoryId, limit = 8) => {
    if (!parentCategoryId) {
      return { tours: [], detailedCategory: null };
    }

    // Lấy danh mục cha
    const detailedCategory = await Category.findOne({
      deleted: false,
      status: "active",
      _id: parentCategoryId,
    });

    if (!detailedCategory) {
      return { tours: [], detailedCategory: null };
    }

    // Lấy danh mục con
    const childCategories = await getCategoryChild(parentCategoryId);
    const childCategoryIds = childCategories.map((item) => item.id);

    // Lấy danh sách tour
    const tours = await Tour.find({
      deleted: false,
      status: "active",
      category: {
        $in: [parentCategoryId, ...childCategoryIds],
      },
    }).limit(limit);

    // Format dữ liệu
    tours.forEach((item) => {
      if (item.departureDate)
        item.departureDateFormat = moment(item.departureDate).format(
          "DD/MM/YYYY",
        );

      if (item.priceAdult && item.priceNewAdult) {
        item.discount = Math.floor(
          ((item.priceAdult - item.priceNewAdult) / item.priceAdult) * 100,
        );
      }
    });

    return { tours, detailedCategory };
  };

  const tourSections = await TourSections.findOne({});
  //section4
  const {
    tours: tourListSection4,
    detailedCategory: detailedCategorySection4,
  } = await getTourListByCategory(tourSections.tourSection4);
  //end section 4

  //section 6
  const {
    tours: tourListSection6,
    detailedCategory: detailedCategorySection6,
  } = await getTourListByCategory(tourSections.tourSection6);
  //end section 6

  res.render("client/page/home.pug", {
    pageTitle: "Trang chủ",
    featuredTourListSection2: featuredTourListSection2,
    tourListSection4: tourListSection4,
    detailedCategorySection4: detailedCategorySection4,
    tourListSection6: tourListSection6,
    detailedCategorySection6: detailedCategorySection6,
  });
};
