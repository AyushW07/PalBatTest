const loginModel = require("../models/loginModels");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
router.post("/V1/user", async (req, res) => {
  try {
    let data = req.body;
    const { Email, Password } = data;
    if (!Email || !Password)
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const userData = new loginModel(data);
    await userData.save();
    return res.status(201).send({
      status: true,
      message: "user created succesfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).send({ staus: false, message: error.message });
  }
});

router.post("/V1/loginuser", async (req, res) => {
  try {
    let body = req.body;
    if (Object.keys(body).length > 0) {
      let userName = req.body.Email;
      let Password = req.body.Password;
      if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(userName)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide a valid crediantials" });
      }
      if (!/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(Password)) {
        return res.status(400).send({
          status: false,
          msg: "please provide valid credintials of user",
        });
      }
      let user = await loginModel.findOne({ Email: userName });

      if (!user) {
        return res.status(400).send({
          status: false,
          msg: "credintials is not correct",
        });
      }

      //Compare hashed password using bcrypt
      // const isMatch = await bcrypt.compare(Password, user.Password);
      // if (!isMatch) {
      //   return res
      //     .status(400)
      //     .send({ status: false, msg: "credintials is not correct" });
      // }

      let token = jwt.sign(
        {
          userId: user._id,
        },
        "palBAT",
        { expiresIn: "12hrs" }
      );
      console.log(req.session);
      // console.log(token);

      res.status(200).setHeader("x-api-key", token);
      return res.status(201).send({ status: "loggedin", token: token });
    } else {
      return res.status(400).send({ msg: "Bad Request" });
    }
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
});

module.exports = router;
