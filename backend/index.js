const express = require('express');
const dotenv = require("dotenv")
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes')
const lobbyRoutes = require('./routes/lobbyRoutes')


const {notFound, errorHandler} = require("./middlewares/errorMiddleware");
// Подключение к env файлу
dotenv.config();
// Подключение к бд
connectDB();
// Запуск сервера
const app = express();
// Обработка запросов к серверу
app.use(express.json())
app.use('/api/user',userRoutes)
app.use('/api/lobby',lobbyRoutes)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, console.log(`Server started on port ${PORT}`));