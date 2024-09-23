import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import SearchLoading from "../../additionalRendering/searchLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "../../profile/profileModal";
import UserListItem from "../../userAvatar/UserListItem";
import { LobbyState } from "../../../context/appProvider";
import React from 'react'
import NotificationMenu from "./notificationMenu";

const TopPanel = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const {
    setSelectedLobby,
    user,
    setUser,
    //notification,
    //setNotification,
    lobbies,
    setLobbies,
  } = LobbyState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  // Выход из системы
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
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
  const accessDuel = async (userId) => {
    try {
      setLoadingSearch(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/lobby`, { userId }, config);

      if (!lobbies.find((c) => c._id === data._id)) setLobbies([data, ...lobbies]);
      setSelectedLobby(data);

      // Отправляем уведомления пользователям
      const notificationConfig = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Собираем данные для уведомлений
      const notificationData = {
        lobbyId: data._id,
        creatorId: user._id,
        creatorName: user.name,
        lobbyName: data.lobbyName,
        userIds: [user._id, userId], // Уведомления отправляются всем пользователям
      };

      // Отправляем уведомления
      await axios.post(`/api/lobby/notifications`, notificationData, notificationConfig);

      setLoadingSearch(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the lobby",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
      <>
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
            w="100%"
            p="5px 10px 5px 10px"
            borderWidth="5px"
        >
          <Tooltip label="Search Users to Duel" hasArrow placement="bottom-end">
            <Button variant="ghost" onClick={onOpen}>
              <i className="fas fa-search"></i>
              <Text d={{base: "none", md: "flex"}} px={4}>
                Search User
              </Text>
            </Button>
          </Tooltip>
          <Text fontSize="2xl" fontFamily="Work sans">
            IQsputnik
          </Text>
          {/*Правая сторона Top panel*/}
          <div>
            <NotificationMenu/>
            <Menu>
              <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon/>}>
                <Avatar
                    size="sm"
                    cursor="pointer"
                    name={user.name}
                    src={user.pic}
                />
              </MenuButton>
              {/*Кнопка профиля*/}
              <MenuList>
                <ProfileModal user = {user}>
                <MenuItem>My Profile </MenuItem>
                </ProfileModal>
                <MenuDivider/>
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
              {/* Кнопка профиля */}
            </Menu>
          </div>
          {/*Правая сторона Top panel*/}
        </Box>
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
            <DrawerBody>
              <Box display="flex" pb={2}>
                <Input
                    placeholder="Search by name or email"
                    mr={2}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </Box>
              {loading ? (
                  <SearchLoading />
              ) : (
                  searchResult?.map((user) => (
                      <UserListItem
                          key={user._id}
                          user={user}
                          handleFunction={() => accessDuel(user._id)}
                      />
                  ))
              )}
              {loadingSearch && <Spinner ml="auto" display="flex" />}
            </DrawerBody>
          </DrawerContent>
        </Drawer>


      </>)
}

export default TopPanel;