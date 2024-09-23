import { useEffect } from "react";
import { BellIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuList, MenuItem, Text, Box, Button } from "@chakra-ui/react";
import axios from "axios";
import { LobbyState } from "../../../context/appProvider";

const NotificationMenu = () => {
    const { notifications, setNotifications, user } = LobbyState([]);

    // Загружаем уведомления при монтировании компонента
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const { data } = await axios.get("/api/lobby/notifications", config);
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        fetchNotifications();
    }, [setNotifications, user]);

    // Обработчик для кнопки "галочка"
    const handleAccept = async (notification) => {
        try {
            await axios.put(`/api/lobby/${notification.lobbyId}/permissions`, { permission: true }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            await axios.put(`/api/lobby/${notification._id}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
        } catch (error) {
            console.error("Error updating notification", error);
        }
    };

    // Обработчик для кнопки "крестик"
    const handleDecline = async (notification) => {
        try {
            await axios.put(`/api/lobby/${notification._id}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
        } catch (error) {
            console.error("Error updating notification", error);
        }
    };

    return (
        <Menu>
            <MenuButton p={1}>
                {notifications.length > 0 ? (
                    <BellIcon fontSize="2xl" color="orange.500" m={1} />
                ) : (
                    <BellIcon fontSize="2xl" color="gray.500" m={1} />
                )}
            </MenuButton>
            <MenuList pl={2}>
                {Array.isArray(notifications) && notifications.length === 0 ? (
                    <Box>
                        <Text>Нет новых уведомлений</Text>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem key={notification._id}>
                            <Box>
                                <Text>{notification.message}</Text>
                                <Button
                                    onClick={() => handleAccept(notification)}
                                    colorScheme="green"
                                    size="xs"
                                    m={1}
                                    leftIcon={<CheckIcon />}
                                >
                                    Принять
                                </Button>
                                <Button
                                    onClick={() => handleDecline(notification)}
                                    colorScheme="red"
                                    size="xs"
                                    m={1}
                                    leftIcon={<CloseIcon />}
                                >
                                    Отклонить
                                </Button>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </MenuList>
        </Menu>
    );
};

export default NotificationMenu;
