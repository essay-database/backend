const express = require("express");
const { getEssay, getEssays, createError, getFeatured } = require("./api");

const ROUTER = express.Router();
const STATUS_OK = 200;

ROUTER.get("/", async (req, res, next) => {
  let essays;
  try {
    essays = await getEssays();
  } catch (err) {
    return createError(500, error.message, next);
  }
  res.status(STATUS_OK).json(essays);
});

ROUTER.get("/featured", async (req, res, next) => {
  let essays;
  try {
    essays = await getFeatured();
  } catch (err) {
    return createError(500, error.message, next);
  }
  res.status(STATUS_OK).json(essays);
});

ROUTER.get("/:id", async (req, res, next) => {
  let essay;
  const id = req.params.id;
  try {
    essay = await getEssay(id);
  } catch (error) {
    return createError(404, error.message, next);
  }
  res.status(STATUS_OK).json(essay);
});

module.exports = ROUTER;
