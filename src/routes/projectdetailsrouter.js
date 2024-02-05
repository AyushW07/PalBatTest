const clientModel = require("../models/clientModel");
const expensesModel = require("../models/expensesModel");
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
      projectMembers,
      invoice,
      GSTCGST,


    } = Data;
    if (
      (!projectName,
        !selectClients,
        !startingDate,
        !completionDate,
        !projectMembers,
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
    let projectData = await projectDetail.save();
    for (let i = 0; i < projectMembers.length; i++) {
      let member = projectMembers[i];

      await memberModel.findOneAndUpdate(
        { id: member.id },
        { projectDetailId: projectData.id }
      );
    }

    return res.status(201).send(projectDetail);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


//calculate expensive
router.get("/V1/getallData", async (req, res) => {
  try {
    const projects = await projectdetailsModel.find({ isDeleted: false });

    const projectsWithTotalExpenses = projects.map((project) => {
      let totalexpense = 0;
      project.projectExpenses.forEach((expense) => {
        totalexpense += expense.amount; // assuming 'amount' is the field that stores the expense value
      });
      return {
        ...project.toObject(),
        totalexpense,
      };
    });

    return res.status(200).send(projectsWithTotalExpenses);
  } catch (error) {
    console.error("Error:", error);
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

//filter with month and year
// calculate the total amount Total amount spend on projects due on the project,gstcgst,amount generated with filter
router.get("/V1/getallamount", async (req, res) => {
  try {
    let query = req.query;
    // console.log("qu",query)
    if (query.from && query.to) {
      let fromDate = new Date(
        String(query.from).split("-").join("-")
      );

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(query.to).split("-").join("-"));

      toDate.setUTCHours(23, 59, 59, 999);

      const formattedFromDate = fromDate.toISOString().split("T")[0];
        const formattedToDate = toDate.toISOString().split("T")[0];
console.log("foe",formattedFromDate,formattedToDate)
if(fromDate>toDate){
  return res.status(400).json({"Message":"Invalid date range."})
}
     
      const projectDetails = await projectdetailsModel.find({
        isDeleted: false,
        startingDate: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });
      if (!projectDetails || projectDetails.length === 0) {
        return res
          .status(404)
          .send({ status: false, message: "No projects found" });
      }
      //total amount generated
      let totalAmountGenerated = 0;
      let totalGSTCGST = 0;
  
      projectDetails.forEach((project) => {
        totalAmountGenerated += project.sellingPrice;
        if (project.GSTCGST && project.GSTCGST.trim() !== "") {
          const gstPercentage =
            parseFloat(project.GSTCGST.replace("%", "")) / 100;
          totalGSTCGST += project.sellingPrice * gstPercentage;
        }
      });
      //total amount due
      let totalcollectiondue = 0;
      projectDetails.forEach((project) => {
        totalcollectiondue += project.collectiondue;
      });
      //total cost of al the project
      const hoursDetails = await hoursModel.find({ isDeleted: false });
      let totalhours = 0;
      hoursDetails.forEach((hours) => {
        totalhours += hours.totalCost;
      });
  
      return res.status(200).send({
        status: true,
        projectDetails,
        totalAmountGenerated,
        totalcollectiondue,
        totalcost: totalhours,
        totalGSTCGST,
      });

    }
     const projectDetails = await projectdetailsModel.find({ isDeleted: false });
    if (!projectDetails || projectDetails.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "No projects found" });
    }
    //total amount generated
    let totalAmountGenerated = 0;
    let totalGSTCGST = 0;

    projectDetails.forEach((project) => {
      totalAmountGenerated += project.sellingPrice;
      if (project.GSTCGST && project.GSTCGST.trim() !== "") {
        const gstPercentage =
          parseFloat(project.GSTCGST.replace("%", "")) / 100;
        totalGSTCGST += project.sellingPrice * gstPercentage;
      }
    });
    //total amount due
    let totalcollectiondue = 0;
    projectDetails.forEach((project) => {
      totalcollectiondue += project.collectiondue;
    });
    //total cost of al the project
    const hoursDetails = await hoursModel.find({ isDeleted: false });
    let totalhours = 0;
    hoursDetails.forEach((hours) => {
      totalhours += hours.totalCost;
    });

    return res.status(200).send({
      status: true,
      projectDetails,
      totalAmountGenerated,
      totalcollectiondue,
      totalcost: totalhours,
      totalGSTCGST,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


// calculate  exppense wrt projectId
router.get("/V1/project/:projectDetailId", async (req, res) => {
  try {
    const projectDetailId = req.params.projectDetailId;

    const projectId = await projectdetailsModel.findOne({
      id: projectDetailId,
      // isDeleted: false,
    });
    let totalexpense = 0;
    projectId.projectExpenses.forEach((expense) => {
      totalexpense += expense.amount || 0; 
    });
    await projectdetailsModel.findOneAndUpdate(
      { id: projectDetailId },
      { totalexpense: totalexpense },
      { new: true }
    );
    return res.status(200).send({ projectId, totalexpense });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


//update project with projectId
router.put("/V1/updateData/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const project = await projectdetailsModel.findOne({ id: id });
    if (!project) {
      return res.status(404).send({ status: false, msg: "member not found" });
    }
    let expense = req.body.projectExpenses;
    let totalExpensive = 0;
    expense.forEach((expense) => {
      if (expense.update == true) {
        totalExpensive += expense.amount || 0;
      }
    });

    const updatedData = await projectdetailsModel.findOneAndUpdate(
      { id: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await projectdetailsModel.findOneAndUpdate(
      { id: id },
      { $inc: { totalprojectProfit: -totalExpensive } }
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


//delete wrt id
router.delete("/V1/projectDelate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const project = await projectdetailsModel.findOne({ id: id });
    if (!project) {
      return res
        .status(404)
        .send({
          status: false,
          message: `project not found or already deleted`,
        });
    }
    const deletedData = await projectdetailsModel.findOneAndDelete({ id: id });
    return res.status(200).send(deletedData);
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: err.message });
  }
});


//dashboard calculations of home page 


router.get('/V1/dashboard', async (req, res) => {
  try {

    const totalProjects = await projectdetailsModel.countDocuments({ isDeleted: false });


    const expenses = await expensesModel.countDocuments({ isDeleted: false });
   

 
    const totalClients = await clientModel.countDocuments({ isDeleted: false });

    const totalMembers = await memberModel.countDocuments({ isDeleted: false });

  
    return res.status(200).send({
      totalProjects,
      expenses,
      totalClients,
      totalMembers
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});



module.exports = router;


module.exports = router;
