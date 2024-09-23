import React, {useEffect, useState} from "react";
import Piece from "./Piece";

const PieceSelector = ({ pieces, onRotatePiece, onRemovePiece }) => {
    return (
        <div className="piece-selector" style={{display: 'flex', gap: '10px'}}>
            {pieces.map((piece) => (
                <div
                    key={piece.value}
                    style={{
                        width: '130px', // Фиксированная ширина
                        height: '130px', // Фиксированная высота
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'transparent'
                    }}
                >
                    {piece.exist ? (
                        <Piece
                            shape={piece.shape}
                            color={piece.color}
                            index={piece.value}
                            onRotate={(rotatedShape) => onRotatePiece(piece.value, rotatedShape)}
                        />
                    ) : null}
                </div>
            ))}
        </div>

    )
};
export default PieceSelector;
