const { Category } = require("../../models/category.model");
const { Tour } = require("../../models/tour.model");
const { City } = require("../../models/cities.model");
const moment = require("moment");

module.exports.detail = async (req, res) => {
  const slug = req.params.slug;

  const detailedTour = await Tour.findOne({
    deleted: false,
    status: "active",
    slug: slug,
  });

  const getBreadcrumbList = async (parentId, count = 3) => {
    if (!parentId || count >= 3) return [];

    const detailedCategory = await Category.findOne({
      _id: parentId,
      deleted: false,
      status: "active",
    });

    if (!detailedCategory) return [];

    const breadcrumbList = await getBreadcrumbList(
      detailedCategory.parent,
      count + 1
    );

    breadcrumbList.push({
      name: detailedCategory.name,
      slug: detailedCategory.slug,
    });

    return breadcrumbList;
  };

  const breadcrumbList = await getBreadcrumbList(detailedTour.category, 0);
  breadcrumbList.push({
    name: detailedTour.name,
    slug: detailedTour.slug,
    avatar: detailedTour.avatar,
  });

  const locationNameList = await City.find({
    _id: { $in: detailedTour.locations },
  });

  if (detailedTour.departureDate) {
    const formatDepartureDate = moment(detailedTour.departureDate).format(
      "DD/MM/YYYY"
    );
    detailedTour.formatDepartureDate = formatDepartureDate;
  }

  res.render("client/page/tour-detail.pug", {
    pageTitle: "Chi tiết tour",
    breadcrumbList: breadcrumbList,
    detailedTour: detailedTour,
    locationNameList: locationNameList,
  });
};
