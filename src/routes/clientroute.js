const clientModel = require("../models/clientModel");
const express = require("express");

const router = express.Router();
const multer = require("multer");
const projectdetailsModel = require("../models/projectdetailsModel");
const hoursModel = require("../models/hoursModel");


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
function maskString(str, visibleCount = 2) {
  return (
    str.slice(0, -visibleCount).replace(/./g, "*") + str.slice(-visibleCount)
  );
}
router.post("/V1/client", upload.single("Photo"), async (req, res) => {
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

//calculate overall colllection and overall due
router.get("/V1/getcdueclient/:clientid", async (req, res) => {
  try {
    const clientid = req.params.clientid;
    const client = await clientModel.findOne({
      id: clientid,
      isDeleted: false,
    });

    if (!client) {
      return res
        .status(404)
        .send({ status: "failed", message: "Client not found" });
    }

    const clientProjects = await projectdetailsModel.find({
      clientid: clientid, // Use 'clientid' to relate projects to clients

      isDeleted: false,
    });

    let overallCollection = 0;
    let overallDue = 0;

    clientProjects.forEach((project) => {
      overallCollection += project.sellingPrice;
      overallDue += project.collectiondue;
    });

    let numberOfProjects = clientProjects.length;
    const clientSummary = {
      clientId: client.id,
      clientName: client.clienteName,
      overallCollection,
      overallDue,
      numberOfProjects,
    };

    return res.status(200).send({ status: true, clientSummary });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});


router.get("/V1/getclient", async (req, res) => {
  try {
    const clientDetails = await clientModel.find();
    return res.status(200).send(clientDetails);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});
//calculate netprofit and overallmoney overallDue

router.get("/V1/getdatas/:clientid", async (req, res) => {
  try {
    
    const clientid = req.params.clientid;
   const projects = await projectdetailsModel.find({
      clientid: clientid,
      isDeleted: false,
    });
    let netprofit = 0;
    let sellingprice= 0;
    projects.forEach(project =>{
      netprofit+=project.totalprojectProfit || 0
      sellingprice+=project.sellingPrice
    })
    
    return res.status(200).send({
      netprofit,
      sellingprice
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});

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

router.delete("/V1/clientprojectDelate/:clientid", async (req, res) => {
  try {
    let clientid = req.params.clientid;

    clientid = Number(clientid);
    const page = await clientModel.findOne({
      id: clientid,
      isDeleted: false,
    });
    if (!page) {
      return res
        .status(404)
        .send({ status: false, message: `Page not found or already deleted` });
    }
    await clientModel.findOneAndDelete({ id: clientid });

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
