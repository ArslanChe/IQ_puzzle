const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, // Ссылка на пользователя
        lobbyId: {type: mongoose.Schema.Types.ObjectId, ref: "GameLobby", required: true}, // Ссылка на лобби
        message: {type: String, required: true}, // Сообщение уведомления
        done: {type: Boolean, default: false}
    },
    {timestamps: true}
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;