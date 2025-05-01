import { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";

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
            apiUri: process.env.MAZE_API_URI,
        },
    };
}

const ALGORITHM_OPTIONS = [
    "HuntAndKill",
    "RecursiveDivision",
    "SimplifiedPrim",
    "Eller",
    "BinaryTree",
    "RandomizedKruskal",
    "Sidewinder",
    "AldousBroder",
    "DepthFirstSearch"
];

const THEMES = {
    classic: {
        label: "Clássico",
        wall: "#3730a3",
        cellBg: "#ffffff",
        player: "#6366f1",
        visited: "#c7d2fe",
        playerBorder: "#fff",
        start: "#3b82f6",
        finish: "#22c55e",
        finishPulse: "#4ade80",
        borderRadius: "12px",
        shadow: "0 4px 24px 0 rgba(55,48,163,0.10)"
    },
    neon: {
        label: "Neon",
        wall: "#39ff14",
        cellBg: "#0f172a",
        player: "#FF008E",
        visited: "#0C1E7F",
        playerBorder: "#fff",
        start: "#0ea5e9",
        finish: "#facc15",
        finishPulse: "#fde047",
        borderRadius: "8px",
        shadow: "0 0 16px 2px #39ff14"
    },
    pastel: {
        label: "Pastel",
        wall: "#a3a3a3",
        cellBg: "#fdf6fd",
        player: "#f472b6",
        visited: "#fbcfe8",
        playerBorder: "#fff",
        start: "#a5b4fc",
        finish: "#fcd34d",
        finishPulse: "#fde68a",
        borderRadius: "16px",
        shadow: "0 4px 24px 0 #fbcfe8"
    },
    dark: {
        label: "Dark",
        wall: "#f1f5f9",
        cellBg: "#18181b",
        player: "#fbbf24",
        visited: "#334155",
        playerBorder: "#18181b",
        start: "#38bdf8",
        finish: "#22d3ee",
        finishPulse: "#67e8f9",
        borderRadius: "8px",
        shadow: "0 4px 24px 0 #0ea5e9"
    },
    cyberpunk: {
        label: "Cyberpunk",
        wall: "#ff00c8",
        cellBg: "#1a1a2e",
        player: "#00fff7",
        visited: "#3a86ff",
        playerBorder: "#ffbe0b",
        start: "#ffbe0b",
        finish: "#fb5607",
        finishPulse: "#ff006e",
        borderRadius: "10px",
        shadow: "0 0 20px 2px #ff00c8"
    },
    forest: {
        label: "Floresta",
        wall: "#2e4600",
        cellBg: "#a2c523",
        player: "#386641",
        visited: "#b7efc5",
        playerBorder: "#fff",
        start: "#f7b801",
        finish: "#f18701",
        finishPulse: "#f35b04",
        borderRadius: "16px",
        shadow: "0 4px 24px 0 #386641"
    },
    candy: {
        label: "Doces",
        wall: "#ff61a6",
        cellBg: "#fff0f6",
        player: "#ffb700",
        visited: "#ffe066",
        playerBorder: "#ff61a6",
        start: "#ff61a6",
        finish: "#ffb700",
        finishPulse: "#ffe066",
        borderRadius: "18px",
        shadow: "0 4px 24px 0 #ff61a6"
    },
    ocean: {
        label: "Oceano",
        wall: "#023e8a",
        cellBg: "#caf0f8",
        player: "#0077b6",
        visited: "#90e0ef",
        playerBorder: "#fff",
        start: "#00b4d8",
        finish: "#03045e",
        finishPulse: "#48cae4",
        borderRadius: "14px",
        shadow: "0 4px 24px 0 #0077b6"
    },
    lava: {
        label: "Lava",
        wall: "#ff5400",
        cellBg: "#2d1e2f",
        player: "#ffbd39",
        visited: "#ff6f3c",
        playerBorder: "#fff",
        start: "#ffbd39",
        finish: "#ff5400",
        finishPulse: "#ff6f3c",
        borderRadius: "12px",
        shadow: "0 0 24px 0 #ff5400"
    }
};

function HomeScreen({ maze: initialMaze, apiUri }) {
    const [width, setWidth] = useState(20);
    const [height, setHeight] = useState(15);
    const [cellSize, setCellSize] = useState(40);
    const [showSettings, setShowSettings] = useState(false);
    const [algorithm, setAlgorithm] = useState("RandomizedKruskal");
    const [theme, setTheme] = useState("classic");

    const [maze, setMaze] = useState(initialMaze);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPoint] = useState({ x: 0, y: 0 });
    const [finishPoint, setFinishPoint] = useState({ x: initialMaze[0].length - 1, y: initialMaze.length - 1 });
    const [visitedCells, setVisitedCells] = useState(
        Array.from({ length: initialMaze.length }, () => Array(initialMaze[0].length).fill(false))
    );
    const [moveCount, setMoveCount] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [showVisitedCells, setShowVisitedCells] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const mazeRef = useRef(null);

    const movePlayer = useCallback((newX, newY) => {
        if (
            newX >= 0 &&
            newX < maze[0].length &&
            newY >= 0 &&
            newY < maze.length
        ) {
            setPosition({ x: newX, y: newY });
            setMoveCount(prev => prev + 1);

            if (newX === finishPoint.x && newY === finishPoint.y) {
                setGameCompleted(true);
            }
        }
    }, [maze, finishPoint]);

    const handleKeyDown = useCallback((event) => {
        if (gameCompleted || isLoading) return;

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
    }, [position, maze, movePlayer, gameCompleted, isLoading]);

    const resetGame = useCallback(() => {
        setPosition({ x: 0, y: 0 });
        setVisitedCells(Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false)));
        setMoveCount(0);
        setGameCompleted(false);
    }, [maze]);

    const toggleVisitedCells = useCallback(() => {
        setShowVisitedCells(prev => !prev);
    }, []);

    const toggleSettings = useCallback(() => {
        setShowSettings(prev => !prev);
    }, []);

    const generateNewMaze = useCallback(async () => {
        try {
            setIsLoading(true);

            const randomSeed = Math.floor(Math.random() * 1000000);

            const response = await fetch(
                `${apiUri}?height=${height}&width=${width}&mazeAlgorithm=${algorithm}&seed=${randomSeed}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Falha ao carregar novo labirinto");
            }

            const newMaze = await response.json();

            setMaze(newMaze);
            setFinishPoint({ x: newMaze[0].length - 1, y: newMaze.length - 1 });

            setPosition({ x: 0, y: 0 });
            setVisitedCells(Array.from({ length: newMaze.length }, () => Array(newMaze[0].length).fill(false)));
            setMoveCount(0);
            setGameCompleted(false);

            setShowSettings(false);
        } catch (error) {
            console.error("Erro ao gerar novo labirinto:", error);
            alert("Não foi possível gerar um novo labirinto. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [apiUri, height, width, algorithm]);

    const handleWidthChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 5 && value <= 50) {
            setWidth(value);
        }
    };

    const handleHeightChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 5 && value <= 50) {
            setHeight(value);
        }
    };

    const handleCellSizeChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 6 && value <= 100) {
            setCellSize(value);
        }
    };

    const handleAlgorithmChange = (e) => {
        setAlgorithm(e.target.value);
    };

    const handleThemeChange = (e) => {
        setTheme(e.target.value);
    };

    const downloadMazeAsImage = async () => {
        if (!mazeRef.current) return;
        const canvas = await html2canvas(mazeRef.current, {
            backgroundColor: null,
            useCORS: true
        });
        const link = document.createElement("a");
        link.download = "labirinto.jpeg";
        link.href = canvas.toDataURL("image/jpeg", 1.0);
        link.click();
    };

    useEffect(() => {
        setVisitedCells(prev => {
            const newVisited = prev.map(row => [...row]);
            newVisited[position.y][position.x] = true;
            return newVisited;
        });

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [position, handleKeyDown]);

    const themeColors = THEMES[theme];

    const getCellColor = (rowIndex, cellIndex) => {
        if (position.x === cellIndex && position.y === rowIndex) {
            return themeColors.player;
        }
        if (showVisitedCells && visitedCells[rowIndex][cellIndex]) {
            return themeColors.visited;
        }
        return themeColors.cellBg;
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-indigo-800 mb-2">Labirinto Mágico</h1>
            <p className="text-gray-600 mb-4">Encontre o caminho até a saída!</p>

            {/* Controles do jogo */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
                <button
                    onClick={resetGame}
                    disabled={isLoading}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-md transition-colors shadow-sm
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                    Reiniciar Jogo
                </button>

                <button
                    onClick={generateNewMaze}
                    disabled={isLoading}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center gap-2
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Carregando...
                        </>
                    ) : (
                        'Novo Labirinto'
                    )}
                </button>

                <button
                    onClick={toggleVisitedCells}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-2
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                >
                    {showVisitedCells ? "Ocultar Rastro" : "Mostrar Rastro"}
                </button>

                <button
                    onClick={toggleSettings}
                    className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors shadow-sm"
                >
                    Configurações
                </button>

                <button
                    onClick={downloadMazeAsImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                >
                    Baixar como Imagem
                </button>
            </div>

            {showSettings && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Configurações</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Largura do labirinto:
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={width}
                                onChange={handleWidthChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={width}
                                onChange={handleWidthChange}
                                className="w-16 p-1 text-center border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Altura do labirinto:
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={height}
                                onChange={handleHeightChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={height}
                                onChange={handleHeightChange}
                                className="w-16 p-1 text-center border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tamanho da célula (px):
                            </label>
                            <input
                                type="range"
                                min="6"
                                max="100"
                                value={cellSize}
                                onChange={handleCellSizeChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                min="6"
                                max="100"
                                value={cellSize}
                                onChange={handleCellSizeChange}
                                className="w-16 p-1 text-center border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Algoritmo de geração:
                            </label>
                            <select
                                value={algorithm}
                                onChange={handleAlgorithmChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                {ALGORITHM_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tema visual:
                            </label>
                            <select
                                value={theme}
                                onChange={handleThemeChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                {Object.entries(THEMES).map(([key, t]) => (
                                    <option key={key} value={key}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={generateNewMaze}
                            disabled={isLoading}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-sm"
                        >
                            Aplicar e Gerar
                        </button>
                    </div>
                </div>
            )}

            {gameCompleted && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg shadow-md">
                    <p className="font-bold">Parabéns! Você completou o labirinto em {moveCount} movimentos!</p>
                </div>
            )}

            <div
                ref={mazeRef}
                style={{
                    background: themeColors.cellBg,
                    borderRadius: themeColors.borderRadius,
                    boxShadow: themeColors.shadow,
                    padding: 16,
                    border: `2px solid ${themeColors.wall}`,
                    position: "relative"
                }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-xl">
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-indigo-800 font-medium">Gerando novo labirinto...</p>
                        </div>
                    </div>
                )}

                <div style={{ display: "grid", gridAutoRows: "min-content" }}>
                    {maze.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: "flex" }}>
                            {row.map((cell, cellIndex) => {
                                const isPlayerHere = position.x === cellIndex && position.y === rowIndex;
                                const isStart = startPoint.x === cellIndex && startPoint.y === rowIndex;
                                const isFinish = finishPoint.x === cellIndex && finishPoint.y === rowIndex;

                                const borderStyles = {
                                    borderTop: cell.upEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                                    borderBottom: cell.downEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                                    borderLeft: cell.leftEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                                    borderRight: cell.rightEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                                    background: getCellColor(rowIndex, cellIndex),
                                    borderTopLeftRadius:
                                        rowIndex === 0 && cellIndex === 0 ? themeColors.borderRadius : 0,
                                    borderTopRightRadius:
                                        rowIndex === 0 && cellIndex === row.length - 1 ? themeColors.borderRadius : 0,
                                    borderBottomLeftRadius:
                                        rowIndex === maze.length - 1 && cellIndex === 0 ? themeColors.borderRadius : 0,
                                    borderBottomRightRadius:
                                        rowIndex === maze.length - 1 && cellIndex === row.length - 1 ? themeColors.borderRadius : 0,
                                    width: `${cellSize}px`,
                                    height: `${cellSize}px`,
                                    transition: "background 0.2s"
                                };

                                return (
                                    <div
                                        key={cellIndex}
                                        style={borderStyles}
                                        className="relative flex items-center justify-center"
                                    >
                                        {isStart && !isPlayerHere && (
                                            <div
                                                className="absolute"
                                                style={{
                                                    background: themeColors.start,
                                                    borderRadius: "50%",
                                                    width: `${cellSize * 0.3}px`,
                                                    height: `${cellSize * 0.3}px`
                                                }}
                                            ></div>
                                        )}

                                        {isFinish && (
                                            <div
                                                className={`absolute shadow-md flex items-center justify-center ${!isPlayerHere ? "animate-pulse" : ""}`}
                                                style={{
                                                    background: isPlayerHere ? themeColors.finish : themeColors.finishPulse,
                                                    borderRadius: "50%",
                                                    width: `${cellSize * 0.6}px`,
                                                    height: `${cellSize * 0.6}px`
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: themeColors.cellBg,
                                                        borderRadius: "50%",
                                                        width: `${cellSize * 0.2}px`,
                                                        height: `${cellSize * 0.2}px`
                                                    }}
                                                ></div>
                                            </div>
                                        )}

                                        {isPlayerHere && !isFinish && (
                                            <div
                                                className="absolute shadow-md flex items-center justify-center"
                                                style={{
                                                    background: themeColors.player,
                                                    border: `2px solid ${themeColors.playerBorder}`,
                                                    borderRadius: "50%",
                                                    width: `${cellSize * 0.6}px`,
                                                    height: `${cellSize * 0.6}px`
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: themeColors.cellBg,
                                                        borderRadius: "50%",
                                                        width: `${cellSize * 0.2}px`,
                                                        height: `${cellSize * 0.2}px`
                                                    }}
                                                ></div>
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
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <p>Movimentos: <span className="font-bold">{moveCount}</span></p>
                    <p>Células visitadas: <span className="font-bold">{visitedCells.flat().filter(Boolean).length}</span></p>
                    <p>Modo: <span className="font-bold">{showVisitedCells ? "Fácil" : "Difícil"}</span></p>
                    <p>Tamanho: <span className="font-bold">{width}x{height}</span></p>
                    <p>Algoritmo: <span className="font-bold">{algorithm}</span></p>
                    <p>Tema: <span className="font-bold">{THEMES[theme].label}</span></p>
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;