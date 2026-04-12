module.exports.pathAdmin = "admin";

module.exports.permissionList = [
  {
    label: "Xem trang tổng quan",
    value: "dashboard-view",
  },
  {
    label: "Xem danh mục",
    value: "category-view",
  },
  {
    label: "Tạo danh mục",
    value: "category-create",
  },
  {
    label: "Sửa danh mục",
    value: "category-edit",
  },
  {
    label: "Xóa danh mục",
    value: "category-delete",
  },
  {
    label: "Xem danh sách tour",
    value: "tour-list",
  },
  {
    label: "Tạo danh sách tour",
    value: "tour-create",
  },
  {
    label: "Xóa danh sách tour",
    value: "tour-delete",
  },
  {
    label: "Chỉnh sửa sách tour",
    value: "tour-edit",
  },
  {
    label: "Thùng rác tour",
    value: "tour-trash",
  },
];

module.exports.paymentMethodList = [
  {
    label: "Tiền mặt",
    value: "money",
  },
  {
    label: "Chuyển khoản",
    value: "bank",
  },
  {
    label: "Ví Momo",
    value: "momo",
  },
  {
    label: "ZaloPay",
    value: "zalopay",
  },
];

module.exports.paymentStatusList = [
  {
    label: "Chưa thanh toán",
    value: "unpaid",
  },
  {
    label: "Đã thanh toán",
    value: "paid",
  },
];

module.exports.statusList = [
  {
    label: "Khởi tạo",
    value: "initial",
    color: "orange",
  },
  {
    label: "Hoàn thành",
    value: "done",
    color: "green",
  },
  {
    label: "Đã hủy",
    value: "cancel",
    color: "red",
  },
];
