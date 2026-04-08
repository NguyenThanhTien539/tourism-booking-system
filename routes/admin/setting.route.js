const route = require("express").Router();
const settingController = require("../../controllers/admin/setting.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const roleValidate = require("../../validates/admin/role.validate");
const accountAdminValidate = require("../../validates/admin/account-admin.validate");

const multer = require("multer");
const upload = multer({ storage: cloudinaryHelper.storage });

route.get("/list", settingController.list);

route.get("/website-info", settingController.websiteInfo);

route.patch(
  "/website-info",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  settingController.websiteInfoPatch
);

route.get("/account-admin/list", settingController.accountAdminList);
route.get("/account-admin/trash", settingController.accountAdminTrash);

route.get("/account-admin/create", settingController.accountAdminCreate);

route.get("/account-admin/edit/:id", settingController.accountAdminEdit);

route.patch(
  "/account-admin/edit/:id",
  upload.single("avatar"),
  settingController.accountAdminEditPatch
);

route.post(
  "/account-admin/create",
  upload.single("avatar"),
  settingController.accountAdminCreatePost
);

route.patch(
  "/account-admin/delete/:id",
  accountAdminValidate.idParam,
  settingController.accountAdminDeletePatch
);
route.patch(
  "/account-admin/undo/:id",
  accountAdminValidate.idParam,
  settingController.accountAdminUndoPatch
);
route.delete(
  "/account-admin/destroy/:id",
  accountAdminValidate.idParam,
  settingController.accountAdminDestroyDelete
);
route.patch(
  "/account-admin/change-multi",
  accountAdminValidate.changeMultiPatch,
  settingController.accountAdminChangeMultiPatch
);

route.get("/role/list", settingController.roleList);
route.get("/role/trash", settingController.roleTrash);

route.get("/role/create", settingController.roleCreate);

route.post(
  "/role/create",
  roleValidate.roleBodyPost,
  settingController.roleCreatePost
);

route.get("/role/edit/:id", settingController.roleEdit);

route.get("/tour/section", settingController.tourSection);
route.post("/tour/section", settingController.tourSectionPost);

route.patch(
  "/role/edit/:id",
  roleValidate.roleIdParam,
  roleValidate.roleBodyPost,
  settingController.roleEditPatch
);

route.patch("/role/delete/:id", roleValidate.roleIdParam, settingController.roleDeletePatch);
route.patch("/role/undo/:id", roleValidate.roleIdParam, settingController.roleUndoPatch);
route.delete("/role/destroy/:id", roleValidate.roleIdParam, settingController.roleDestroyDelete);
route.patch("/role/change-multi", roleValidate.roleChangeMultiPatch, settingController.roleChangeMultiPatch);

module.exports = route;
