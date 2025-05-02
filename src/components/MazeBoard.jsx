import React from "react";

export default function MazeBoard({
                                      maze, position, solutionCells, cellSize, themeColors, getCellColor, startPoint, finishPoint
                                  }) {

    // Função para verificar se uma célula está no caminho da solução
    const isSolutionCell = (rowIndex, cellIndex) => {
        if (!solutionCells || solutionCells.length === 0) return false;
        return solutionCells.some(cell => cell.x === cellIndex && cell.y === rowIndex);
    };

    return (
        <div style={{ display: "grid", gridAutoRows: "min-content" }}>
            {maze.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex" }}>
                    {row.map((cell, cellIndex) => {
                        const isPlayerHere = position.x === cellIndex && position.y === rowIndex;
                        const isStart = startPoint.x === cellIndex && startPoint.y === rowIndex;
                        const isFinish = finishPoint.x === cellIndex && finishPoint.y === rowIndex;
                        const isSolution = isSolutionCell(rowIndex, cellIndex);

                        // Determinar a cor de fundo da célula
                        let backgroundColor = getCellColor(rowIndex, cellIndex);

                        // Se a célula faz parte da solução e não é onde o jogador está,
                        // nem o início ou fim, pintamos de preto
                        if (isSolution && !isPlayerHere && !isStart && !isFinish) {
                            backgroundColor = themeColors.solution; // Ou podemos usar themeColors.solution se for adicionado
                        }

                        const borderStyles = {
                            borderTop: cell.upEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                            borderBottom: cell.downEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                            borderLeft: cell.leftEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                            borderRight: cell.rightEdge ? "2px solid transparent" : `2px solid ${themeColors.wall}`,
                            background: backgroundColor,
                            borderTopLeftRadius: rowIndex === 0 && cellIndex === 0 ? themeColors.borderRadius : 0,
                            borderTopRightRadius: rowIndex === 0 && cellIndex === row.length - 1 ? themeColors.borderRadius : 0,
                            borderBottomLeftRadius: rowIndex === maze.length - 1 && cellIndex === 0 ? themeColors.borderRadius : 0,
                            borderBottomRightRadius: rowIndex === maze.length - 1 && cellIndex === row.length - 1 ? themeColors.borderRadius : 0,
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
    );
}