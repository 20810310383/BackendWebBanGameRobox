const express = require("express");
const { xoaGamepass, suaGamepass, taoGamepass, getGamepass } = require("../controllers/GamePass/gamepass.controller");

const router = express.Router();

// find all product
router.get("/get-gamepass", getGamepass );

// tao moi product
router.post("/create-gamepass", taoGamepass );

// update product
router.put("/update-gamepass", suaGamepass );

// delete product
router.delete("/delete-gamepass/:id", xoaGamepass );



module.exports = router;