const { WebsiteInfo } = require("../../models/setting-website-info.model");
const { permissionList, pathAdmin } = require("../../config/variable.config");
const { Role } = require("../../models/role.model");
const { Category } = require("../../models/category.model");
const { AccountAdmin } = require("../../models/accounts-admin.model");
const categoryHelper = require("../../helpers/category.helper");

const bcrypt = require("bcryptjs");
const { TourSections } = require("../../models/tour.section.model");

module.exports.list = (req, res) => {
  res.render("admin/pages/setting-list.pug", {
    pageTitle: "Cài đặt chung",
  });
};

module.exports.websiteInfo = async (req, res) => {
  const settingWebsiteInfo = await WebsiteInfo.findOne({});
  res.render("admin/pages/setting-website-info.pug", {
    pageTitle: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo,
  });
};

module.exports.websiteInfoPatch = async (req, res) => {
  console.log(req.files);
  if (req.files && req.files.logo) {
    req.body.logo = req.files.logo[0].path;
  }

  if (req.files && req.files.favicon) {
    req.body.favicon = req.files.favicon[0].path;
  }

  const totalRecord = await WebsiteInfo.findOne({});
  if (!totalRecord) {
    const newRecord = new WebsiteInfo(req.body);
    await newRecord.save();
  } else {
    await WebsiteInfo.updateOne({ _id: totalRecord.id }, req.body);
  }

  res.json({
    code: "success",
    message: "Cập nhật thành công",
  });
};

module.exports.accountAdminList = async (req, res) => {
  const accountAdminList = await AccountAdmin.find({ deleted: false });

  if (accountAdminList) {
    for (const item of accountAdminList) {
      if (item.role) {
        const roleInfo = await Role.findOne({ _id: item.role });
        if (roleInfo) item.roleName = roleInfo.name;
      }
    }
  }

  res.render("admin/pages/setting-account-admin-list.pug", {
    pageTitle: "Tài khoản quản trị",
    accountAdminList: accountAdminList,
  });
};

module.exports.accountAdminCreate = async (req, res) => {
  const roleList = await Role.find({ deleted: false });

  res.render("admin/pages/setting-account-admin-create.pug", {
    pageTitle: "Tạo tài khoản quản trị",
    roleList: roleList,
  });
};

module.exports.accountAdminCreatePost = async (req, res) => {
  const existAccount = await AccountAdmin.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Tài khoản đã tồn tại",
    });
    return;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : "";

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  const newRecord = new AccountAdmin(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo thành công",
  });
};

module.exports.accountAdminEdit = async (req, res) => {
  // console.log("haha");
  try {
    const { id } = req.params;
    const detailedAccountAdmin = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    const roleList = await Role.find({
      deleted: false,
    });

    res.render(`admin/pages/setting-account-admin-edit.pug`, {
      pageTitle: "Chỉnh sửa trang tài khoản quản trị",
      detailedAccountAdmin: detailedAccountAdmin,
      roleList: roleList,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const { id } = req.params;

    const existEmail = await AccountAdmin.findOne({
      _id: { $ne: id },
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Tồn tại email trong hệ thống",
      });
      return;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } else {
      delete req.body.password;
    }

    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    req.body.updatedBy = req.account.id;

    await AccountAdmin.updateOne({ _id: id, deleted: false }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Lỗi bảng ghi",
    });
  }
};

module.exports.roleList = async (req, res) => {
  const queries = req.query;
  const find = { deleted: false };

  if (queries.keyword) {
    const keywordRegex = new RegExp(queries.keyword, "i");
    find.$or = [{ name: keywordRegex }, { description: keywordRegex }];
  }

  const limitedItems = 5;
  let page = parseInt(queries.page) || 1;
  if (page < 1) page = 1;

  const totalRecord = await Role.countDocuments(find);
  const totalPage = Math.max(1, Math.ceil(totalRecord / limitedItems));
  if (page > totalPage) page = totalPage;

  const skip = (page - 1) * limitedItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
    currentPage: page,
    startItem: totalRecord === 0 ? 0 : skip + 1,
    endItem: Math.min(skip + limitedItems, totalRecord),
  };

  const roleList = await Role.find(find).limit(limitedItems).skip(skip);

  res.render("admin/pages/setting-role-list.pug", {
    pageTitle: "Nhóm quyền",
    roleList: roleList,
    pagination: pagination,
  });
};

module.exports.roleCreate = async (req, res) => {
  res.render("admin/pages/setting-role-create.pug", {
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionList,
  });
};

module.exports.roleCreatePost = async (req, res) => {
  try {
    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;

    const newRecord = new Role(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Đã tạo thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Lỗi dữ liệu",
    });
  }
};

module.exports.roleEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({ _id: id, deleted: false });
    if (!role) {
      res.redirect(`/${pathAdmin}/setting/role/list`);
    }

    res.render("admin/pages/setting-role-edit.pug", {
      pageTitle: "Chỉnh sửa nhóm quyền nhóm quyền",
      permissionList: permissionList,
      role: role,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
};

module.exports.roleEditPatch = async (req, res) => {
  try {
    const { id } = req.params;

    const existRecord = await Role.findOne({ _id: id, deleted: false });
    if (!existRecord) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ",
      });
    }
    req.body.updatedBy = req.account.id;
    await Role.updateOne({ _id: id, deleted: false }, req.body);
    res.json({
      code: "success",
      message: "Chỉnh sửa thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};

module.exports.roleDeletePatch = async (req, res) => {
  try {
    const { id } = req.params;

    const existRecord = await Role.findOne({ _id: id, deleted: false });
    if (!existRecord) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ",
      });
    }

    await Role.updateOne(
      { _id: id },
      { deleted: true, deletedBy: req.account.id, deletedAt: Date.now() },
    );

    res.json({
      code: "success",
      message: "Xóa thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};

module.exports.roleTrash = async (req, res) => {
  const queries = req.query;
  const find = { deleted: true };

  if (queries.keyword) {
    const keywordRegex = new RegExp(queries.keyword, "i");
    find.$or = [{ name: keywordRegex }, { description: keywordRegex }];
  }

  const limitedItems = 5;
  let page = parseInt(queries.page) || 1;
  if (page < 1) page = 1;

  const totalRecord = await Role.countDocuments(find);
  const totalPage = Math.max(1, Math.ceil(totalRecord / limitedItems));
  if (page > totalPage) page = totalPage;

  const skip = (page - 1) * limitedItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
    currentPage: page,
    startItem: totalRecord === 0 ? 0 : skip + 1,
    endItem: Math.min(skip + limitedItems, totalRecord),
  };

  const roleList = await Role.find(find).limit(limitedItems).skip(skip);

  for (const role of roleList) {
    if (role.deletedBy) {
      const infoAdmin = await AccountAdmin.findOne({ _id: role.deletedBy });
      if (infoAdmin) role.deletedByAdmin = infoAdmin.fullName;
    }
  }

  res.render("admin/pages/setting-role-trash.pug", {
    pageTitle: "Thùng rác nhóm quyền",
    roleList: roleList,
    pagination: pagination,
  });
};

module.exports.roleUndoPatch = async (req, res) => {
  try {
    const { id } = req.params;

    await Role.updateOne(
      { _id: id, deleted: true },
      { deleted: false, deletedBy: "", deletedAt: null },
    );

    res.json({
      code: "success",
      message: "Khôi phục thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};

module.exports.roleDestroyDelete = async (req, res) => {
  try {
    const { id } = req.params;

    await Role.deleteOne({ _id: id, deleted: true });

    res.json({
      code: "success",
      message: "Xóa vĩnh viễn thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};

module.exports.roleChangeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "delete":
        await Role.updateMany(
          { _id: { $in: ids }, deleted: false },
          { deleted: true, deletedBy: req.account.id, deletedAt: Date.now() },
        );
        res.json({
          code: "success",
          message: "Đã xóa thành công",
        });
        break;
      case "undo":
        await Role.updateMany(
          { _id: { $in: ids }, deleted: true },
          { deleted: false, deletedBy: "", deletedAt: null },
        );
        res.json({
          code: "success",
          message: "Đã khôi phục thành công",
        });
        break;
      case "destroy":
        await Role.deleteMany({ _id: { $in: ids }, deleted: true });
        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn thành công",
        });
        break;
      default:
        res.json({
          code: "error",
          message: "Hành động không hợp lệ",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: "error",
      message: "ID không hợp lệ",
    });
  }
};

module.exports.tourSection = async (req, res) => {
  const tourSections = await TourSections.findOne({});
  const categoryList = await Category.find({ deleted: false });
  const categoryTree = categoryHelper.buildTree(categoryList, "");
  res.render("admin/pages/setting-tour-section.pug", {
    pageTitle: "Cài đặt chung",
    categoryList: categoryTree,
    tourSection4: tourSections.tourSection4,
    tourSection6: tourSections.tourSection6,
  });
};

module.exports.tourSectionPost = async (req, res) => {
  const existRecord = await TourSections.findOne({});
  if (existRecord) {
    console.log(existRecord.id);
    await TourSections.updateOne({ _id: existRecord.id }, req.body);
  } else {
    const newRecord = new TourSections(req.body);
    await newRecord.save();
  }

  res.json({ code: "success", message: "Thành công" });
};
