const asyncHandler = require("express-async-handler");
const Lobby = require("../models/lobbyModel");
const User = require("../models/userModel");
const Notification = require('../models/notificationModel'); // Импорт модели уведомлений

//@description     Create or fetch One-to-One Lobby
//@route           POST /api/lobby/
//@access          Protected
const createDuelLobby = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    // Поиск всех дуэльных лобби между текущим пользователем и указанным пользователем
    const existingLobbiesCount = await Lobby.countDocuments({
        isGroupLobby: false,
        $and: [
            { users: { $elemMatch: { userId: req.user._id } } },
            { users: { $elemMatch: { userId: userId } } },
        ],
    });

    // Генерация случайных координат и индекса фигуры
    const randomX = Math.floor(Math.random() * 3);
    const randomY = Math.floor(Math.random() * 7);

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * 12); // от 0 до 11
    } while (randomIndex === 5 || randomIndex === 9 || randomIndex === 11);

    // Получаем имена пользователей для названия лобби
    const currentUser = await User.findById(req.user._id).select("name");
    const opponentUser = await User.findById(userId).select("name");

    const lobbyName = `Duel ${existingLobbiesCount + 1}`;

    var lobbyData = {
        lobbyName, // Используем сгенерированное название
        isGroupLobby: false,
        users: [
            { userId: req.user._id, hasFinished: false, permission: true }, // Устанавливаем permission в true для создателя
            { userId, hasFinished: false, permission: false } // Устанавливаем permission в false для оппонента
        ],
        gameSeed: {
            x: randomX,
            y: randomY,
            index: randomIndex
        }
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
});

//@description     Fetch all lobbies for a user
//@route           GET /api/lobby/
//@access          Protected
const getUserLobbies = asyncHandler(async (req, res) => {
    try {
        const results = await Lobby.find({
            users: {
                $elemMatch: {
                    userId: req.user._id,
                    show: true,
                    permission:true
                }
            }
        })
            .populate("users.userId", "-password")
            .sort({ updatedAt: -1 });

        res.status(200).send(results);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
//@description     Update user's show status in a lobby
//@route           PUT /api/lobby/show-status
//@access          Protected
const updateUserShowStatus = asyncHandler(async (req, res) => {
    const { lobbyId } = req.body;

    if (!lobbyId) {
        return res.status(400).send({ message: "Lobby ID is required" });
    }

    try {
        const lobby = await Lobby.findOneAndUpdate(
            { _id: lobbyId, "users.userId": req.user._id },
            { $set: { "users.$.show": false } }, // Обновляем поле show
            { new: true } // Возвращаем обновленный документ
        ).populate("users.userId", "-password");

        if (!lobby) {
            return res.status(404).send({ message: "Lobby not found or user not in lobby" });
        }

        res.status(200).send(lobby);
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
    console.log(users);

    if (users.length < 2) {
        return res.status(400).send("More than 1 user is required to form a game lobby");
    }

    // Ensure the current user is included in the list
    if (!users.includes(req.user._id.toString())) {
        users.push(req.user._id.toString());
    }

    try {
        // Генерация случайных координат и индекса фигуры
        const randomX = Math.floor(Math.random() * 3); // от 0 до 3
        const randomY = Math.floor(Math.random() * 7); // от 0 до 9

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * 12); // от 0 до 11
        } while (randomIndex === 5 || randomIndex === 9 || randomIndex === 11);

        const groupLobby = await Lobby.create({
            lobbyName: name,
            users: users.map((userId, index) => ({
                userId,
                hasFinished: false,
                permission: userId === req.user._id.toString() // Устанавливаем permission в true для создателя
            })),
            isGroupLobby: true,
            gameSeed: {
                x: randomX,
                y: randomY,
                index: randomIndex
            }
        });

        const fullGroupLobby = await Lobby.findOne({ _id: groupLobby._id })
            .populate("users.userId", "-password");

        res.status(200).json(fullGroupLobby);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});







//@description     Create Notifications for Users
//@route           POST /api/lobby/notifications
//@access          Protected
const createNotificationsForLobby = asyncHandler(async (req, res) => {
    const { lobbyId, creatorId, creatorName, lobbyName, userIds } = req.body;

    if (!lobbyId || !creatorId || !creatorName || !lobbyName || !userIds || userIds.length < 1) {
        return res.status(400).send({ message: "Invalid data" });
    }

    try {
        // Создание уведомлений для всех пользователей, кроме создателя
        const notifications = userIds
            .filter(userId => userId !== creatorId) // Исключаем создателя
            .map(userId => ({
                userId,
                lobbyId,
                message: `${creatorName} приглашает в игру ${lobbyName}`, // Используем переданное имя создателя
            }));

        await Notification.insertMany(notifications); // Сохранение всех уведомлений в базе данных

        res.status(201).json({ message: "Notifications created successfully", notifications });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
//@description     Get user notifications
//@route           GET /api/notifications
//@access          Protected
const getUserNotifications = asyncHandler(async (req, res) => {
    try {
        // Get notifications for the logged-in user where 'done' is false (unread notifications)
        const notifications = await Notification.find({
            userId: req.user._id,
            done: false,
        });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
//@description     Update lobby permissions
//@route           PUT /api/lobby/:lobbyId/permissions
//@access          Protected
const updateLobbyPermissions = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;
    const userId = req.user._id; // Получаем ID текущего пользователя

    try {
        const lobby = await Lobby.findById(lobbyId);

        if (!lobby) {
            return res.status(404).json({ message: "Lobby not found" });
        }

        // Находим пользователя в массиве users
        const user = lobby.users.find(u => u.userId.toString() === userId.toString());

        if (!user) {
            return res.status(404).json({ message: "User not found in this lobby" });
        }

        // Изменяем разрешение для данного пользователя
        user.permission = true;

        // Сохраняем обновленное лобби
        await lobby.save();

        res.status(200).json({ message: "Lobby permissions updated successfully", lobby });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//@description     Mark notification as read
//@route           PUT /api/lobby/:notificationId/read
//@access          Protected
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Изменяем статус уведомления на прочитанное
        notification.done = true; // Убедитесь, что поле `done` есть в модели Notification
        await notification.save();

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// @description     Get the game seed of a specific lobby
// @route           GET /api/lobby/:lobbyId/gameSeed
// @access          Protected
const getGameSeed = asyncHandler(async (req, res) => {
    const { lobbyId } = req.params;  // Получаем lobbyId из параметров запроса

    try {
        // Находим лобби по его ID
        const lobby = await Lobby.findById(lobbyId);

        if (!lobby) {
            return res.status(404).json({ message: 'Лобби не найдено' });
        }
        // Проверяем наличие gameSeed
        if (!lobby.gameSeed) {
            return res.status(400).json({ message: 'GameSeed отсутствует' });
        }
        // Возвращаем данные gameSeed
        return res.status(200).json({
            gameSeed: lobby.gameSeed
        });
    } catch (error) {
        console.error('Ошибка получения gameSeed:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = { getAllUsersInLobby };


module.exports = {
    createDuelLobby,
    createGroupLobby,
    getUserLobbies,
    updateUserShowStatus,
    removeFromGroupLobby,
    checkUserFinished,
    checkUserStarted,
    updateUserStartStatus,
    updateUserFinishStatus,
    getCompetitionTime,
    getAllUsersInLobby,
    getGameSeed,
    createNotificationsForLobby,
    getUserNotifications,
    updateLobbyPermissions,
    markNotificationAsRead
};