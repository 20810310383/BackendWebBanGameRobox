const express = require("express");
const { getAllGoiNap, createGoiNap, updateGoiNap, deleteGoiNap } = require("../controllers/GoiNap/goi.nap.controller");

const router = express.Router();

router.get("/get-goinap", getAllGoiNap);

router.post("/create-goinap", createGoiNap);

router.put("/update-goinap", updateGoiNap);

router.delete("/delete-goinap/:id", deleteGoiNap);

module.exports = router;
