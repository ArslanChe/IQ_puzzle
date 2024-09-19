const express = require("express");
const {
    createDuelLobby,
    getUserLobbies,
    createGroupLobby,
    removeFromGroupLobby, checkUserFinished,
    checkUserStarted,
    updateUserFinishStatus,
    updateUserStartStatus,
    getCompetitionTime,
    getAllUsersInLobby,
} = require("../controllers/lobbyConrollers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
// Марщрутизация запросов соответсвующим контроллерам
router.route("/").post(protect, createDuelLobby);
router.route("/").get(protect,getUserLobbies);
router.route("/group").post(protect,createGroupLobby);
router.route("/remove").put(protect,removeFromGroupLobby);

router.route('/:lobbyId/hasFinished').get(protect,checkUserFinished);
router.route('/:lobbyId/hasStarted').get(protect,checkUserStarted);
router.route('/:lobbyId/start').put(protect,updateUserStartStatus);
router.route('/:lobbyId/finish').put(protect,updateUserFinishStatus);

router.route('/:lobbyId/completionTime').get(protect,getCompetitionTime);
router.route('/:lobbyId/users').get(protect,getAllUsersInLobby);

module.exports = router;
