const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const clientSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    clienteName: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },

    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Complete", "Ongoing", "Not Started", "awaiting pay"],
    },
    Poc: {
      type: String,
      enum: ["Jyoti", "Abhishek", "Rishab", "Srivatsva"],
    },
    bankName: {
      type: String,
      required: true,
    },
    accholderName: {
      type: String,
      required: true,
    },

    accountNumber: {
      type: Number,
      required: true,
      // match: [/^[0-9]{9,18}$/, "Please fill a valid account number"],
    },
    GSTCGST: {
      type: String,
    },
    panNumber: {
      type: String,
      required: true,
      // match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please fill a valid PAN number"],
    },
    accountType: {
      type: String,
      enum: ["Saving", "Current"],
    },
    IFSCCode: {
      type: String,
      required: true,
      // match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please fill a valid IFSC code"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Client", clientSchema);
