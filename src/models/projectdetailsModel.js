const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const projectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    projectName: {
      type: String,
    },
    clientid: {
      type: String,
    },
    selectClients: {
      type: String,
    },
    startingDate: {
      type: String,
    },
    projectExpenses:{
      type:[Object],
      default:[]
    },
    completionDate: {
      type: String,
    },
    sellingPrice: {
      type: Number,
    },
    eastimatedPrice: {
      type: Number,
    },
    advance: {
      type: Number,
    },
    collectiondue: {
      type: Number,
    },
    services: {
      type: String,
      // enum: ["Development", "Designing", "Marketing", "Hosting"],
    },
    Status: {
      type: String,
      // enum: ["In Progress", "Completed", "Not Started"],
    },
    proForma: {
      type: Number,
    },
    invoice: {
      type: Number,
    },
    GSTCGST: {
      type: String,
    },
    losses: {
      type: Number,
    },

    totalprojectProfit:{
      type:Number,
      default:0,
    },
    totalexpense:{
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
module.exports = mongoose.model("Project", projectSchema);
