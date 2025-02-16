const express = require("express");
const { getAllBagType, createBagType, updateBagType, deleteBagType } = require("../controllers/CongTacVien/loaituimu.controller");

const router = express.Router();

router.get("/get-loaituimu", getAllBagType);

router.post("/create-loaituimu", createBagType);

router.put("/update-loaituimu", updateBagType);

router.delete("/delete-loaituimu/:id", deleteBagType);

module.exports = router;
