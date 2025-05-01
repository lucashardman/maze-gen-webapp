import { useState, useEffect, useCallback } from "react";

export function useMazeGame(initialMaze) {
    const [maze, setMaze] = useState(initialMaze);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [visitedCells, setVisitedCells] = useState(
        Array.from({ length: initialMaze.length }, () => Array(initialMaze[0].length).fill(false))
    );
    const [moveCount, setMoveCount] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);

    const resetGame = useCallback(() => {
        setPosition({ x: 0, y: 0 });
        setVisitedCells(Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false)));
        setMoveCount(0);
        setGameCompleted(false);
    }, [maze]);

    const movePlayer = useCallback((newX, newY, finishPoint) => {
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
    }, [maze]);

    useEffect(() => {
        setVisitedCells(prev => {
            const newVisited = prev.map(row => [...row]);
            newVisited[position.y][position.x] = true;
            return newVisited;
        });
    }, [position]);

    return {
        maze, setMaze,
        position, setPosition,
        visitedCells, setVisitedCells,
        moveCount, setMoveCount,
        gameCompleted, setGameCompleted,
        resetGame, movePlayer
    };
}