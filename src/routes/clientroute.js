const clientModel = require("../models/clientModel");
const express = require("express");

const router = express.Router();

const projectdetailsModel = require("../models/projectdetailsModel");
const hoursModel = require("../models/hoursModel");

// const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

function maskString(str, visibleCount = 2) {
  return (
    str.slice(0, -visibleCount).replace(/./g, "*") + str.slice(-visibleCount)
  );
}
router.post("/V1/client",  async (req, res) => {
  try {
    const {
      clienteName,
      photo,
      description,
      startDate,
      endDate,

      status,
      Poc,
      bankName,
      accholderName,
      accountNumber,
      GSTCGST,
      panNumber,
      accountType,

      IFSCCode,
    } = req.body;
    if (
      (!clienteName,
      !photo,
      !description,
      !startDate,
      !endDate,
      !Poc,
      !status,
      !bankName,
      !accholderName,
      !GSTCGST,
      !panNumber,
      !accountNumber,
      !accountType,
      !IFSCCode)
    )
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });

    const clientDetail = new clientModel(req.body);
    await clientDetail.save();

    return res.status(201).send({
      status: true,
      message: "client created successfully",
    
      data: {
        ...clientDetail.toObject(),
        accountNumber: maskString(clientDetail.accountNumber.toString()),
        panNumber: maskString(clientDetail.panNumber),
        IFSCCode: maskString(clientDetail.IFSCCode),
      },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//show the popupof projectHistory  with projectName and selling price 
router.get("/V1/getClientProjects/:clientid", async (req, res) => {
  try {
    const clientid = req.params.clientid;
    const client = await clientModel.findOne({ id: clientid, isDeleted: false });

    if (!client) {
      return res.status(404).send({ status: "failed", message: "Client not found" });
    }

    
    const clientProjects = await projectdetailsModel.find({ clientid: clientid, isDeleted: false })
      .select('projectName sellingPrice -_id'); 

    const projectsSummary = clientProjects.map(project => ({
      projectName: project.projectName,
      sellingPrice: project.sellingPrice
    }));

    return res.status(200).send({ status: true, projects: projectsSummary });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});



//calculate overall colllection and overall due with filter
router.get("/V1/getOverallCollectionAndDue", async (req, res) => {
  try {
    let query = req.query;
    console.log("qu",query)
    if (query.from && query.to) {
      let fromDate = new Date(
        String(query.from).split("-").join("-")
      );

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(query.to).split("-").join("-"));

      toDate.setUTCHours(23, 59, 59, 999);
console.log()
      const formattedFromDate = fromDate.toISOString().split("T")[0];
        const formattedToDate = toDate.toISOString().split("T")[0];
console.log("foe",formattedFromDate,formattedToDate)
if(fromDate>toDate){
  return res.status(400).json({"Message":"Invalid date range."})
}
   
    // Fetch all projects that are not deleted
    const projects = await projectdetailsModel.find({ isDeleted: false,
      startingDate: {
        $gte: formattedFromDate,
        $lte: formattedToDate,
      },});

      if (!projects || projects.length === 0) {
        return res
          .status(404)
          .send({ status: false, message: "No projects found" });
      }
    let overallCollection = 0;
    let overallDue = 0;

    // Iterate through all projects and accumulate the collection and due amounts
    projects.forEach((project) => {
      overallCollection += project.sellingPrice;
      overallDue += project.collectiondue;
    });

    const numberOfProjects = projects.length;
    
    const summary = {
      projects,
      overallCollection,
      overallDue,
      numberOfProjects,
    };

    return res.status(200).send({ status: true, summary });
  }
  const projects = await projectdetailsModel.find({ isDeleted: false});

  if (!projects || projects.length === 0) {
    return res
      .status(404)
      .send({ status: false, message: "No projects found" });
  }
let overallCollection = 0;
let overallDue = 0;

// Iterate through all projects and accumulate the collection and due amounts
projects.forEach((project) => {
  overallCollection += project.sellingPrice;
  overallDue += project.collectiondue;
});

const numberOfProjects = projects.length;

const summary = {
  overallCollection,
  overallDue,
  numberOfProjects,
}}
   catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});




//get all client
router.get("/V1/getclient", async (req, res) => {
  try {
    const clientDetails = await clientModel.find();
    return res.status(200).send(clientDetails);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//calculate netprofit and overallmoney no of projects invoices proforma {clientDetails}
router.get("/V1/getdatas/:clientid", async (req, res) => {
  try {
    
    const clientid = req.params.clientid;
    const client = await clientModel.findOne({ id: clientid, isDeleted: false });
   const projects = await projectdetailsModel.find({
      clientid: clientid,
      isDeleted: false,
    });
    let netprofit = 0;
    let sellingprice= 0;
    let proFormaTotal = 0;
    let invoiceTotal = 0;
    let firstProjectDate = null;
    projects.forEach(project =>{
      netprofit+=project.totalprojectProfit || 0
      sellingprice+=project.sellingPrice
      proFormaTotal += project.proForma || 0; 
      invoiceTotal += project.invoice || 0;
      const projectDate = new Date(project.startingDate); 
      firstProjectDate = firstProjectDate === null ? projectDate : (projectDate < firstProjectDate ? projectDate : firstProjectDate);
    
    });
    const numberOfProjects = projects.length;
    const bankDetails = {
      bankName: client.bankName,
      accholderName:client.accholderName,
      accountNumber: client.accountNumber,
      GSTCGST: client.GSTCGST,
      panNumber: client.panNumber,
      accountType: client.accountType,
      IFSCCode: client.IFSCCode,
      description:client.description,
      photo:client.photo,
    };
    
    return res.status(200).send({
      netprofit,
      sellingprice,numberOfProjects,
      proFormaTotal,
      invoiceTotal,
      bankDetails,
      firstProjectDate: firstProjectDate ? firstProjectDate.toISOString().split('T')[0] : null // Format date as YYYY-MM-DD
    });
  
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});


//edit data
router.put("/V1/update/:clientid", async (req, res) => {
  try {
    const clientid = req.params.clientid;

    const clientExists = await clientModel.findOne({ id: clientid });
    if (!clientExists) {
      return res.status(404).send({ status: false, msg: "Client not found" });
    }

    const updatedData = await clientModel.findOneAndUpdate(
      { id: clientid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).send({
      status: true,
      msg: "Data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});
router.delete("/V1/clientDelate", async (req, res) => {
  try {
    const result = await clientModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} clientData`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, msg: "server error", error: err.message });
  }
});

router.delete("/V1/clientprojectDelate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const member = await clientModel.findOne({ id: id });
    if (!member) {
      return res.status(404).send({ status: false, message: `Member not found or already deleted` });
    }
    const deletedData = await clientModel.findOneAndDelete({ id: id });
    return res.status(200).send(deletedData);
  } catch (err) {
    return res.status(500).send({ status: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
