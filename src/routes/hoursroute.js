const express = require("express");
const memberModel = require("../models/memberModel");
const hoursModel = require("../models/hoursModel");
const projectExpenseModel = require("../models/projectExpenseModel");
const projectdetailsModel = require("../models/projectdetailsModel");
const router = express.Router();

router.post("/V1/hoursData", async (req, res) => {
  try {
    const {
      memberId,
      employeName,
      Hoursday,
      jobRole,
      totalHours,
      costhour,
      hourCost,
    } = req.body;
    if (
      (!memberId,
      !Hoursday,
      !totalHours,
      !costhour,
      !employeName,
      !jobRole,
      hourCost)
    )
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const expensesData = new hoursModel(req.body);
    await expensesData.save();
    return res.status(201).send(expensesData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//gethourscalculation with total hours
router.get("/V1/gethourDataWithTotalCosts", async (req, res) => {
  try {
    const hoursDetails = await hoursModel.find({ isDeleted: false });
    const expensesDetails = await memberModel.find();
    let projectDetailId = hoursDetails[hoursDetails.length - 1].projectDetailId;
    // console.log("p", projectDetailId);
    let totalcosthour = 0;
    hoursDetails.forEach((element) => {
      totalcosthour += element.costhour;
    });
    let projectExpense = await projectExpenseModel.find({
      projectDetailId: projectDetailId,
    });
    let totalexpense = 0;
    projectExpense.forEach((element) => {
      totalexpense += element.amount;
    });
    let totalcost = totalexpense + totalcosthour;

    return res.status(200).send({
      totalcost,
      hoursDetails,
      expensesDetails
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// only hours will be update
router.put("/V1/updatehours/:hoursid", async (req, res) => {
  try {
    const hoursid = req.params.hoursid;
    const { Hoursday } = req.body;

    // Validate the input
    if (Hoursday == null) {
      return res
        .status(400)
        .send({ status: false, msg: "Hoursday is required" });
    }
console.log("hou",hoursid)
    // Find the hour entry
    const hourEntry = await hoursModel.findOne({
      id: hoursid,
      isDeleted: false,
    });
    if (!hourEntry) {
      return res
        .status(404)
        .send({ status: false, msg: "Hour entry not found" });
    }

    // Find the associated member to get hourCost
    const member = await memberModel.findOne({ id: hourEntry.memberId });
    if (!member) {
      return res
        .status(404)
        .send({ status: false, msg: "Associated member not found" });
    }

    // Calculate the new total hours and costhour
    const newTotalHours = hourEntry.totalHours + Hoursday;
    const newCosthour = newTotalHours * member.hourCost;

    // Update the hour entry
    const updatedData = await hoursModel.findOneAndUpdate(
      { id: hoursid },
      {
        $set: {
          totalHours: newTotalHours,
          costhour: newCosthour,
          Hoursday:Hoursday
        },
      },
      { new: true, runValidators: true }
    );

    const projectModel= await projectdetailsModel.findOne({id:updatedData.projectDetailId})
    let totalExpensive=0
    projectModel.projectExpenses.forEach((project)=>{
      totalExpensive+=project.amount
      
    })
    console.log("expense",totalExpensive)
    let sellingPrice=projectModel?.sellingPrice
    let totalCostHours=updatedData?.costhour
    console.log("c",sellingPrice,totalCostHours,totalExpensive)
    let totalProfit =Math.abs(sellingPrice-(totalExpensive+totalCostHours));
   
    await  projectdetailsModel.findOneAndUpdate({id:projectModel?.id} ,{$inc:{totalprojectProfit:totalProfit,totalexpense:totalExpensive}}, {new:true} )
    if (!updatedData) {
      return res
        .status(404)
        .send({ status: false, msg: "Unable to update hour entry" });
    }

    return res.status(200).send({
      status: true,
      msg: "Hour entry updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.delete("/V1/hoursDelate", async (req, res) => {
  try {
    const result = await hoursModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} hoursdata`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, msg: "server error", error: err.message });
  }
});

module.exports = router;
