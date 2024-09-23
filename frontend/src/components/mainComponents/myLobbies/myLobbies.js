import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../../../config/logic";
import SearchLoading from "../../additionalRendering/searchLoading";
import CreateNewLobby from "./createNewLobby";
import {Button, IconButton} from "@chakra-ui/react";
import { LobbyState } from "../../../context/appProvider";
import { CloseIcon } from "@chakra-ui/icons";

const MyLobbies = () => {
    const [loggedUser, setLoggedUser] = useState();

    const { selectedLobby, setSelectedLobby, user, lobbies, setLobbies } = LobbyState();

    const toast = useToast();

    const fetchLobbies = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/lobby", config);
            setLobbies(data);
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to Load the Lobby",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const handleDeleteLobby = async (lobbyId) => {
        try {
            // Отправляем запрос на сервер для изменения состояния show
            await axios.put("/api/lobby/show-status", { lobbyId }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            // Обновляем состояние локального списка лобби
            setLobbies(lobbies.filter(lobby => lobby._id !== lobbyId));

            toast({
                title: "Lobbies Updated",
                description: "The lobby has been successfully removed from your view.",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to update lobby visibility.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchLobbies();
    }, []);

    return (
        <Box
            display={{ base: selectedLobby ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            bg="white"
            w={{ base: "100%", md: "18%" }}
            borderRadius="lg"
            borderWidth="1px"
            h="88vh"
        >
            <Box
                pb={3}
                px={3}
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
                display="flex"
                w="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <CreateNewLobby>
                    <Button
                        display="flex"
                        fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                        rightIcon={<AddIcon />}
                    >
                        New Game Lobby
                    </Button>
                </CreateNewLobby>
            </Box>
            <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="#F8F8F8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {lobbies ? (
                    <Stack overflowY="scroll">
                        {lobbies.map((lobby) => (
                            <Box
                                key={lobby._id}
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                onClick={() => setSelectedLobby(lobby)}
                                cursor="pointer"
                                bg={selectedLobby === lobby ? "#38B2AC" : "#E8E8E8"}
                                color={selectedLobby === lobby ? "white" : "black"}
                                px={3}
                                py={2}
                                borderRadius="lg"
                            >
                                <Text>
                                    {!lobby.isGroupLobby
                                        ? `${getSender(loggedUser, lobby.users.map(user => user.userId))} (${lobby.lobbyName.split(' ').pop()}) `
                                        : lobby.lobbyName}
                                </Text>
                                <IconButton
                                    icon={<CloseIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Предотвращает обработку клика на всю карточку
                                        handleDeleteLobby(lobby._id);
                                    }}
                                    size="sm"
                                    aria-label="Delete Lobby"
                                    variant="outline"
                                    colorScheme="red"
                                />
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <SearchLoading />
                )}
            </Box>
        </Box>
    );
};

export default MyLobbies;