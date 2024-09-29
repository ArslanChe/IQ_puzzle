import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { LobbyState } from "../../../context/appProvider";
import UserBadgeItem from "../../userAvatar/UserBadgeItem";
import UserListItem from "../../userAvatar/UserListItem";

const CreateNewLobby = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupLobbyName, setGroupLobbyName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, lobbies, setLobbies} = LobbyState();

    const handleClearData = ()=>{
        setSearch("")
        setGroupLobbyName(null)
        setSelectedUsers([])
        setSearchResult([])
        setLoading(false)
    }
    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };
    const handleSubmit = async () => {
        if (!groupLobbyName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const usersToSend = [...selectedUsers.map((u) => u._id), user._id];
            const { data } = await axios.post(
                `/api/lobby/group`,
                {
                    name: groupLobbyName,
                    users: usersToSend, // Отправляем массив строк
                },
                config
            );

            // Отправляем уведомления пользователям
            const notificationConfig = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Собираем данные для уведомлений
            const notificationData = {
                lobbyId: data._id,
                creatorId: user._id,
                creatorName: user.name,
                lobbyName: data.lobbyName,
                userIds: usersToSend, // Уведомления отправляются всем пользователям
            };

            // Отправляем уведомления
            await axios.post(`/api/lobby/notifications`, notificationData, notificationConfig);

            setLobbies([data, ...lobbies]);
            handleClearData();
            onClose();
            toast({
                title: "New Group Lobby Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            toast({
                title: "Failed to Create the Lobby!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        Create Game Lobby
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input
                                placeholder="GameApp Name"
                                mb={3}
                                onChange={(e) => setGroupLobbyName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add Users eg: John, Jim, Jane"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            // Проверяем, введен ли текст в поле поиска
                            searchResult && searchResult.length > 0 && (
                                <Box w="100%" maxH="200px" overflowY="scroll">
                                    {searchResult
                                        ?.slice(0, 20) // Показываем до 20 результатов
                                        .map((user) => (
                                            <UserListItem
                                                key={user._id}
                                                user={user}
                                                handleFunction={() => handleGroup(user)}
                                            />
                                        ))}
                                </Box>
                            )
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleSubmit} colorScheme="blue">
                            Create GameApp
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );

};

export default CreateNewLobby;