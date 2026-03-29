const { Category } = require("../../models/category.model");
const { AccountAdmin } = require("../../models/accounts-admin.model");
const categoryHelper = require("../../helpers/category.helper");
const moment = require("moment");
const slugify = require("slugify");

module.exports.list = async (req, res) => {
  const queries = req.query;
  const find = { deleted: false };
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
  }

  if (queries.keyword) {
    const keyword = slugify(queries.keyword);
    const keywordRegex = new RegExp(keyword, "i");
    find.slug = keywordRegex;
  }

  const limitedItems = 5;
  let page = 1;
  if (queries.page && queries.page > 0) {
    page = parseInt(queries.page);
  }
  const skip = (page - 1) * limitedItems;
  const totalRecord = await Category.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitedItems);
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };

  const categoryList = await Category.find(find).limit(limitedItems).skip(skip);
  for (const item of categoryList) {
    if (item.createdBy) {
      const infoAdmin = await AccountAdmin.findOne({
        _id: item.createdBy,
      });
      if (infoAdmin) item.createdByAdmin = infoAdmin.fullName;
    }

    if (item.updatedBy) {
      const infoAdmin = await AccountAdmin.findOne({
        _id: item.updatedBy,
      });
      if (infoAdmin) item.updatedByAdmin = infoAdmin.fullName;
    }

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }

  const userAdmin = await AccountAdmin.find({});

  res.render("admin/pages/category-list.pug", {
    pageTitle: "Quản lí danh mục",
    categoryList: categoryList,
    userAdmin: userAdmin,
    pagination: pagination,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({ deleted: false });

  const categoryTree = categoryHelper.buildTree(categoryList, "");

  res.render("admin/pages/category-create.pug", {
    pageTitle: "Tạo danh mục",
    categoryList: categoryTree,
  });
};

module.exports.createPost = async (req, res) => {
  if (req.body.position) req.body.position = parseInt(req.body.position);
  else {
    const totalRecord = await Category.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : "";
  const newRecord = new Category(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo danh mục thành công",
  });
};

module.exports.edit = async (req, res) => {
  try {
    const categoryList = await Category.find({ deleted: false });
    const categoryTree = categoryHelper.buildTree(categoryList, "");

    const { id } = req.params;
    const detailedCategory = await Category.findOne({
      _id: id,
      deleted: false,
    });

    res.render("admin/pages/category-edit.pug", {
      pageTitle: "Chỉnh sửa danh mục",
      categoryList: categoryTree,
      detailedCategory: detailedCategory,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/category/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    if (req.body.position) req.body.position = parseInt(req.body.position);
    else {
      const totalRecord = await Category.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.updatedBy = req.account.id;
    if (req.file) req.body.avatar = req.file.path;
    else {
      delete req.body.avatar;
    }
    await Category.updateOne({ _id: id, deleted: false }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật danh mục thành công",
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

    await Category.updateOne(
      { _id: id },
      { deleted: true, deletedBy: req.account.id, deletedAt: Date.now() },
    );

    res.json({
      code: "success",
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ",
    });
  }
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "active":
        await Category.updateMany({ _id: { $in: ids } }, { status: option });
        res.json({
          code: "success",
          message: "Đã cập nhật thành công",
        });
        break;
      case "inactive":
        await Category.updateMany({ _id: { $in: ids } }, { status: option });
        res.json({
          code: "success",
          message: "Đã cập nhật thành công",
        });
        break;
      case "delete":
        await Category.updateMany(
          { _id: { $in: ids } },
          { deleted: true, updatedAt: req.account.id, deletedAt: Date.now() },
        );
        res.json({
          code: "success",
          message: "Đã xóa thành công",
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
