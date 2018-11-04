const express = require("express");
const {
  getEssay,
  getEssays,
  createError,
  getFeaturedEssays
} = require("./api");

const ROUTER = express.Router();
const STATUS_OK = 200;

ROUTER.get("/", async (req, res, next) => {
  let essays;
  try {
    essays = await getEssays();
  } catch (err) {
    createError(500, err.message, next);
    return;
  }
  res.status(STATUS_OK).json(essays);
});

ROUTER.get("/featured", async (req, res, next) => {
  let essays;
  try {
    essays = await getFeaturedEssays();
  } catch (err) {
    createError(500, err.message, next);
    return;
  }
  res.status(STATUS_OK).json(essays);
});

ROUTER.get("/:id", async (req, res, next) => {
  let essay;
  const { id } = req.params;
  try {
    essay = await getEssay(id);
  } catch (error) {
    createError(404, error.message, next);
    return;
  }
  res.status(STATUS_OK).json(essay);
});

module.exports = ROUTER;
