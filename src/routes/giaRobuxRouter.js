const express = require("express");
const { findOneGiaRobux, createRobux, updateRobux } = require("../controllers/GiaRobux/giaRobux.controller");

const router = express.Router();

router.get("/get-giarobux", findOneGiaRobux);

router.post("/create-giarobux", createRobux);

router.put("/update-giarobux", updateRobux);


module.exports = router;
