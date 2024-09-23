import React, {useEffect, useState} from "react";
import {Box, Flex, Text, Center, Button} from "@chakra-ui/react";
import {LobbyState} from "../context/appProvider";
import axios from "axios";
import GameLogic from "./GameLogic";
import initialPieces from "./parametrs/availableShapes";

const GameApp = () => {
    const {selectedLobby, user, setUser} = LobbyState();
    const [startTime, setStartTime] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [salt, setSalt] = useState(null)
    // Загрузка страницы
    const [dataLoading, setDataLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    // Пользователи данного лобби
    const [users, setUsers] = useState([]);
    // Время прохождения
    const [completionTime, setCompletionTime] = useState(null);


    // Обработчик Начало игры
    const startGame = async () => {
        setLoading(true);
        try {
            // Запрос для получения gameSeed из базы данных
            const { data } = await axios.get(`/api/lobby/${selectedLobby._id}/gameSeed`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            const { x, y, index } = data.gameSeed; // Извлекаем координаты и индекс фигуры из ответа

            // Обновляем объект salt на основе полученных данных
            const salt = {
                coordinates: { x, y },
                piece: initialPieces[index] // Используем индекс для выбора фигуры
            };
            setSalt(salt);
            console.log(salt)

            await axios.put(`/api/lobby/${selectedLobby._id}/start`, {
                userId: user._id,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setGameStarted(true);
            setStartTime(Date.now() / 1000);
        } catch (error) {
            console.error("Ошибка обновления статуса начала игры:", error);
        }
        setLoading(false);
    };
    // Обработчик Конец игры
    const finishGame = async () => {
        const endTime = Date.now() / 1000;
        const timeSpent = endTime - startTime;

        try {
            await axios.put(`/api/lobby/${selectedLobby._id}/finish`, {
                userId: user._id,
                completionTime: timeSpent,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            await axios.put(`/api/user/${user._id}/updateScore`, {
                newCompletionTime: timeSpent, // Передаем время завершения игры
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            // Обновляем данные пользователя локально
            const updatedUser = {
                ...user,  // сохраняем все другие поля
                totalGamesPlayed: user.totalGamesPlayed + 1, // обновляем количество игр
                averageCompletionTime:
                    (user.averageCompletionTime * user.totalGamesPlayed + timeSpent) / (user.totalGamesPlayed + 1) // новое среднее время
            };
            // Save to local storage
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            // Обновляем состояние пользователя в контексте
            setUser(updatedUser);

            setGameFinished(true);
            setCompletionTime(timeSpent);
            await fetchUsers(); // Получаем данные всех пользователей после завершения игры
        } catch (error) {
            console.error("Ошибка обновления статуса завершения игры:", error);
        }
    };
    // Получить пользователей этого лобби
    const fetchUsers = async () => {
        try {
            const {data} = await axios.get(`/api/lobby/${selectedLobby._id}/users`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setUsers(data);
        } catch (error) {
            console.error("Ошибка получения пользователей:", error);
        }
    };
    // Время выполнения игры
    const getCompletionTime = async () => {
        try {
            const {data} = await axios.get(`/api/lobby/${selectedLobby._id}/completionTime`, {
                params: {userId: user._id},
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setCompletionTime(data.completionTime);
        } catch (error) {
            console.error("Ошибка получения времени завершения:", error);
        }
    };
    // Хук для смены игрового лобби
    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            if (selectedLobby && user) {
                await getCompletionTime();
                await fetchUsers();
                const {data: finishData} = await axios.get(
                    `/api/lobby/${selectedLobby._id}/hasFinished`,
                    {
                        params: {userId: user._id},
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
                setGameFinished(finishData.hasFinished);
            }
            setDataLoading(false);
        };

        fetchData();
    }, [selectedLobby, user]);

    return (
        <Box className="app" p={4}>
            <Center>
                {dataLoading ? (
                    <Text>Загрузка данных...</Text>
                ) : gameFinished ? (
                    <Box textAlign="center">
                        <Text fontSize="2xl" mb={4}>Игра завершена!</Text>
                        <Text fontSize="lg">
                            Время
                            завершения: {completionTime ? `${Math.floor(completionTime / 60)} мин ${Math.floor(completionTime % 60)} сек` : "Неизвестно"}
                        </Text>
                        <Box mt={4}>
                            <Text fontSize="xl" mb={2}>Результаты
                                пользователей:{console.log('Users data:', users)}</Text>
                            {users.map(user => (
                                <Box key={user.userId._id} mb={2}>
                                    <Text>
                                        {user.userId.name}: {user.hasFinished ? `${Math.floor(user.completionTime / 60)} мин ${Math.floor(user.completionTime % 60)} сек` : "Не начато"}
                                    </Text>
                                </Box>
                            ))}
                        </Box>

                    </Box>
                ) : (
                    <Box textAlign="center">
                        {loading ? (
                            <Text>Загрузка...</Text>
                        ) : (
                            gameStarted ? (
                                <GameLogic
                                    gameStarted={gameStarted}
                                    onGameEnd={finishGame}
                                    salt={salt}
                                />
                            ) : (
                                <Button onClick={startGame}>Начать игру</Button>
                            )
                        )}
                    </Box>
                )}
            </Center>
        </Box>
    );
};

export default GameApp;
