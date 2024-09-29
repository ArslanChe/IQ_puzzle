import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { GiCrossedSwords } from "react-icons/gi";
import ProfileModal from "../profile/profileModal";
import {FaUser} from "react-icons/fa"; // Иконка мечей, нужно добавить соответствующий импорт

const UserListItem = ({ user, handleFunction }) => {
    return (
        <HStack
            justify="space-between"
            p={3}
            borderRadius="md"
            borderWidth="1px"
            mb={2}
        >
            <Text fontSize="lg">{user.name}</Text>
            <HStack spacing={2}>
                {/* Кнопка для создания лобби-дуэли */}
                <Button
                    onClick={handleFunction}
                    colorScheme="teal"
                    variant="outline"
                    size="sm"
                >
                    <GiCrossedSwords /> {/* Используйте нужную иконку */}
                </Button>
                {/* Кнопка для просмотра профиля */}
                <ProfileModal user={user}>
                    <Button
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                    >
                        <FaUser />
                    </Button>
                </ProfileModal>
            </HStack>
        </HStack>
    );
};

export default UserListItem;
