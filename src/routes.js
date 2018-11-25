const express = require("express");
const {
  getEssay,
  getEssays,
  createError,
  getFeaturedEssays,
  initialize
} = require("./essays");

const ROUTER = express.Router();
const STATUS_OK = 200;

ROUTER.get("/init", async (req, res, next) => {
  try {
    const msgs = await initialize();
    res.status(STATUS_OK).json(msgs);
  } catch (error) {
    createError(500, error.message, next);
  }
});

ROUTER.get("/", async (req, res, next) => {
  try {
    const essays = await getEssays();
    res.status(STATUS_OK).json(essays);
  } catch (err) {
    createError(500, err.message, next);
  }
});

ROUTER.get("/featured", async (req, res, next) => {
  try {
    const essays = await getFeaturedEssays();
    res.status(STATUS_OK).json(essays);
  } catch (err) {
    createError(500, err.message, next);
  }
});

ROUTER.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const essay = await getEssay(id);
    res.status(STATUS_OK).json(essay);
  } catch (error) {
    createError(404, error.message, next);
  }
});

module.exports = ROUTER;
