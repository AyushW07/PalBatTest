const clientModel = require("../models/clientModel");
const hoursModel = require("../models/hoursModel");
const memberModel = require("../models/memberModel");
const projectExpenseModel = require("../models/projectExpenseModel");
const projectdetailsModel = require("../models/projectdetailsModel");
const express = require("express");
const router = express.Router();

router.post("/V1/proDetails", async (req, res) => {
  try {
    let Data = req.body;
    const {
      projectName,
      selectClients,
      startingDate,
      completionDate,
      sellingPrice,
      eastimatedPrice,
      advance,
      collectiondue,
      services,
      Status,
      proForma,
      losses,

      invoice,
      GSTCGST,
    } = Data;
    if (
      (!projectName,
      !selectClients,
      !startingDate,
      !completionDate,
      !sellingPrice,
      !eastimatedPrice,
      !advance,
      !collectiondue,
      !services,
      !Status,
      !proForma,
      !invoice,
      !losses,
      !GSTCGST)
    )
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const projectDetail = new projectdetailsModel(Data);
    await projectDetail.save();

    return res.status(201).send({
      status: true,
      message: "ProjectDetail created successfully",
      data: projectDetail,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.get("/V1/getallData", async (req, res) => {
  try {
    const client = await clientModel.find({ isDeleted: false });
    const project = await projectdetailsModel.find();
    return res.status(200).send({ client, project });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//calculate profit
router.get("/V1/getprofit/:projectDetailId", async (req, res) => {
  try {
    const projectDetailId = req.params.projectDetailId; // Get projectDetailId from URL params

    // Fetch the project details
    const projectDetails = await projectdetailsModel.findOne({
      id: projectDetailId,
      isDeleted: false,
    });
    if (!projectDetails) {
      return res
        .status(404)
        .send({ status: false, message: "Project not found" });
    }

    // Fetch hour entries related to the project
    const hoursDetails = await hoursModel.find({
      projectDetailId: projectDetailId,
      isDeleted: false,
    });
    let totalCostHour = 0;
    hoursDetails.forEach((hour) => {
      totalCostHour += hour.costhour;
    });

    // Fetch expenses related to the project
    let projectExpenses = await projectExpenseModel.find({
      projectDetailId: projectDetailId,
      isDeleted: false,
    });
    let totalExpense = 0;
    projectExpenses.forEach((expense) => {
      totalExpense += expense.amount;
    });

    // Calculate total cost for the project (employee costs + project expenses)
    let totalCost = totalExpense + totalCostHour;

    // Calculate profit for the project
    let profit = projectDetails.sellingPrice - totalCost;

    // if (profit < 0) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: `Project losses ${profit}` });
    // }
    return res.status(200).send({
      status: true,
      projectDetailId: projectDetailId,
      sellingPrice: projectDetails.sellingPrice,
      totalCostHour: totalCostHour,
      totalExpense: totalExpense,
      totalCost: totalCost,
      profit: profit,
      projectName: projectDetails.projectName,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// calculate the total amount Total amount spend on projects due on the project,gstcgst,amount generated
router.get("/V1/getallamount", async (req, res) => {
  try {
    const projectDetails = await projectdetailsModel.find({ isDeleted: false });
    if (!projectDetails || projectDetails.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "No projects found" });
    }
    let totalAmountGenerated = 0;
    let totalGSTCGST = 0;

    projectDetails.forEach((project) => {
      totalAmountGenerated += project.sellingPrice;
      const gstPercentage = parseFloat(project.GSTCGST.replace("%", "")) / 100;
      totalGSTCGST += project.sellingPrice * gstPercentage;
    });

    let totalcollectiondue = 0;
    projectDetails.forEach((project) => {
      totalcollectiondue += project.collectiondue;
    });

    const hoursDetails = await hoursModel.find({ isDeleted: false });
    let totalhours = 0;
    hoursDetails.forEach((hours) => {
      totalhours += hours.costhour;
    });
    const projectExpenses = await projectExpenseModel.find({
      isDeleted: false,
    });
    let totalExpense = 0;
    projectExpenses.forEach((expense) => {
      totalExpense += expense.amount;
    });
    let totalcost = totalhours + totalExpense;

    return res.status(200).send({
      status: true,
      projectDetails,
      totalAmountGenerated,
      totalcollectiondue,
      totalcost,
      totalGSTCGST,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.get("/V1/project/:projectDetailId", async (req, res) => {
  try {
    const projectDetailId = req.params.projectDetailId;

    const projectId = await projectdetailsModel.findOne({
      id: projectDetailId,
      // isDeleted: false,
    });
    return res
      .status(200)
      .send({ status: true, msg: "Data fetch succesfully", data: projectId });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.put("/V1/updateData/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const project = await projectdetailsModel.findOne({ id: id });
    if (!project) {
      return res.status(404).send({ status: false, msg: "member not found" });
    }

    const updatedData = await projectdetailsModel.findOneAndUpdate(
      { id: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).send(updatedData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.delete("/V1/projectDelate", async (req, res) => {
  try {
    const result = await projectdetailsModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} project`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, msg: "server error", error: err.message });
  }
});

router.delete("/V1/projectDelate/:projectDetailId", async (req, res) => {
  try {
    let projectDetailId = req.params.projectDetailId;

    projectDetailId = Number(projectDetailId);
    const page = await projectdetailsModel.findOne({
      id: projectDetailId,
      isDeleted: false,
    });
    if (!page) {
      return res
        .status(404)
        .send({ status: false, message: `Page not found or already deleted` });
    }
    await projectdetailsModel.findOneAndDelete({ id: projectDetailId });

    return res
      .status(200)
      .send({ status: true, message: `Data deleted successfully.` });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, msg: "Server error", error: err.message });
  }
});

module.exports = router;
