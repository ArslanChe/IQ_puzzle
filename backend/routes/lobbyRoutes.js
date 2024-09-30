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
    getGameSeed,
    updateUserShowStatus,
    createNotificationsForLobby,
    getUserNotifications,
    updateLobbyPermissions,
    markNotificationAsRead
} = require("../controllers/lobbyConrollers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
// Марщрутизация запросов соответсвующим контроллерам
router.route("/").post(protect, createDuelLobby);
router.route("/group").post(protect,createGroupLobby);

router.route("/").get(protect,getUserLobbies);
router.route("/show-status").put(protect,updateUserShowStatus);
router.route("/remove").put(protect,removeFromGroupLobby);

router.route('/:lobbyId/hasFinished').get(protect,checkUserFinished);
router.route('/:lobbyId/hasStarted').get(protect,checkUserStarted);
router.route('/:lobbyId/start').put(protect,updateUserStartStatus);
router.route('/:lobbyId/finish').put(protect,updateUserFinishStatus);

router.route('/:lobbyId/completionTime').get(protect,getCompetitionTime);
router.route('/:lobbyId/users').get(protect,getAllUsersInLobby);

router.route('/:lobbyId/gameSeed').get(protect,getGameSeed);

router.route('/notifications').post(protect,createNotificationsForLobby);
router.route('/notifications').get(protect,getUserNotifications);
router.route('/:lobbyId/permissions').put(protect,updateLobbyPermissions);
router.route('/:notificationId/read').put(protect,markNotificationAsRead);

module.exports = router;
