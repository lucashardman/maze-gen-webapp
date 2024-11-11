import {useState, useEffect} from "react";

export async function getServerSideProps() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    const res = await fetch(
        `${process.env.MAZE_API_URI}?height=25&width=25&mazeAlgorithm=DepthFirstSearch&seed=-1`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }
    );
    const maze = await res.json();

    return {
        props: {
            maze,
        }
    }
}

function HomeScreen({ maze }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [visitedCells, setVisitedCells] = useState(
        Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false))
    );

    // Função para atualizar a posição do jogador
    const movePlayer = (newX, newY) => {
        if (
            newX >= 0 &&
            newX < maze[0].length &&
            newY >= 0 &&
            newY < maze.length
        ) {
            // Atualiza a posição do jogador
            setPosition({ x: newX, y: newY });
        }
    };

    // Função para lidar com as teclas pressionadas
    const handleKeyDown = (event) => {
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
    };


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown, position]);

    return (
        <div className="flex flex-col items-center my-5">
            {maze.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {row.map((cell, cellIndex) => {
                        const isPlayerHere = position.x === cellIndex && position.y === rowIndex;

                        // Definir a cor da célula: azul se o jogador estiver nela, caso contrário, cinza
                        const cellColor = isPlayerHere ? "bg-blue-500" : "bg-white-800";

                        return (
                            <div
                                key={cellIndex}
                                className={`w-8 h-8 border-2 
                                    ${cell.upEdge ? "border-t-white" : "border-t-black"} 
                                    ${cell.downEdge ? "border-b-white" : "border-b-black"} 
                                    ${cell.leftEdge ? "border-l-white" : "border-l-black"} 
                                    ${cell.rightEdge ? "border-r-white" : "border-r-black"} 
                                    ${cellColor}`}
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    )
}

export default HomeScreen;