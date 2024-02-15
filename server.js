require("dotenv").config();
const express = require("express");
const app = express();
//Path for managing directories
const path = require("path");
const PORT = process.env.PORT || 3500;
//Logger middleware
const { logger, logEvents } = require("./middleware/logger");
//error handler middleware
const errorHandler = require("./middleware/errorHandler");
//cookie parser middleware
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
//for DB connection
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");

//All routers
const root = require("./routes/root");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");

connectDB();

app.use(logger);

//app.use(cors(corsOptions));

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", root);
app.use("/users", userRouter);
app.use("/notes", noteRouter);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.use(errorHandler);

//for successsfull mongodb connection
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

//for failed mongodb connections
mongoose.connection.on("error", (err) => {
  console.log(error);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
