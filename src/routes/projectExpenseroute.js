const projectExpenseModel = require("../models/projectExpenseModel");
const projectExpense = require("../models/projectExpenseModel");
const express = require("express");
const router = express.Router();

router.post("/V1/projectExpense", async (req, res) => {
  try {
    let Data = req.body;
    const { expenseName, amount, date, reason } = Data;
    if ((!expenseName, !amount, !date, !reason))
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const projectDetail = new projectExpenseModel(Data);
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

router.get("/V1/getprojectexpense", async (req, res) => {
  try {
    const projectExpense = await projectExpenseModel.find();

    return res.status(200).send({ projectExpense });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});
router.put("/V1/updateexpense/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const projectexpense = await projectExpenseModel.findOne({ id: id });
    if (!projectexpense) {
      return res.status(404).send({ status: false, msg: "member not found" });
    }

    const updatedData = await projectExpenseModel.findOneAndUpdate(
      { id: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).send(updatedData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.delete("/V1/projectexpenseDelate", async (req, res) => {
  try {
    const result = await projectExpenseModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} projectexpense`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, msg: "server error", error: err.message });
  }
});

module.exports = router;
