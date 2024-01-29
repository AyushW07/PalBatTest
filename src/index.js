const express = require("express");
const bodyParser = require("body-parser");
const app = require("./app");
const { default: mongoose } = require("mongoose");
const { Route } = require("express");
const cors = require("cors");
// const app = express();

// Enable All CORS Requests for development use
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect(
    "mongodb+srv://bsg89785:NVjU2Bu32deA7eBM@cluster0.igo92f4.mongodb.net/palBAT",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

// app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
