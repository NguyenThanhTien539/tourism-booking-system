const route = require("express").Router();
const tourController = require("../../controllers/admin/tour.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const tourValidate = require("../../validates/admin/tour.validate");
const multer = require("multer");
const upload = multer({ storage: cloudinaryHelper.storage });

route.get("/list", tourController.list);

route.get("/trash", tourController.trash);

route.get("/create", tourController.create);

route.get("/edit/:id", tourController.edit);

route.patch(
  "/edit/:id",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  tourValidate.createPost,
  tourController.editPatch
);

route.patch("/delete/:id", tourController.deletePatch);

route.patch("/undo/:id", tourController.undoPatch);

route.delete("/destroy/:id", tourController.destroyDelete);

route.patch("/change-multi/", tourController.changeMultiPatch);

route.post(
  "/create",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  tourValidate.createPost,
  tourController.createPost
);
module.exports = route;
