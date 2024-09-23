import React, { useState } from "react";
import { rotateMatrix } from "../Logic/rotateMatrix"; // Импорт функции поворота
const flipMatrix = (matrix) => {
    return matrix.map(row => row.reverse());
};

const Piece = ({ shape, color, onRotate }) => {
    const [currentShape, setCurrentShape] = useState(shape);
    const handleRightClick = (e) => {
        e.preventDefault(); // Предотвращаем стандартное меню ПКМ
        const flippedShape = flipMatrix(currentShape);
        setCurrentShape(flippedShape); // Обновляем состояние с новой формой
        onRotate(flippedShape); // Передаем обновленную фигуру родителю
    };
    const handleClick = () => {
        const rotatedShape = rotateMatrix(currentShape);
        setCurrentShape(rotatedShape);
        onRotate(rotatedShape); // Передаем обновленную фигуру родителю
    };

    return (
        <div
            id={`${shape}`}
            className="piece"
            draggable="true"

            onDragStart={(e) =>
            {
                e.dataTransfer.setData("piece", JSON.stringify(shape));
                e.dataTransfer.setData("color", color);
                e.currentTarget.style.backgroundColor = "transparent";
            }}
            onContextMenu={handleRightClick}
            onClick={handleClick} // Добавляем обработчик клика

            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${currentShape[0].length}, 30px)`,
                backgroundColor: "transparent",
            }}
        >
            {currentShape.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`cell ${cell ? "filled" : ""}`}
                        style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: cell ? color : "transparent",
                            border: cell ? "1px solid #333" : "none", // Граница только у заполненных клеток
                        }}
                    ></div>
                ))
            )}
        </div>
    );
};

export default Piece;
