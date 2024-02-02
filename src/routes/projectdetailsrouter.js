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
      projectExpenses,
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
      !projectExpenses,
      !GSTCGST
      )
    )
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const projectDetail = new projectdetailsModel(Data);
    await projectDetail.save();

    return res.status(201).send(
     
projectDetail);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.get("/V1/getallData", async (req, res) => {
  try {
    
    const project = await projectdetailsModel.find({ isDeleted: false });
    return res.status(200).send(project);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

 //get clientName wrt to this api 
 router.get("/V1/getclient", async (req, res) => {
  try {
    const clients = await clientModel.find();
    // console.log("clien",clients)
    return res.status(200).send(clients);
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
      if (project.GSTCGST && project.GSTCGST.trim() !== "") {
        const gstPercentage = parseFloat(project.GSTCGST.replace("%", "")) / 100;
        totalGSTCGST += project.sellingPrice * gstPercentage;
      }
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

router.delete("/V1/projectDelate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const project = await projectdetailsModel.findOne({ id: id });
    if (!project) {
      return res.status(404).send({ status: false, message: `project not found or already deleted` });
    }
    const deletedData = await projectdetailsModel.findOneAndDelete({ id: id });
    return res.status(200).send(deletedData);
  } catch (err) {
    return res.status(500).send({ status: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
