import { fetchSolution } from "@/utils/mazeApi";
import React from 'react';

export default function MazeSolution({
                                         apiUri,
                                         width,
                                         height,
                                         mazeAlgorithm,
                                         pathfindingAlgorithm,
                                         seed,
                                         onSolutionFound
                                     }) {
    const handleSolutionClick = async () => {
        try {
            const solution = await fetchSolution(
                apiUri,
                width,
                height,
                mazeAlgorithm,
                pathfindingAlgorithm,
                seed
            );
            onSolutionFound(solution);
        } catch (error) {
            console.error("Erro ao buscar solução:", error);
        }
    };

    return (
        <button
            className="font-bold py-2 px-4 rounded my-4 bg-purple-500 hover:bg-purple-700 text-white transition-colors shadow-sm"
            onClick={handleSolutionClick}
        >
            Mostrar Solução
        </button>
    );
};
