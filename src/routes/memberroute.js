const memberModel = require("../models/memberModel");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const hoursModel = require("../models/hoursModel");
const projectdetailsModel = require("../models/projectdetailsModel");


function maskString(str, visibleCount = 2) {
  if (typeof str !== 'string' || str === undefined) {
    return '****';
  }
  return (
    str.slice(0, -visibleCount).replace(/./g, "*") + str.slice(-visibleCount)
  );
}
router.post("/V1/member", async (req, res) => {
  try {
    const {
      employeName,
      photo,
      description,
      jobRole,
      department,
      position,
      joiningDate,
      ctc,

      hourCost,
      bankName,
      accholderName,
      accountNumber,
      GSTCGST,
      panNumber,
      accountType,

      IFSCCode,
    } = req.body;
    if (
      (!employeName,
        !photo,
        !description,
        !jobRole,
        !department,
        !position,
        !joiningDate,
        !ctc,
        !hourCost,
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

    const memberDetail = new memberModel({
      ...req.body,
      photo: req.file
    });

    let member = await memberDetail.save();
    const expensesData = new hoursModel({
      id: uuidv4(),
      memberId: member.id,
      employeName: member.employeName,
      hourCost: member.hourCost,
      jobRole: member.jobRole,
      projectDetailId: member.projectDetailId,
    });
    await expensesData.save();
    return res.status(201).send({
      status: true,
      message: "member created successfully",
      data: {
        ...memberDetail.toObject(),
        accountNumber: maskString(memberDetail.accountNumber.toString()),
        panNumber: maskString(memberDetail.panNumber),
        IFSCCode: maskString(memberDetail.IFSCCode),
      },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


//all member data
router.get("/V1/getmemberData", async (req, res) => {
  try {
    const expensesDetails = await memberModel.find();
    return res.status(200).send(expensesDetails);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//this api for project page  members
router.get("/V1/member/:memberid", async (req, res) => {
  try {
    const memberid = req.params.memberid;

    const projectId = await memberModel.findOne({
      id: memberid,
      // isDeleted: false,
    });
    return res
      .status(200)
      .send({ status: true, msg: "Data fetch succesfully", data: projectId });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


//This month summary and totalHours

router.get("/V1/employeeMonthlySummary/:memberId", async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const member = await memberModel.findOne({ id: memberId, isDeleted: false });
    if (!member) {
      return res.status(404).send({ status: false, message: "Member not found" });
    }
  
    const hoursDetails = await hoursModel.find({ memberId: memberId, isDeleted: false });
    console.log(`Found ${hoursDetails.length} hours entries for member ${memberId}`);
    let totalHours = 0;
    let projectsWorkedOn = {};
    for (const element of hoursDetails) {
      totalHours += element.totalHours;
      if (!projectsWorkedOn[element.projectDetailId]) {
        const project = await projectdetailsModel.findOne({ id: element.projectDetailId, isDeleted: false });
        console.log(`Found project for projectDetailId ${element.projectDetailId}:`, project);
        if (project) {
          projectsWorkedOn[element.projectDetailId] = {
            projectName: project.projectName,
            totalHours: element.totalHours, // Initialize with current element's totalHours
            startingDate: project.startingDate,
            completionDate: project.completionDate
          };
        }
      } else {
        // Project already in projectsWorkedOn, just add the hours
        projectsWorkedOn[element.projectDetailId].totalHours += element.totalHours;
      }
    }
    console.log('Projects worked on:', projectsWorkedOn);
    const projectDetails = Object.values(projectsWorkedOn);
    let totalCostForAllProjects = totalHours * (member.hourCost || 0);
    
    return res.status(200).send({
      memberId: memberId,
      memberName: member.employeName,
      totalHours: totalHours,
      hourlyCost: member.hourCost,
      totalCostForAllProjects: totalCostForAllProjects,
      projectDetails: projectDetails
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: false, message: error.message });
  }
});



//edit data 

router.put("/V1/updatemember/:memberid", async (req, res) => {
  try {
    const memberid = req.params.memberid;

    const memberExists = await memberModel.findOne({ id: memberid });
    if (!memberExists) {
      return res.status(404).send({ status: false, msg: "member not found" });
    }

    const updatedData = await memberModel.findOneAndUpdate(
      { id: memberid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).send(updatedData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//delete all data
router.delete("/V1/memberDelete", async (req, res) => {
  try {
    const result = await memberModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} homedata`);
  } catch (error) {
    console.error(error);
    res.status(500).send(result);
  }
});

//delete data wrt id
router.delete("/V1/memberDelete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const member = await memberModel.findOne({ id: id });
    if (!member) {
      return res.status(404).send({ status: false, message: `Member not found or already deleted` });
    }
    const deletedData = await memberModel.findOneAndDelete({ id: id });
    return res.status(200).send(deletedData);
  } catch (err) {
    return res.status(500).send({ status: false, message: "Server error", error: err.message });
  }
});





module.exports = router;
