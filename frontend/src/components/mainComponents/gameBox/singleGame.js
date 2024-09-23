import { Box, Stack, Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LobbyState } from "../../../context/appProvider";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "../../profile/profileModal";
import { getSender, getSenderFull } from "../../../config/logic";
import GameApp from "../../../src_game/GameApp";
// Helper function to get button state from localStorage
const getLobbyStateFromStorage = () => {
  const savedState = localStorage.getItem("lobbyState");
  return savedState ? JSON.parse(savedState) : {};
};

// Helper function to save button state to localStorage
const saveLobbyStateToStorage = (state) => {
  localStorage.setItem("lobbyState", JSON.stringify(state));
};

const SingleGame = ({ fetchAgain, setFetchAgain }) => {
  const [lobbyStates, setLobbyStates] = useState(getLobbyStateFromStorage());

  const { selectedLobby, setSelectedLobby, user } = LobbyState();

  useEffect(() => {
    if (selectedLobby) {
      setLobbyStates((prev) => {
        if (!prev[selectedLobby._id]) {
          const newLobbyState = {
            isStartButtonClicked: false,
            buttonState: {},
            timer: 0,
            isTimerActive: false,
            allButtonsPressed: false,
          };
          // Save initial state to localStorage
          saveLobbyStateToStorage({
            ...prev,
            [selectedLobby._id]: newLobbyState,
          });
          return {
            ...prev,
            [selectedLobby._id]: newLobbyState,
          };
        }
        return prev;
      });
    }
  }, [selectedLobby]);

  useEffect(() => {
    if (selectedLobby) {
      const lobbyId = selectedLobby._id;
      if (lobbyStates[lobbyId]?.isTimerActive) {
        const interval = setInterval(() => {
          setLobbyStates((prev) => {
            const updatedTimer = prev[lobbyId].timer + 1;
            const updatedState = {
              ...prev,
              [lobbyId]: {
                ...prev[lobbyId],
                timer: updatedTimer,
              },
            };
            saveLobbyStateToStorage(updatedState);
            return updatedState;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [lobbyStates, selectedLobby]);

  useEffect(() => {
    if (selectedLobby) {
      const lobbyId = selectedLobby._id;
      const buttonState = lobbyStates[lobbyId]?.buttonState || {};
      if (buttonState.button1 && buttonState.button2 && buttonState.button3) {
        setLobbyStates((prev) => {
          const updatedState = {
            ...prev,
            [lobbyId]: {
              ...prev[lobbyId],
              isTimerActive: false,
              allButtonsPressed: true,
            },
          };
          saveLobbyStateToStorage(updatedState);
          return updatedState;
        });
      }
    }
  }, [lobbyStates, selectedLobby]);

  return (
      <>
        {selectedLobby ? (
            <>
              <Text
                  fontSize={{ base: "28px", md: "30px" }}
                  pb={3}
                  px={2}
                  w="100%"
                  fontFamily="Work sans"
                  display="flex"
                  justifyContent={{ base: "space-between" }}
                  alignItems="center"
              >
                <ArrowBackIcon
                    display={{ base: "flex", md: "none" }}
                    onClick={() => setSelectedLobby("")}
                />
                {!selectedLobby.isGroupLobby ? (
                    <>
                      {getSender(user, selectedLobby.users.map(u => u.userId))}
                      <ProfileModal
                          user={getSenderFull(user, selectedLobby.users.map(u => u.userId))}
                      />
                    </>
                ) : (
                    <>
                      {selectedLobby.lobbyName.toUpperCase()}
                    </>
                )}
              </Text>
              <Box>
                <GameApp/>
              </Box>

            </>
        ) : (
            <Box display="flex" alignItems="center" justifyContent="center" h="100%">
              <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                Создайте лобби для начала новой игры
              </Text>
            </Box>
        )}
      </>
  );
};

export default SingleGame;
