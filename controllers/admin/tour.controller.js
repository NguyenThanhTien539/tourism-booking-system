const { Category } = require("../../models/category.model");
const categoryHelper = require("../../helpers/category.helper");
const { City } = require("../../models/cities.model");
const { Tour } = require("../../models/tour.model");
const { AccountAdmin } = require("../../models/accounts-admin.model");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {};
  const queries = req.query;
  const infoAdmins = await AccountAdmin.find({});
  find.deleted = false;
  if (queries.status) {
    find.status = queries.status;
  }

  if (queries.createdBy) {
    find.createdBy = queries.createdBy;
  }

  if (queries.startDate || queries.endDate) {
    find.createdAt = {};
    if (queries.startDate) {
      find.createdAt.$gte = moment(queries.startDate).toDate();
    }

    if (queries.endDate) {
      find.createdAt.$lte = moment(queries.endDate).toDate();
    }
    // console.log(new Date(queries.startDate));
    // console.log(moment(queries.startDate).toDate());
  }

  const tourList = await Tour.find(find);

  for (const tour of tourList) {
    if (tour.createdBy) {
      const infoAdmin = await AccountAdmin.findOne({ _id: tour.createdBy });
      if (infoAdmin) tour.createdByAdmin = infoAdmin.fullName;
    }

    if (tour.updatedBy) {
      const infoAdmin = await AccountAdmin.findOne({ _id: tour.updatedBy });
      if (infoAdmin) tour.updatedByAdmin = infoAdmin.fullName;
    }

    tour.createdAtFormat = moment(tour.createdAt).format("HH:mm - DD/MM/YYYY");
    tour.updatedAtFormat = moment(tour.updatedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/tour-list.pug", {
    pageTitle: "Quản lý tour",
    tourList: tourList,
    infoAdmins: infoAdmins,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const categoryList = await Category.find({ deleted: false });
    const categoryTree = categoryHelper.buildTree(categoryList, "");
    const cityList = await City.find({});

    const { id } = req.params;
    const detailedTour = await Tour.findOne({
      _id: id,
      deleted: false,
    });

    detailedTour.departureDateFormat = moment(
      detailedTour.departureDate,
    ).format("YYYY-MM-DD");

    res.render("admin/pages/tour-edit.pug", {
      pageTitle: "Chỉnh sửa danh mục",
      categoryTree: categoryTree,
      detailedTour: detailedTour,
      cityList: cityList,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const { id } = req.params;

    const totalRecord = await Tour.countDocuments({});

    if (req.files && req.files.avatar && req.files.avatar.length > 0)
      req.body.avatar = req.files.avatar[0].path;
    else {
      delete req.body.avatar;
    }

    if (req.files && req.files.images && req.files.images.length > 0)
      req.body.images = req.files.images.map((item) => item.path);
    else {
      delete req.body.avatar;
    }

    req.body.position = req.body.position
      ? parseInt(req.body.position)
      : totalRecord + 1;

    req.body.priceAdult = req.body.priceAdult
      ? parseInt(req.body.priceAdult)
      : 0;

    req.body.priceChildren = req.body.priceChildren
      ? parseInt(req.body.priceChildren)
      : 0;

    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;

    req.body.priceNewAdult = req.body.priceNewAdult
      ? parseInt(req.body.priceNewAdult)
      : req.body.priceAdult;

    req.body.priceNewChildren = req.body.priceNewChildren
      ? parseInt(req.body.priceNewChildren)
      : req.body.priceChildren;

    req.body.priceNewBaby = req.body.priceNewBaby
      ? parseInt(req.body.priceNewBaby)
      : req.body.priceBaby;

    req.body.stockAdult = req.body.stockAdult
      ? parseInt(req.body.stockAdult)
      : 0;

    req.body.stockChildren = req.body.stockChildren
      ? parseInt(req.body.stockChildren)
      : 0;

    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

    req.body.locations = req.body.locations
      ? JSON.parse(req.body.locations)
      : [];

    req.body.departureDate = req.body.departureDate
      ? new Date(req.body.departureDate)
      : null;

    req.body.schedules = req.body.schedules
      ? JSON.parse(req.body.schedules)
      : [];

    req.body.updatedBy = req.account.id;

    await Tour.updateOne({ _id: id, deleted: false }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật tour thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ",
    });
  }
};

module.exports.undoPatch = async (req, res) => {
  try {
    const { id } = req.params;

    await Tour.updateOne({ _id: id }, { deleted: false });

    res.json({
      code: "success",
      message: "Khôi phục tour thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ",
    });
  }
};

module.exports.destroyDelete = async (req, res) => {
  try {
    const { id } = req.params;

    await Tour.deleteOne({ _id: id });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const { id } = req.params;

    await Tour.updateOne(
      { _id: id },
      { deleted: true, deletedBy: req.account.id, deletedAt: Date.now() },
    );

    res.json({
      code: "success",
      message: "Xóa tour thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ",
    });
  }
};

module.exports.trash = async (req, res) => {
  const find = {};
  const queries = req.query;
  const infoAdmins = await AccountAdmin.find({});
  find.deleted = true;

  const tourList = await Tour.find(find);

  for (const tour of tourList) {
    if (tour.createdBy) {
      const infoAdmin = await AccountAdmin.findOne({ _id: tour.createdBy });
      if (infoAdmin) tour.createdByAdmin = infoAdmin.fullName;
    }

    if (tour.deletedBy) {
      const infoAdmin = await AccountAdmin.findOne({ _id: tour.deletedBy });
      if (infoAdmin) tour.deletedByAdmin = infoAdmin.fullName;
    }

    tour.createdAtFormat = moment(tour.createdAt).format("HH:mm - DD/MM/YYYY");
    tour.deletedAtFormat = moment(tour.deletedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/tour-trash.pug", {
    pageTitle: "Thùng rác tour",
    tourList: tourList,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({ deleted: false });
  const categoryTree = categoryHelper.buildTree(categoryList, "");

  const cityList = await City.find({});

  res.render("admin/pages/tour-create.pug", {
    pageTitle: "Tạo tour",
    categoryTree: categoryTree,
    cityList: cityList,
  });
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "active":
        await Tour.updateMany({ _id: { $in: ids } }, { status: option });
        res.json({
          code: "success",
          message: "Đã cập nhật thành công",
        });
        break;
      case "inactive":
        await Tour.updateMany({ _id: { $in: ids } }, { status: option });
        res.json({
          code: "success",
          message: "Đã cập nhật thành công",
        });
        break;
      case "delete":
        await Tour.updateMany(
          { _id: { $in: ids } },
          { deleted: true, updatedAt: req.account.id, deletedAt: Date.now() },
        );
        res.json({
          code: "success",
          message: "Đã xóa thành công",
        });
        break;
      case "undo":
        await Tour.updateMany({ _id: { $in: ids } }, { deleted: false });
        res.json({
          code: "success",
          message: "Đã khôi phục thành công",
        });
        break;

      case "destroy":
        await Tour.deleteMany({ _id: { $in: ids } });
        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn",
        });
        break;
      default:
        res.json({
          code: "error",
          code: "Hành động không hợp lệ",
        });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: "ID không hợp lệ",
    });
  }
};

module.exports.createPost = async (req, res) => {
  if (!req.permissions.includes("tour-create")) {
    res.json({
      code: "error",
      message: "Không có quyền",
    });
    return;
  }
  const totalRecord = await Tour.countDocuments({});

  if (req.files && req.files.avatar && req.files.avatar.length > 0)
    req.body.avatar = req.files.avatar[0].path;
  else {
    req.body.avatar = "";
  }

  if (req.files && req.files.images && req.files.images.length > 0)
    req.body.images = req.files.images.map((item) => item.path);
  else {
    req.body.images = "";
  }

  req.body.position = req.body.position
    ? parseInt(req.body.position)
    : totalRecord + 1;

  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;

  req.body.priceChildren = req.body.priceChildren
    ? parseInt(req.body.priceChildren)
    : 0;

  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;

  req.body.priceNewAdult = req.body.priceNewAdult
    ? parseInt(req.body.priceNewAdult)
    : req.body.priceAdult;

  req.body.priceNewChildren = req.body.priceNewChildren
    ? parseInt(req.body.priceNewChildren)
    : req.body.priceChildren;

  req.body.priceNewBaby = req.body.priceNewBaby
    ? parseInt(req.body.priceNewBaby)
    : req.body.priceBaby;

  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;

  req.body.stockChildren = req.body.stockChildren
    ? parseInt(req.body.stockChildren)
    : 0;

  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];

  req.body.departureDate = req.body.departureDate
    ? new Date(req.body.departureDate)
    : null;

  req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;

  const newRecord = new Tour(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "thành công",
  });
};
