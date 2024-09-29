import { ViewIcon } from "@chakra-ui/icons";
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
    IconButton,
    Text,
    Image,
    VStack,
    HStack,
} from "@chakra-ui/react";
// Формат времени в личной статистике
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins} мин ${secs} сек`;
};

const ProfileModal = ({user, children}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();

    return(
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
            )}
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent h="450px">
                    <ModalHeader
                        fontSize="40px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align="start" spacing={3}>
                            <HStack spacing={3}>
                                <Image
                                    borderRadius="full"
                                    boxSize="150px"
                                    src={user.pic}
                                    alt={user.name}
                                />
                            </HStack>
                            <Text
                                fontSize={{ base: "22px", md: "24px" }}
                                fontFamily="Work sans"
                            >
                                Email: {user.email}
                            </Text>
                            <Text
                                fontSize={{ base: "22px", md: "24px" }}
                                fontFamily="Work sans"
                            >
                                Среднее время: {user.averageCompletionTime ? formatTime(user.averageCompletionTime) : 'Неизвестно'}
                            </Text>
                            <Text
                                fontSize={{ base: "22px", md: "24px" }}
                                fontFamily="Work sans"
                            >
                                Количество игр: {user.totalGamesPlayed || 0}
                            </Text>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>)
};

export default ProfileModal;
