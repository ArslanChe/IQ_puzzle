const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Схема отображения пользователя в бд
const userSchema = mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    averageCompletionTime: { type: Number, default: 0 },  // Среднее время завершения игр в секундах
    totalGamesPlayed: { type: Number, default: 0 },       // Общее количество игр
  },
  { timestaps: true }
);
// Сравнение совпадающих паролей
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Перед сохранением пароля мы его шифруем, чтобы он отображался в зашифрованном виде в бд
userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
