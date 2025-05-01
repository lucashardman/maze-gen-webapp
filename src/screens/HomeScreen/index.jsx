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

function HomeScreen({ maze: initialMaze, apiUri }) {
    // Parâmetros de personalização
    const [width, setWidth] = useState(20); // Largura (X)
    const [height, setHeight] = useState(15); // Comprimento (Y)
    const [cellSize, setCellSize] = useState(40); // Tamanho da célula em pixels
    const [showSettings, setShowSettings] = useState(false);

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

    // Ref para o labirinto (para download)
    const mazeRef = useRef(null);

    // Função para atualizar a posição do jogador
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

    // Função para lidar com as teclas pressionadas
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

    // Resetar o jogo
    const resetGame = useCallback(() => {
        setPosition({ x: 0, y: 0 });
        setVisitedCells(Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false)));
        setMoveCount(0);
        setGameCompleted(false);
    }, [maze]);

    // Toggle para mostrar/ocultar células visitadas
    const toggleVisitedCells = useCallback(() => {
        setShowVisitedCells(prev => !prev);
    }, []);

    // Toggle para mostrar/ocultar configurações
    const toggleSettings = useCallback(() => {
        setShowSettings(prev => !prev);
    }, []);

    // Função para gerar um novo labirinto com os parâmetros atuais
    const generateNewMaze = useCallback(async () => {
        try {
            setIsLoading(true);

            const randomSeed = Math.floor(Math.random() * 1000000);

            const response = await fetch(
                `${apiUri}?height=${height}&width=${width}&mazeAlgorithm=RandomizedKruskal&seed=${randomSeed}`,
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
    }, [apiUri, height, width]);

    // Validar e atualizar a largura
    const handleWidthChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 5 && value <= 50) {
            setWidth(value);
        }
    };

    // Validar e atualizar a altura
    const handleHeightChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 5 && value <= 50) {
            setHeight(value);
        }
    };

    // Validar e atualizar o tamanho da célula
    const handleCellSizeChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 6 && value <= 100) {
            setCellSize(value);
        }
    };

    // Download do labirinto como imagem JPEG
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
            const newVisited = [...prev];
            newVisited[position.y][position.x] = true;
            return newVisited;
        });

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [position, handleKeyDown]);

    const getVisitedCellColor = (rowIndex, cellIndex) => {
        if (!showVisitedCells || !visitedCells[rowIndex][cellIndex]) return "bg-white";
        const distance = Math.abs(rowIndex - position.y) + Math.abs(cellIndex - position.x);
        if (distance <= 1) return "bg-indigo-100";
        if (distance <= 3) return "bg-indigo-50";
        return "bg-blue-50";
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
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${showVisitedCells
                        ? "bg-indigo-200 text-indigo-800 hover:bg-indigo-300"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                    <span className={`w-4 h-4 rounded-full ${showVisitedCells ? "bg-indigo-600" : "bg-gray-400"}`}></span>
                    {showVisitedCells ? "Ocultar Rastro" : "Mostrar Rastro"}
                </button>

                <button
                    onClick={toggleSettings}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-2
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${showSettings
                        ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Configurações
                </button>

                <button
                    onClick={downloadMazeAsImage}
                    disabled={isLoading}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md transition-colors shadow-sm hover:bg-pink-700"
                >
                    Baixar Labirinto (JPEG)
                </button>
            </div>

            {/* Painel de configurações */}
            {showSettings && (
                <div className="w-full max-w-md mb-6 p-4 bg-white rounded-lg shadow-md border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Personalizar Labirinto</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Largura (células no eixo X): {width}
                            </label>
                            <div className="flex items-center gap-2">
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comprimento (células no eixo Y): {height}
                            </label>
                            <div className="flex items-center gap-2">
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tamanho das células (pixels): {cellSize}
                            </label>
                            <div className="flex items-center gap-2">
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
                className={`bg-white p-4 rounded-xl shadow-lg border border-indigo-100 relative ${isLoading ? 'opacity-50' : ''}`}
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
                                        style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                                        className={`relative flex items-center justify-center transition-all duration-200
                      ${cell.upEdge ? "border-t-transparent" : "border-t-2 border-t-indigo-800"} 
                      ${cell.downEdge ? "border-b-transparent" : "border-b-2 border-b-indigo-800"} 
                      ${cell.leftEdge ? "border-l-transparent" : "border-l-2 border-l-indigo-800"} 
                      ${cell.rightEdge ? "border-r-transparent" : "border-r-2 border-r-indigo-800"} 
                      ${isPlayerHere ? "bg-indigo-200" : getVisitedCellColor(rowIndex, cellIndex)}`}
                                    >
                                        {isStart && !isPlayerHere && (
                                            <div className={`absolute rounded-full bg-blue-500`} style={{ width: `${cellSize * 0.3}px`, height: `${cellSize * 0.3}px` }}></div>
                                        )}

                                        {isFinish && (
                                            <div
                                                className={`absolute rounded-full shadow-md flex items-center justify-center ${isPlayerHere ? "bg-green-600" : "bg-green-500"} ${!isPlayerHere && "animate-pulse"}`}
                                                style={{ width: `${cellSize * 0.6}px`, height: `${cellSize * 0.6}px` }}
                                            >
                                                <div
                                                    className="bg-white rounded-full"
                                                    style={{ width: `${cellSize * 0.2}px`, height: `${cellSize * 0.2}px` }}
                                                ></div>
                                            </div>
                                        )}

                                        {isPlayerHere && !isFinish && (
                                            <div
                                                className="absolute bg-indigo-600 rounded-full shadow-md flex items-center justify-center"
                                                style={{ width: `${cellSize * 0.6}px`, height: `${cellSize * 0.6}px` }}
                                            >
                                                <div
                                                    className="bg-white rounded-full"
                                                    style={{ width: `${cellSize * 0.2}px`, height: `${cellSize * 0.2}px` }}
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
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;