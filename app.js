const cors = require("cors");
const express = require("express");
const compression = require("compression");
const essaysRouter = require("./src/routes");
const { createError } = require("./src/essays");

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json());
app.use("/essays", essaysRouter);

app.get("/", (req, res) => {
  res.status(200).send("api on standby...");
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, "Not found"));
});

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
  } else {
    console.error(err);
    res.status(err.status || 500);
    res.send("an error occured");
  }
});

module.exports = app;
