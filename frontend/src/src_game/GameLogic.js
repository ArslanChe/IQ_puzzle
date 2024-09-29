import React, {useEffect, useState} from "react";
import { Flex, Center, Box } from "@chakra-ui/react";
import PieceSelector from "./Shapes/PieceSelector";
import GameBoard from "./Board/GameBoard";
import initialBoard from "./parametrs/availableBoard";
import initialPieces from "./parametrs/availableShapes";
const GameLogic = ({gameStarted, onGameEnd, salt}) => {
    const [pieces, setPieces] = useState(initialPieces);
    // Поворот фигуры
    const handleRotatePiece = (value, rotatedShape) => {
        const newPieces = pieces.map(piece => {
            if (piece.value === value) {
                return { ...piece, shape: rotatedShape };
            }
            return piece;
        });
        setPieces(newPieces);
    };
    // Удаление фигуры из выбора
    const handleRemovePieceFromSelector = (color) => {
        const updatedPieces = pieces.map(piece => {
            if (piece.color === color) {
                return { ...piece, exist: false };  // Обновляем поле exist на false
            }
            return piece;  // Если цвет не совпадает, возвращаем фигуру без изменений
        });
        setPieces(updatedPieces);  // Обновляем состояние
    };
    // Добавление фигуры к выбору
    const handleAddPieceFromSelector = (color) => {
        const updatedPieces = pieces.map(piece => {
            if (piece.color === color) {
                return { ...piece, exist: true };  // Обновляем поле exist на false
            }
            return piece;  // Если цвет не совпадает, возвращаем фигуру без изменений
        });
        setPieces(updatedPieces);  // Обновляем состояние
    };

    useEffect(() => {
        handleRemovePieceFromSelector(salt.piece.color)
    }, []);

    return (
        <>
            <Flex
                p={4}
                bg="transparent"
                borderRadius="md"
                boxShadow="md"
                direction="row"
                overflowX="auto"
                mb={4}
                height="400px"
            >
                <PieceSelector
                    pieces={pieces}
                    onRotatePiece={handleRotatePiece}
                />
            </Flex>
            <Center>
                <Box>
                    <GameBoard
                        initialBoard={initialBoard}
                        salt = {salt}
                        gameStarted={gameStarted}
                        onGameEnd={onGameEnd}
                        removeHandler={handleRemovePieceFromSelector}
                        addHandler={handleAddPieceFromSelector}
                    />
                </Box>
            </Center>

        </>
    );
};

export default GameLogic;
