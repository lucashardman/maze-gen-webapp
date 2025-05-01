import { useState, useEffect, useCallback } from "react";

export async function getServerSideProps() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const res = await fetch(
        `${process.env.MAZE_API_URI}?height=15&width=20&mazeAlgorithm=RandomizedKruskal&seed=-1`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    const maze = await res.json();

    return {
        props: {
            maze,
        },
    };
}

function HomeScreen({ maze }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPoint] = useState({ x: 0, y: 0 });
    const [finishPoint] = useState({ x: maze[0].length - 1, y: maze.length - 1 });
    const [visitedCells, setVisitedCells] = useState(
        Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false))
    );
    const [moveCount, setMoveCount] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);

    // Função para atualizar a posição do jogador
    const movePlayer = useCallback((newX, newY) => {
        if (
            newX >= 0 &&
            newX < maze[0].length &&
            newY >= 0 &&
            newY < maze.length
        ) {
            // Atualiza a posição do jogador
            setPosition({ x: newX, y: newY });
            setMoveCount(prev => prev + 1);

            // Verifica se chegou ao final
            if (newX === finishPoint.x && newY === finishPoint.y) {
                setGameCompleted(true);
            }
        }
    }, [maze, finishPoint]);

    // Função para lidar com as teclas pressionadas
    const handleKeyDown = useCallback((event) => {
        if (gameCompleted) return;

        const { x, y } = position;

        switch (event.key) {
            case "ArrowUp":
                if (y > 0 && maze[y][x].upEdge) movePlayer(x, y - 1);
                break;
            case "ArrowDown":
                if (y < maze.length - 1 && maze[y][x].downEdge) movePlayer(x, y + 1);
                break;
            case "ArrowLeft":
                if (x > 0 && maze[y][x].leftEdge) movePlayer(x - 1, y);
                break;
            case "ArrowRight":
                if (x < maze[0].length - 1 && maze[y][x].rightEdge) movePlayer(x + 1, y);
                break;
            default:
                break;
        }
    }, [position, maze, movePlayer, gameCompleted]);

    // Resetar o jogo
    const resetGame = useCallback(() => {
        setPosition({ x: 0, y: 0 });
        setVisitedCells(Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false)));
        setMoveCount(0);
        setGameCompleted(false);
    }, [maze]);

    useEffect(() => {
        // Marcar a célula atual como visitada
        setVisitedCells(prev => {
            const newVisited = [...prev];
            newVisited[position.y][position.x] = true;
            return newVisited;
        });

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [position, handleKeyDown]);

    // Gerar cores de gradiente para células visitadas
    const getVisitedCellColor = (rowIndex, cellIndex) => {
        if (!visitedCells[rowIndex][cellIndex]) return "bg-white";

        // Distância da célula atual
        const distance = Math.abs(rowIndex - position.y) + Math.abs(cellIndex - position.x);

        if (distance <= 1) return "bg-indigo-100";
        if (distance <= 3) return "bg-indigo-50";
        return "bg-blue-50";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 p-4">
            <h1 className="text-3xl font-bold text-indigo-800 mb-2">Labirinto Mágico</h1>
            <p className="text-gray-600 mb-6">Encontre o caminho até a saída!</p>

            {gameCompleted && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg shadow-md">
                    <p className="font-bold">Parabéns! Você completou o labirinto em {moveCount} movimentos!</p>
                    <button
                        onClick={resetGame}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Jogar Novamente
                    </button>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-lg border border-indigo-100">
                <div className="grid grid-flow-row gap-0">
                    {maze.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex">
                            {row.map((cell, cellIndex) => {
                                const isPlayerHere = position.x === cellIndex && position.y === rowIndex;
                                const isStart = startPoint.x === cellIndex && startPoint.y === rowIndex;
                                const isFinish = finishPoint.x === cellIndex && finishPoint.y === rowIndex;

                                return (
                                    <div
                                        key={cellIndex}
                                        className={`w-10 h-10 relative flex items-center justify-center transition-all duration-200
                      ${cell.upEdge ? "border-t-transparent" : "border-t-2 border-t-indigo-800"} 
                      ${cell.downEdge ? "border-b-transparent" : "border-b-2 border-b-indigo-800"} 
                      ${cell.leftEdge ? "border-l-transparent" : "border-l-2 border-l-indigo-800"} 
                      ${cell.rightEdge ? "border-r-transparent" : "border-r-2 border-r-indigo-800"} 
                      ${isPlayerHere ? "bg-indigo-200" : getVisitedCellColor(rowIndex, cellIndex)}`}
                                    >
                                        {isStart && !isPlayerHere && (
                                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full"></div>
                                        )}

                                        {isFinish && (
                                            <div className={`absolute w-6 h-6 ${isPlayerHere ? "bg-green-600" : "bg-green-500"} rounded-full shadow-md flex items-center justify-center ${!isPlayerHere && "animate-pulse"}`}>
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}

                                        {isPlayerHere && !isFinish && (
                                            <div className="absolute w-6 h-6 bg-indigo-600 rounded-full shadow-md flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 text-gray-700 text-center">
                <p className="mb-2">Use as setas do teclado para navegar pelo labirinto</p>
                <div className="flex space-x-4 text-sm">
                    <p>Movimentos: <span className="font-bold">{moveCount}</span></p>
                    <p>Células visitadas: <span className="font-bold">{visitedCells.flat().filter(Boolean).length}</span></p>
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;