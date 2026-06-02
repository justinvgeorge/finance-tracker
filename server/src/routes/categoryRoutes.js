const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const {
  createCategory,
  getCategories,
  deleteCategory,
} = require("../controllers/categoryController.js");

router.use(protect);

router.post("/", createCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);

module.exports = router;
