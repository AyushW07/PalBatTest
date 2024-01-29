const clientModel = require("../models/clientModel");
const expensesModel = require("../models/expensesModel");
const express = require("express");
const memberModel = require("../models/memberModel");
const projectdetailsModel = require("../models/projectdetailsModel");
const hoursModel = require("../models/hoursModel");
const router = express.Router();

router.post("/V1/expensesdata", async (req, res) => {
  try {
    const { expenseName, addAmount, selectDate, byWhom, addReason } = req.body;
    if ((!expenseName, !addAmount, !selectDate, !byWhom, !addReason))
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const expensesData = new expensesModel(req.body);
    await expensesData.save();
    return res.status(201).send(expensesData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// This api calcultae amonth month and year  wise

router.get("/V1/monthlyProfitSummary", async (req, res) => {
  try {
    const projects = await projectdetailsModel.find({ isDeleted: false });
    const hours = await hoursModel.find({ isDeleted: false });
    const expenses = await expensesModel.find({ isDeleted: false });

    let totalSellingPrice = 0;
    let totalCollectionDue = 0;
    let totalCost = 0;
    let totalExpenses = 0;

    // Calculate total selling price and collection due from projects
    projects.forEach((project) => {
      totalSellingPrice += project.sellingPrice;
      totalCollectionDue += project.collectiondue;
    });

    // Calculate total cost from hours
    hours.forEach((hour) => {
      totalCost += hour.costhour;
    });

    // Calculate total expenses
    expenses.forEach((expense) => {
      totalExpenses += expense.addAmount; // Make sure 'addAmount' is the correct field
    });

    // Calculate total profit
    const totalProfit = totalSellingPrice - (totalCost + totalExpenses);

    return res.status(200).send({
      status: true,
      monthlyProfitSummary: {
        totalSellingPrice,
        totalCollectionDue,
        totalCost,
        totalExpenses,
        totalProfit,
      },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.get("/V1/expenses/:expenseid", async (req, res) => {
  try {
    const expensesid = req.params.expenseid;

    const expensesdata = await expensesModel.findOne({
      id: expensesid,
      // isDeleted: false,
    });
    return res.status(200).send(expensesdata);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.put("/V1/updateexpense/:expenseid", async (req, res) => {
  try {
    const expensesid = req.params.expenseid;

    console.log(expensesid);
    const clientExists = await expensesModel.findOne({ id: expensesid });

    const updatedData = await expensesModel.findOneAndUpdate(
      { id: expensesid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).send(updatedData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.delete("/V1/expensesDelate", async (req, res) => {
  try {
    const result = await expensesModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} expensedata`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, msg: "server error", error: err.message });
  }
});

router.delete("/V1/expensesDelate/:expenseid", async (req, res) => {
  try {
    let expensesid = req.params.expenseid;

    expensesid = Number(expensesid);
    const page = await expensesModel.findOne({
      id: expensesid,
      isDeleted: false,
    });
    if (!page) {
      return res
        .status(404)
        .send({ status: false, message: `Page not found or already deleted` });
    }
    const data = await expensesModel.findOneAndDelete({ id: expensesid });

    return res.status(200).send(data);
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, msg: "Server error", error: err.message });
  }
});

// router.get("/V1/getallData", async (req, res) => {
//   try {
//     const client = await clientModel.find();
//     const member = await memberModel.find();
//     return res.status(200).send({ client, member });
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
// });
module.exports = router;
