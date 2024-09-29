export const rotateMatrix = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotatedMatrix = [];

    for (let col = 0; col < cols; col++) {
        const newRow = [];
        for (let row = rows - 1; row >= 0; row--) {
            newRow.push(matrix[row][col]);
        }
        rotatedMatrix.push(newRow);
    }
    return rotatedMatrix;
};

