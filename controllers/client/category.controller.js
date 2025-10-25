const { City } = require("../../models/cities.model");
const { Tour } = require("../../models/tour.model");
const { Category } = require("../../models/category.model");
const { getCategoryChild } = require("../../helpers/category.helper");
const moment = require("moment");
module.exports.list = async (req, res) => {
  const slug = req.params.slug;

  const detailedCategory = await Category.findOne({
    deleted: false,
    status: "active",
    slug: slug,
  });

  if (!detailedCategory) {
    res.redirect("/");
    return;
  }

  const getParentInformation = async (
    parentID,
    currentCount = 0,
    limitedCount = 3
  ) => {
    if (!parentID || currentCount >= limitedCount) return [];

    const parentRecord = await Category.findOne({
      deleted: false,
      status: "active",
      _id: parentID,
    });

    if (!parentRecord) return [];

    const parents = await getParentInformation(
      parentRecord.parent,
      currentCount + 1,
      limitedCount
    );

    parents.push({ name: parentRecord.name, slug: parentRecord.slug });

    return parents;
  };

  const breadcrumbList = await getParentInformation(detailedCategory.parent, 0);
  breadcrumbList.push({
    name: detailedCategory.name,
    slug: detailedCategory.slug,
    avatar: detailedCategory.avatar,
  });

  const getTourListByCategory = async (parentCategoryId, limit = 8) => {
    if (!parentCategoryId) return [];

    // Lấy danh mục cha
    const detailedCategory = await Category.findOne({
      deleted: false,
      status: "active",
      _id: parentCategoryId,
    });

    if (!detailedCategory) return [];

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
          "DD/MM/YYYY"
        );

      if (item.priceAdult && item.priceNewAdult) {
        item.discount = Math.floor(
          ((item.priceAdult - item.priceNewAdult) / item.priceAdult) * 100
        );
      }
    });

    return tours;
  };

  const tourListByCategory = await getTourListByCategory(detailedCategory.id);

  const destinationList = await City.find({}).sort({ name: "asc" });

  res.render("client/page/tour-list", {
    pageTitle: detailedCategory.name,
    detailedCategory: detailedCategory,
    breadcrumbList: breadcrumbList,
    tourListByCategory: tourListByCategory,
    destinationList: destinationList,
  });
};
