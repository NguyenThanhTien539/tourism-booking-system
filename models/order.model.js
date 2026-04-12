const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    code: String,
    fullName: String,
    phone: String,
    note: String,
    items: Array,
    subTotal: Number,
    discount: Number,
    total: Number,
    paymentMethod: String,
    paymentStatus: String,
    status: String,
    updatedBy: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", schema, "orders");

module.exports.Order = Order;
