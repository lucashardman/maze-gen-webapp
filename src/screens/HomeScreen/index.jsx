import {useState, useRef, useEffect} from "react";
import html2canvas from "html2canvas";
import THEMES from "../../themes";
import { fetchMaze } from "../../utils/mazeApi";
import { useMazeGame } from "../../utils/useMazeGame";
import MazeBoard from "../../components/MazeBoard";
import MazeControls from "../../components/MazeControls";
import MazeSettings from "../../components/MazeSettings";
import MazeStats from "../../components/MazeStats";

export async function getServerSideProps() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const maze = await fetchMaze(process.env.MAZE_API_URI, 20, 15, "RandomizedKruskal", -1)
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

export default function HomeScreen({ maze: initialMaze, apiUri }) {
    const [width, setWidth] = useState(20);
    const [height, setHeight] = useState(15);
    const [cellSize, setCellSize] = useState(40);
    const [showSettings, setShowSettings] = useState(false);
    const [algorithm, setAlgorithm] = useState("RandomizedKruskal");
    const [theme, setTheme] = useState("classic");
    const [showVisitedCells, setShowVisitedCells] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const {
        maze, setMaze,
        position, setPosition,
        visitedCells, setVisitedCells,
        moveCount, setMoveCount,
        gameCompleted, setGameCompleted,
        resetGame, movePlayer
    } = useMazeGame(initialMaze);

    const [finishPoint, setFinishPoint] = useState({ x: initialMaze[0].length - 1, y: initialMaze.length - 1 });
    const startPoint = { x: 0, y: 0 };

    const mazeRef = useRef(null);

    // Função para cor da célula
    const getCellColor = (rowIndex, cellIndex) => {
        if (position.x === cellIndex && position.y === rowIndex) {
            return THEMES[theme].player;
        }
        if (showVisitedCells && visitedCells[rowIndex][cellIndex]) {
            return THEMES[theme].visited;
        }
        return THEMES[theme].cellBg;
    };

    // Movimentação com teclado
    const handleKeyDown = (event) => {
        if (gameCompleted || isLoading) return;
        const { x, y } = position;
        switch (event.key) {
            case "ArrowUp":
                if (y > 0 && maze[y][x].upEdge) movePlayer(x, y - 1, finishPoint);
                break;
            case "ArrowDown":
                if (y < maze.length - 1 && maze[y][x].downEdge) movePlayer(x, y + 1, finishPoint);
                break;
            case "ArrowLeft":
                if (x > 0 && maze[y][x].leftEdge) movePlayer(x - 1, y, finishPoint);
                break;
            case "ArrowRight":
                if (x < maze[0].length - 1 && maze[y][x].rightEdge) movePlayer(x + 1, y, finishPoint);
                break;
            default:
                break;
        }
    };

    // Efeito para adicionar listener de teclado
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    // Geração de novo labirinto
    const generateNewMaze = async () => {
        try {
            setIsLoading(true);
            const randomSeed = Math.floor(Math.random() * 1000000);
            const newMaze = await fetchMaze(apiUri, width, height, algorithm, randomSeed);
            setMaze(newMaze);
            setFinishPoint({ x: newMaze[0].length - 1, y: newMaze.length - 1 });
            setPosition({ x: 0, y: 0 });
            setVisitedCells(Array.from({ length: newMaze.length }, () => Array(newMaze[0].length).fill(false)));
            setMoveCount(0);
            setGameCompleted(false);
            setShowSettings(false);
        } catch (error) {
            alert("Não foi possível gerar um novo labirinto. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    // Download como imagem
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

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-indigo-800 mb-2">Labirinto Mágico</h1>
            <p className="text-gray-600 mb-4">Encontre o caminho até a saída!</p>

            <MazeControls
                onReset={resetGame}
                onNewMaze={generateNewMaze}
                onToggleVisited={() => setShowVisitedCells(v => !v)}
                onToggleSettings={() => setShowSettings(v => !v)}
                onDownload={downloadMazeAsImage}
                isLoading={isLoading}
                showVisitedCells={showVisitedCells}
            />

            {showSettings && (
                <MazeSettings
                    width={width}
                    height={height}
                    cellSize={cellSize}
                    algorithm={algorithm}
                    theme={theme}
                    onWidthChange={e => setWidth(Number(e.target.value))}
                    onHeightChange={e => setHeight(Number(e.target.value))}
                    onCellSizeChange={e => setCellSize(Number(e.target.value))}
                    onAlgorithmChange={e => setAlgorithm(e.target.value)}
                    onThemeChange={e => setTheme(e.target.value)}
                    algorithmOptions={ALGORITHM_OPTIONS}
                    themes={THEMES}
                    onApply={generateNewMaze}
                    isLoading={isLoading}
                />
            )}

            {gameCompleted && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg shadow-md">
                    <p className="font-bold">Parabéns! Você completou o labirinto em {moveCount} movimentos!</p>
                </div>
            )}

            <div
                ref={mazeRef}
                style={{
                    background: THEMES[theme].cellBg,
                    borderRadius: THEMES[theme].borderRadius,
                    boxShadow: THEMES[theme].shadow,
                    padding: 16,
                    border: `2px solid ${THEMES[theme].wall}`,
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
                <MazeBoard
                    maze={maze}
                    position={position}
                    visitedCells={visitedCells}
                    cellSize={cellSize}
                    themeColors={THEMES[theme]}
                    getCellColor={getCellColor}
                    startPoint={startPoint}
                    finishPoint={finishPoint}
                />
            </div>

            <MazeStats
                moveCount={moveCount}
                visitedCells={visitedCells}
                showVisitedCells={showVisitedCells}
                width={width}
                height={height}
                algorithm={algorithm}
                theme={theme}
                themeLabel={THEMES[theme].label}
            />
        </div>
    );
}