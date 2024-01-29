const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const expensesSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    expenseName: {
      type: String,
    },
    addAmount: {
      type: Number,
    },
    selectDate: {
      type: Date,
    },
    byWhom: {
      type: String,
    },
    addReason: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Expenses", expensesSchema);
