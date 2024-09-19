const asyncHandler = require("express-async-handler");
const Lobby = require("../models/lobbyModel");
const User = require("../models/userModel");

//@description     Create or fetch One-to-One Lobby
//@route           POST /api/lobby/
//@access          Protected
const createDuelLobby = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isLobby = await Lobby.find({
        isGroupLobby: false,
        $and: [
            { users: { $elemMatch: { userId: req.user._id } } },
            { users: { $elemMatch: { userId: userId } } },
        ],
    }).populate("users.userId", "-password");

    if (isLobby.length > 0) {
        res.send(isLobby[0]);
    } else {
        var lobbyData = {
            lobbyName: "Game Lobby",
            isGroupLobby: false,
            users: [{ userId: req.user._id, hasFinished: false }, { userId, hasFinished: false }],
        };

        try {
            const createdLobby = await Lobby.create(lobbyData);
            const fullLobby = await Lobby.findOne({ _id: createdLobby._id }).populate(
                "users.userId",
                "-password"
            );
            res.status(200).json(fullLobby);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

//@description     Fetch all lobbies for a user
//@route           GET /api/lobby/
//@access          Protected
const getUserLobbies = asyncHandler(async (req, res) => {
    try {
        Lobby.find({ users: { $elemMatch: { userId: req.user._id } } })
            .populate("users.userId", "-password")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Create New Group Lobby
//@route           POST /api/lobby/group
//@access          Protected
const createGroupLobby = asyncHandler(async (req, res) => {
    const { users: userIds, name } = req.body;

    if (!userIds || !name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    // Убедитесь, что userIds - это массив строк
    const users = Array.isArray(userIds) ? userIds : JSON.parse(userIds);

    if (users.length < 2) {
        return res.status(400).send("More than 1 user is required to form a game lobby");
    }

    // Ensure the current user is included in the list
    if (!users.includes(req.user._id.toString())) {
        users.push(req.user._id.toString());
    }

    try {
        const groupLobby = await Lobby.create({
            lobbyName: name,
            users: users.map(userId => ({
                userId,
                hasFinished: false
            })),
            isGroupLobby: true,
        });

        const fullGroupLobby = await Lobby.findOne({ _id: groupLobby._id })
            .populate("users.userId", "-password");

        res.status(200).json(fullGroupLobby);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Remove User from Group Lobby
//@route           PUT /api/lobby/remove
//@access          Protected
const removeFromGroupLobby = asyncHandler(async (req, res) => {
    const { lobbyId, userId } = req.body;

    const removedLobby = await Lobby.findByIdAndUpdate(
        lobbyId,
        { $pull: { users: { userId } } },
        { new: true }
    ).populate("users.userId", "-password");

    if (!removedLobby) {
        res.status(404).send("Lobby Not Found");
    } else {
        res.json(removedLobby);
    }
});

//@description     Check if a user has finished the game in a specific lobby
//@route           GET /api/lobby/:lobbyId/hasFinished?userId=
//@access          Protected
const checkUserFinished = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;
    const { userId } = req.query;

    // Find the lobby by ID
    const lobby = await Lobby.findById(lobbyId);
    if (!lobby) {
        res.status(404);
        throw new Error("Лобби не найдено");
    }

    // Find the user by userId in the users list of the lobby
    const user = lobby.users.find(u => u.userId.toString() === userId);

    if (user) {
        // Return whether the user has finished or not
        res.status(200).json({ hasFinished: user.hasFinished });
    } else {
        // Return false if the user is not found in the lobby
        res.status(404).json({ hasFinished: false });
    }
});

// @description     Check if a user has started the game in a specific lobby
// @route           GET /api/lobby/:lobbyId/hasStarted?userId=
// @access          Protected
const checkUserStarted = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;
    const { userId } = req.query;

    const lobby = await Lobby.findById(lobbyId);
    if (!lobby) {
        res.status(404);
        throw new Error("Лобби не найдено");
    }

    const user = lobby.users.find(u => u.userId.toString() === userId);
    if (user) {
        res.status(200).json({ hasStarted: user.hasStarted });
    } else {
        res.status(404).json({ hasStarted: false });
    }
});

// @description     Update user's game start status
// @route           PUT /api/lobby/:lobbyId/start
// @access          Protected
const updateUserStartStatus = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;
    const { userId } = req.body;

    const lobby = await Lobby.findById(lobbyId);
    if (!lobby) {
        res.status(404);
        throw new Error("Лобби не найдено");
    }

    const userIndex = lobby.users.findIndex(user => user.userId.toString() === userId);
    if (userIndex !== -1) {
        lobby.users[userIndex].hasStarted = true;
        await lobby.save();
        res.status(200).json({ message: "Статус начала игры обновлен" });
    } else {
        res.status(404);
        throw new Error("Пользователь не найден в этом лобби");
    }
});

// @description     Update user's game finish status and completion time
// @route           PUT /api/lobby/:lobbyId/finish
// @access          Protected
const updateUserFinishStatus = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;
    const { userId, completionTime } = req.body;

    const lobby = await Lobby.findById(lobbyId);
    if (!lobby) {
        res.status(404);
        throw new Error("Лобби не найдено");
    }

    const userIndex = lobby.users.findIndex(user => user.userId.toString() === userId);
    if (userIndex !== -1) {
        lobby.users[userIndex].hasFinished = true;
        lobby.users[userIndex].completionTime = completionTime;
        await lobby.save();
        res.status(200).json({ message: "Статус завершения игры и время обновлены" });
    } else {
        res.status(404);
        throw new Error("Пользователь не найден в этом лобби");
    }
});

// @description     Get the competition time of a user in a specific lobby
// @route           GET /api/lobby/:lobbyId/competitionTime
// @access          Protected
const getCompetitionTime = asyncHandler( async (req, res) => {
    const { lobbyId } = req.params;
    const { userId } = req.query;  // Получаем userId из параметров запроса

    try {
        // Находим лобби по его ID
        const lobby = await Lobby.findById(lobbyId);

        if (!lobby) {
            return res.status(404).json({ message: 'Лобби не найдено' });
        }

        // Находим пользователя в списке пользователей лобби
        const userInLobby = lobby.users.find(user => user.userId.toString() === userId);

        if (!userInLobby) {
            return res.status(404).json({ message: 'Пользователь не найден в лобби' });
        }

        // Проверяем, завершил ли пользователь игру
        if (!userInLobby.hasFinished) {
            return res.status(400).json({ message: 'Игра не завершена пользователем' });
        }

        // Возвращаем время завершения игры
        return res.status(200).json({
            completionTime: userInLobby.completionTime  // Возвращаем время завершения игры
        });
    } catch (error) {
        console.error('Ошибка получения времени завершения:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @description     Get all users and their results in a lobby
// @route           GET /api/lobby/:id/users
// @access          Protected
const getAllUsersInLobby = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;
    const lobby = await Lobby.findById(lobbyId).populate('users.userId');
    if (!lobby) {
        res.status(404);
        throw new Error("Лобби не найдено");
    }

    res.status(200).json(lobby.users);
});

module.exports = { getAllUsersInLobby };


module.exports = {
    createDuelLobby,
    getUserLobbies,
    createGroupLobby,
    // renameGroupLobby,
    removeFromGroupLobby,
    // addToGroupLobby,
    checkUserFinished,
    checkUserStarted,

    updateUserStartStatus,
    updateUserFinishStatus,

    getCompetitionTime,
    getAllUsersInLobby
};
// //@description     Rename Group Lobby
// //@route           PUT /api/lobby/rename
// //@access          Protected
// const renameGroupLobby = asyncHandler(async (req, res) => {
//     const { lobbyId, lobbyName } = req.body;
//
//     const updatedLobby = await Lobby.findByIdAndUpdate(
//         lobbyId,
//         { lobbyName },
//         { new: true }
//     ).populate("users.userId", "-password");
//
//     if (!updatedLobby) {
//         res.status(404).send("Lobby Not Found");
//     } else {
//         res.json(updatedLobby);
//     }
// });
// //@description     Add User to Group Lobby
// //@route           PUT /api/lobby/add
// //@access          Protected
// const addToGroupLobby = asyncHandler(async (req, res) => {
//     const { lobbyId, userId } = req.body;
//
//     const addedLobby = await Lobby.findByIdAndUpdate(
//         lobbyId,
//         { $push: { users: { userId, hasFinished: false } } },
//         { new: true }
//     ).populate("users.userId", "-password");
//
//     if (!addedLobby) {
//         res.status(404).send("Lobby Not Found");
//     } else {
//         res.json(addedLobby);
//     }
// });