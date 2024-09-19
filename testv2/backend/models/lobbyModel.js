const mongoose = require('mongoose');

const gameLobbyModel = mongoose.Schema(
    {
        lobbyName: { type: String, trim: true, required: true },
        isGroupLobby: { type: Boolean, default: false },
        users: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                hasFinished: { type: Boolean, default: false },
                completionTime: { type: Number, default: 0 }, // Время завершения в секундах
                hasStarted: { type: Boolean, default: false } // Указывает, начал ли пользователь игру
            }
        ],
    },
    { timestamps: true }
);

const Lobby = mongoose.model("GameLobby", gameLobbyModel);

module.exports = Lobby;
