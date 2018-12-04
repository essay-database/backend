const express = require("express");
const { getPage, createError } = require("./api");

const ROUTER = express.Router();
const STATUS_OK = 200;

ROUTER.get("/:page", async (req, res, next) => {
  const { page } = req.params;
  try {
    const essay = await getPage(page);
    res.status(STATUS_OK).json(essay);
  } catch (error) {
    createError(404, error.message, next);
  }
});

module.exports = ROUTER;
