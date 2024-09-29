const initialPieces = [
    // { shape: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], color: "Gold", value: 0, exist: false },
    { shape: [[1, 1, 0], [1, 1, 1]], color: "red", value: 1, exist: true },
    { shape: [[1, 1, 1, 1], [0, 0, 1, 0]], color: "blue", value: 2, exist: true },
    { shape: [[1, 1, 1], [1, 0, 1]], color: "green", value: 3, exist: true },
    { shape: [[1, 1, 1], [0, 1, 0]], color: "yellow", value: 4, exist: true },
    { shape: [[0, 1, 1], [1, 1, 0]], color: "purple", value: 5, exist: true },
    { shape: [[1, 0, 0, 0], [1, 1, 1, 1]], color: "pink", value: 6, exist: true },
    { shape: [[1, 1, 0, 0], [0, 1, 1, 1]], color: "orange", value: 7, exist: true },
    { shape: [[1, 0], [1, 1]], color: "brown", value: 8, exist: true},
    { shape: [[0, 1, 0], [1, 1, 1], [1, 0, 0]], color: "cyan", value: 9, exist: true },
    { shape: [[1, 1], [1, 0], [1, 0]], color: "magenta", value: 10, exist: true },
    { shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: "lime", value: 11, exist: true },
    { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 1]], color: "teal", value: 12, exist: true },
];

export default initialPieces;
