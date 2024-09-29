import React, {useState, useEffect} from "react";
import Cell from "./Cell";
import {useToast} from "@chakra-ui/toast";

const GameBoard = ({initialBoard, gameStarted, onGameEnd, handleDrop, removeHandler, addHandler, salt}) => {
    const [board, setBoard] = useState(initialBoard);
    const [draggingPiece, setDraggingPiece] = useState(null);
    const [draggingPosition, setDraggingPosition] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    const toast = useToast();

    // Запуск таймера
    useEffect(() => {
        if (gameStarted) {
            const id = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
            setIntervalId(id);
            return () => clearInterval(id);
        }
    }, [gameStarted]);
    // Завершение игры
    useEffect(() => {
        if (gameEnded) {
            clearInterval(intervalId);
            onGameEnd();
        }
    }, [gameEnded, intervalId, onGameEnd]);
    // Формат времени на часах
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes} минут${minutes === 1 ? '' : 'ы'} ${secs} секунд${secs === 1 ? '' : 'ы'}`;
    };

    useEffect(() => {
        handleDropPiece(salt.piece.shape, salt.coordinates, salt.piece.color);
    }, []);

    const canPlacePiece = (piece, position) => {
        const {x, y} = position;
        return piece.every((row, rowIndex) =>
            row.every((cell, colIndex) => {
                const boardRow = board[x + rowIndex];
                if (!boardRow) return false;
                return boardRow[y + colIndex] === null || cell === 0;
            })
        );
    };

    const findNearestPosition = (piece, position) => {
        const {x, y} = position;
        let nearestPosition = null;
        let minDistance = Infinity;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                if (canPlacePiece(piece, {x: row, y: col})) {
                    const distance = Math.sqrt((row - x) ** 2 + (col - y) ** 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestPosition = {x: row, y: col};
                    }
                }
            }
        }

        return nearestPosition;
    };

    const isBoardFull = (board) => {
        return board.every(row => row.every(cell => cell !== null));
    };

    const handleDropPiece = (piece, position, color) => {
        if (!gameStarted || gameEnded) return;

        const nearestPosition = findNearestPosition(piece, position);
        if (nearestPosition) {
            const {x, y} = nearestPosition;

            const newBoard = board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const shouldFill =
                        piece[rowIndex - x] && piece[rowIndex - x][colIndex - y];
                    return shouldFill ? color : cell;
                })
            );

            setBoard(newBoard);

            // Если доска заполнена, завершаем игру
            if (isBoardFull(newBoard)) {
                setGameEnded(true);
            }
        } else {
            addHandler(color)
            toast({
                title: "Невозможно поместить деталь",
                description: "Попробуйте изменить расположение других деталей или выбрать подходящее место для этой",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
        setDraggingPiece(null);
        setDraggingPosition(null);
    };

    const handleCellClick = (x, y) => {
        if (gameEnded) return;

        const color = board[x][y];
        if (color) {
            if (color === salt.piece.color) return;
            addHandler(color)
            const newBoard = board.map(row =>
                row.map(cell => (cell === color ? null : cell))
            );
            setBoard(newBoard);
        }
    };

    // const handleRemovePiece = () => {
    //     if (!gameStarted || gameEnded) return;
    //
    //     setDraggingPiece(null);
    //     setDraggingPosition(null);
    // };

    return (
        <div>
            <div className="game-board dropzone"
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={handleDrop}
            >
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            filled={!!cell}
                            color={cell}
                            x={rowIndex}
                            y={colIndex}
                            onDropPiece={(piece, position, color) =>
                                handleDropPiece(piece, position, color)
                            }
                            onCellClick={handleCellClick}
                            handle={handleDrop}
                            removeHandler={removeHandler}

                            // onRemovePiece={handleRemovePiece}
                            // onDragStart={(piece, position) =>
                            //     handleDragStartFromBoard(piece, position)
                            // }
                        />
                    ))
                )}
            </div>
            {gameStarted && !gameEnded && <div className="timer">Время: {formatTime(timer)}</div>}
        </div>
    );
};

export default GameBoard;
