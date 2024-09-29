import { Box } from "@chakra-ui/layout";
import "../../styles.css";
import SingleGame from "./singleGame";
import  { LobbyState } from "../../../context/appProvider";

const GameBox = ({ fetchAgain, setFetchAgain }) => {
    const { selectedLobbies } = LobbyState();

    return (
        <Box
            display={{ base: selectedLobbies ? "flex" : "none", md: "flex" }}
            alignItems="center"
            flexDir="column"
            p={3}
            bg="white"
            w={{ base: "100%", md: "81%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <SingleGame fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </Box>
    );
};

export default GameBox;