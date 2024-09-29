import { Box } from "@chakra-ui/layout";
import GameBox from "../components/mainComponents/gameBox/gameBox";
import MyLobbies from "../components/mainComponents/myLobbies/myLobbies";
import TopPanel from "../components/mainComponents/topPanel/topPanel";
import { LobbyState } from "../context/appProvider";

const MainPage = () => {
  const { user } = LobbyState();

  return (
    <div style={{ width: "100%" }}>
      {user && <TopPanel />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyLobbies/>}
        {user && <GameBox/>}
      </Box>
    </div>
  );
};

export default MainPage;
