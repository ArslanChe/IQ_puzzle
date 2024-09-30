const express = require("express");

const {
  registerUser,
  authUser,
  allUsers,
  updateUserScore
} = require("../controllers/userControllers");
const {protect} = require("../middlewares/authMiddleware");

const router = express.Router();
// Марщрутизация запросов соответсвующим контроллерам
router.route("/").get(protect, allUsers);
router.route('/:userId/updateScore').put(protect, updateUserScore)

router.route("/").post(registerUser);
router.route("/login").post(authUser);

module.exports = router;
