import React from "react";

export default function MazeStats({
                                      moveCount, visitedCells, showVisitedCells, width, height, algorithm, theme, themeLabel
                                  }) {
    return (
        <div className="mt-6 text-gray-700 text-center">
            <p className="mb-2">Use as setas do teclado para navegar pelo labirinto</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
                <p>Movimentos: <span className="font-bold">{moveCount}</span></p>
                <p>Células visitadas: <span className="font-bold">{visitedCells.flat().filter(Boolean).length}</span></p>
                <p>Modo: <span className="font-bold">{showVisitedCells ? "Fácil" : "Difícil"}</span></p>
                <p>Tamanho: <span className="font-bold">{width}x{height}</span></p>
                <p>Algoritmo: <span className="font-bold">{algorithm}</span></p>
                <p>Tema: <span className="font-bold">{themeLabel}</span></p>
            </div>
        </div>
    );
}