const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const membersSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    employeName: {
      type: String,
    },
    photo: {
      type: String,
    },
    projectDetailId: {
      type: String,
    },
    description: {
      type: String,
    },
    jobRole: {
      type: String,
      // enum: [
      //   "Senior Developer",
      //   "Frontend Developer",
      //   "Backend Developer",
      //   "Desining",
      //   "UI/UX",
      //   "Graphic Designer",
      //   "Bussiness devlopment",
      //   "sales",
      // ],
    },
    department: {
      type: String,
      // enum: ["Maarketing", "Development", "Designing"],
    },
    position: {
      type: String,
      // enum: [
      //   "Senior Developer",
      //   "Frontend Developer",
      //   "Backend Developer",
      //   "Desining",
      //   "UI/UX",
      //   "Graphic Designer",
      //   "Bussiness devlopment",
      //   "sales",
      // ],
    },
    joiningDate: {
      type: String,
    },
    ctc: {
      type: Number,
    },

    hourCost: {
      type: Number,
    },

    bankName: {
      type: String,
    },
    accholderName: {
      type: String,
    },
    accountNumber: {
      type: Number,
      // required: true,
      // match: [/^[0-9]{9,18}$/, "Please fill a valid account number"],
    },
    GSTCGST: {
      type: String,
    },
    panNumber: {
      type: String,
      // required: true,
      // match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please fill a valid PAN number"],
    },
    accountType: {
      type: String,
      // enum: ["Saving", "Current"],
    },
    IFSCCode: {
      type: String,
      // required: true,
      // match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please fill a valid IFSC code"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Members", membersSchema);
