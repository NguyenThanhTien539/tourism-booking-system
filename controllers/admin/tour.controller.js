const { Category } = require("../../models/category.model");
const categoryHelper = require("../../helpers/category.helper");
const { City } = require("../../models/cities.model");
const { Tour } = require("../../models/tour.model");
const moment = require("moment");
const { AccountAdmin } = require("../../models/accounts-admin.model");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  const tourList = await Tour.find(find).sort({
    position: "desc",
  });

  for (const item of tourList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.createdBy,
      });
      if (infoAccount) {
        item.createdByFullName = infoAccount.fullName;
      }
    }

    if (item.updatedBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.updatedBy,
      });
      if (infoAccount) {
        item.updatedByFullName = infoAccount.fullName;
      }
    }

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/tour-list.pug", {
    pageTitle: "Quản lý tour",
    tourList: tourList,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });

  const categoryTree = categoryHelper.buildTree(categoryList, "");

  const cityList = await City.find({});

  res.render("admin/pages/tour-create.pug", {
    pageTitle: "Tạo tour",
    categoryList: categoryTree,
    cityList: cityList,
  });
};

module.exports.createPost = async (req, res) => {
  if (!req.permissions.includes("tour-create")) {
    res.json({
      code: "error",
      message: "Không có quyền!",
    });
    return;
  }

  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalRecord = await Tour.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  if (req.files && req.files.avatar && req.files.avatar.length > 0) {
    req.body.avatar = req.files.avatar[0].path;
  } else {
    req.body.avatar = "";
  }

  if (req.files && req.files.images && req.files.images.length > 0) {
    req.body.images = req.files.images.map((item) => item.path);
  } else {
    req.body.images = [];
  }

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
    message: "Tạo tour thành công!",
  });
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };

  const tourList = await Tour.find(find).sort({
    position: "desc",
  });

  for (const item of tourList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.createdBy,
      });
      if (infoAccount) {
        item.createdByFullName = infoAccount.fullName;
      }
    }

    if (item.deletedBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.deletedBy,
      });
      if (infoAccount) {
        item.deletedByFullName = infoAccount.fullName;
      }
    }

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/tour-trash.pug", {
    pageTitle: "Thùng rác tour",
    tourList: tourList,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false,
    });

    if (tourDetail.departureDate) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format(
        "YYYY-MM-DD",
      );
    }

    const categoryList = await Category.find({
      deleted: false,
    });

    const categoryTree = categoryHelper.buildTree(categoryList, "");

    const cityList = await City.find({});

    res.render("admin/pages/tour-edit.pug", {
      pageTitle: "Chỉnh sửa tour",
      tourDetail: tourDetail,
      categoryList: categoryTree,
      cityList: cityList,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    if (!req.permissions.includes("tour-edit")) {
      res.json({
        code: "error",
        message: "Không có quyền!",
      });
      return;
    }

    const id = req.params.id;

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
      req.body.avatar = req.files.avatar[0].path;
    } else {
      delete req.body.avatar;
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map((item) => item.path);
    } else {
      delete req.body.images;
    }

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

    await Tour.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhật tour thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    if (!req.permissions.includes("tour-delete")) {
      res.json({
        code: "error",
        message: "Không có quyền!",
      });
      return;
    }

    const id = req.params.id;

    await Tour.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );

    res.json({
      code: "success",
      message: "Xóa tour thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.undoPatch = async (req, res) => {
  try {
    if (!req.permissions.includes("tour-trash")) {
      res.json({
        code: "error",
        message: "Không có quyền!",
      });
      return;
    }

    const id = req.params.id;

    await Tour.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục tour thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.destroyDelete = async (req, res) => {
  try {
    if (!req.permissions.includes("tour-trash")) {
      res.json({
        code: "error",
        message: "Không có quyền!",
      });
      return;
    }

    const id = req.params.id;

    await Tour.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "active":
      case "inactive":
        if (!req.permissions.includes("tour-edit")) {
          res.json({
            code: "error",
            message: "Không có quyền!",
          });
          return;
        }

        await Tour.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: option,
          },
        );

        res.json({
          code: "success",
          message: "Cập nhật trạng thái thành công!",
        });
        break;
      case "undo":
        if (!req.permissions.includes("tour-trash")) {
          res.json({
            code: "error",
            message: "Không có quyền!",
          });
          return;
        }

        await Tour.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: false,
          },
        );

        res.json({
          code: "success",
          message: "Đã khôi phục thành công!",
        });
        break;
      case "delete":
        if (!req.permissions.includes("tour-delete")) {
          res.json({
            code: "error",
            message: "Không có quyền!",
          });
          return;
        }

        await Tour.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
            deletedBy: req.account.id,
            deletedAt: Date.now(),
          },
        );

        res.json({
          code: "success",
          message: "Đã xóa thành công!",
        });
        break;
      case "destroy":
        if (!req.permissions.includes("tour-trash")) {
          res.json({
            code: "error",
            message: "Không có quyền!",
          });
          return;
        }

        await Tour.deleteMany({
          _id: { $in: ids },
        });

        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn!",
        });
        break;
      default:
        res.json({
          code: "error",
          message: "Hành động không hợp lệ!",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};
