const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Search users with regex
//@route           GET /api/user?search=
//@access          Protected
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/user/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email)
  const user = await User.findOne({ email });
  console.log(email)
  console.log(user)

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      averageCompletionTime: user.averageCompletionTime,
      totalGamesPlayed: user.totalGamesPlayed,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// @description     Update user's average game completion time and total games played
// @route           PUT /api/user/:userId/updateScore
// @access          Protected
const updateUserScore = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newCompletionTime } = req.body;  // Новое время завершения игры

  try {
    // Находим пользователя по его ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Обновляем общее количество игр
    user.totalGamesPlayed += 1;

    // Рассчитываем новое среднее время завершения игр
    user.averageCompletionTime =
        (user.averageCompletionTime * (user.totalGamesPlayed - 1) + newCompletionTime) / user.totalGamesPlayed;

    // Сохраняем обновленные данные пользователя
    await user.save();

    res.status(200).json({
      message: "Статистика пользователя обновлена",
      averageCompletionTime: user.averageCompletionTime,
      totalGamesPlayed: user.totalGamesPlayed
    });
  } catch (error) {
    console.error("Ошибка обновления статистики пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
module.exports = {registerUser, authUser, allUsers, updateUserScore};
