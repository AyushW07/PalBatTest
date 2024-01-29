const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const projectexpenseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    expenseName: {
      type: String,
    },
    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
    reason: {
      type: String,
    },
    projectDetailId: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Projectexpense", projectexpenseSchema);
