const express = require("express");
const memberModel = require("../models/memberModel");
const hoursModel = require("../models/hoursModel");

const projectdetailsModel = require("../models/projectdetailsModel");
const router = express.Router();

router.post("/V1/hoursDatas", async (req, res) => {
  try {
    const {
     
      employeName,
      Hoursday,
      jobRole,
      totalHours,
      costhour,
      hourCost,
    } = req.body;
    if (
      (
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


//total cost by all employee wrt particular project
router.get("/V1/projectDetailsAndCost/:projectDetailId", async (req, res) => {
  try {
      const projectDetailId = req.params.projectDetailId;

      // Fetch project details
      const project = await projectdetailsModel.find({
        projectDetailId: projectDetailId,
          isDeleted: false,
      });
      if (!project) {
          return res.status(404).send({ status: false, message: "Project not found" });
      }

      // Fetch hour details for the project
      const hoursDetails = await hoursModel.find({
          projectDetailId: projectDetailId,
          isDeleted: false,
      });
      let totalHoursCost = 0;
      hoursDetails.forEach((hour) => {
          totalHoursCost += hour.totalHours * hour.hourCost;
      });

      // Calculate total expenses
      let totalExpenses = 0;
      if (Array.isArray(project.projectExpenses)) {
        project.projectExpenses.forEach((expense) => {
          // Check if expense.amount is a valid number and not null or undefined
          if (typeof expense.amount === "number" && !isNaN(expense.amount)) {
            totalExpenses += expense.amount;
          }
        });
      }

      // Calculate total project cost
      let totalProjectCost = totalHoursCost + totalExpenses;

      // Prepare response
      const response = {
          status: true,
          projectId: projectDetailId,
          projectName: project.projectName,
          hoursDetails, // Includes detailed hours data for the project
          totalHoursCost,
          totalExpenses,
          totalProjectCost,
      };

      return res.status(200).send(response);
  } catch (error) {
      console.error("Error:", error);
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
          Hoursday: Hoursday,
        },
      },
      { new: true, runValidators: true }
    );

    const projectModel = await projectdetailsModel.findOne({
      id: updatedData.projectDetailId,
    });
    let totalExpensive = 0;
    projectModel?.projectExpenses?.forEach((project) => {
      totalExpensive += project.amount;
    });
    // console.log("expense",totalExpensive)
    let sellingPrice = projectModel?.sellingPrice;
    let totalCostHours = updatedData?.costhour;
    console.log("c", sellingPrice, totalCostHours, totalExpensive);
    let totalProfit = Math.abs(
      sellingPrice - (totalExpensive + totalCostHours)
    );
    console.log("p", totalProfit);
    // if (projectModel.totalprojectProfit > 0) {
    //   await projectdetailsModel.findOneAndUpdate(
    //     { id: projectModel?.id },
    //     {
    //       $inc: {
    //         totalprojectProfit: updatedData.costhour * parseInt(Hoursday),
    //       },
    //     },
    //     { new: true }
    //   );
    // } else {
    //   await projectdetailsModel.findOneAndUpdate(
    //     { id: projectModel?.id },
    //     { $inc: { totalprojectProfit: totalProfit } },
    //     { new: true }
    //   );
    // }
    if (!updatedData) {
      return res
        .status(404)
        .send({ status: false, msg: "Unable to update hour entry" });
    }

 
    await hoursModel.findOneAndUpdate(
      { id: hoursid },
       { totalCost: totalExpensive + updatedData?.costhour } ,

      { new: true, runValidators: true }
    );
    
  

    return res.status(200).send({
      status: true,
      msg: "Hour entry updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


//get all hours 
router.get("/V1/gethours", async (req, res) => {
  try {
    const hoursDetails = await hoursModel.find();
    return res.status(200).send(hoursDetails);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//get hours by projectId home page
router.get("/V1/hoursData/:projectDetailId", async (req, res) => {
  try {
    const projectDetailId = req.params.projectDetailId;
// console.log("project",projectDetailId)
    const projectData = await hoursModel.find({
      projectDetailId: projectDetailId,
       isDeleted: false,
    });
    console.log("P", projectData);
    return res.status(200).send(projectData);
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

router.delete("/V1/hoursDelete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const hours = await hoursModel.findOne({ id: id });
    if (!hours) {
      return res
        .status(404)
        .send({ status: false, message: `hours not found or already deleted` });
    }
    const deletedData = await hoursModel.findOneAndDelete({ id: id });
    return res.status(200).send(deletedData);
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: err.message });
  }
});

module.exports = router;




