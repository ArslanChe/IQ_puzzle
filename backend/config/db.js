// Подключение модуля для связи с бд - mongoose
const mongoose = require("mongoose");
// colors для отображения в консоль успешного подключения
require("colors");
// ассинхронный метод для подключения к бд по адресу MONGO_URI
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB;