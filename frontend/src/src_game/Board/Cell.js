import React from "react";

const Cell = ({ filled, color, x, y, onDropPiece, onCellClick, removeHandler}) => {
    const handleDrop = (e) => {
        e.preventDefault();

        const pieceData = e.dataTransfer.getData("piece");
        const color = e.dataTransfer.getData("color");
        removeHandler(color);
        if (pieceData) {
            const piece = JSON.parse(pieceData);
            onDropPiece(piece, { x, y }, color);
        }
    };
    const handleClick = () => {
        onCellClick(x, y);
    };

    return (
        <div
            className={`cell ${filled ? "filled" : ""} dropzone`}
            style={{ backgroundColor: color || "transparent" }}
            onDrop={handleDrop}
            onClick={handleClick}
        ></div>
    );
};

export default Cell;
