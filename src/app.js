const express = require("express");
const cors = require("cors");
const loginRouter = require("./routes/loginroute");
const projectdetailsrouter = require("./routes/projectdetailsrouter");
const clientRouter = require("./routes/clientroute");
const membersRouter = require("./routes/memberroute");
const expensesRouter = require("./routes/expensesroute");
const hoursRoute = require("./routes/hoursroute");
const projectExpenseRoute = require("./routes/projectExpenseroute");
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(loginRouter);
app.use(projectdetailsrouter);
app.use(clientRouter);
app.use(membersRouter);
app.use(expensesRouter);
app.use(hoursRoute);
app.use(projectExpenseRoute);
app.use('/uploads', express.static('uploads'));

module.exports = app; // Use module.exports here
