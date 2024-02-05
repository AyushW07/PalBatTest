const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const hourSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    memberId: {
      type: String,
      // unique: true,
    },
    projectDetailId: {
      type: String,
    },

    employeName: {
      type: String,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    Hoursday: {
      type: Number,
      default: 0,
    },
    jobRole: {
      type: String,
      
    },
    hourCost: {
      type: Number,
      default: 0,
    },
    costhour: {
      type: Number,
      default: 0,
    },
    totalCost:{
      type:Number,
      default:0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Hours", hourSchema);
