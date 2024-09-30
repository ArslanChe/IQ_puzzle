const mongoose = require('mongoose');

const gameLobbyModel = mongoose.Schema(
    {
        lobbyName: {type: String, trim: true, required: true},
        isGroupLobby: {type: Boolean, default: false},
        users: [
            {
                userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
                hasStarted: {type: Boolean, default: false}, // Указывает, начал ли пользователь игру
                hasFinished: {type: Boolean, default: false},
                completionTime: {type: Number, default: 0}, // Время завершения в секундах
                show: { type: Boolean, default: true }, // Показывать ли лобби пользователю
                permission: { type: Boolean, default: false } // Принимает ли пользователь участие в этом лобби
            }
        ],
        gameSeed:
            {
                x: {type: Number, default: 0},
                y: {type: Number, default: 0},
                index: {type: Number, default: 0}
            }
    },
    {timestamps: true}
);

const Lobby = mongoose.model("GameLobby", gameLobbyModel);

module.exports = Lobby;
