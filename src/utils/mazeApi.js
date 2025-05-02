export async function fetchMaze(apiUri, width, height, algorithm, seed) {
    const res = await fetch(
        `${apiUri}/maze?height=${height}&width=${width}&mazeAlgorithm=${algorithm}&seed=${seed}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
    if (!res.ok) throw new Error("Erro ao buscar labirinto");
    return await res.json();
}

export async function fetchSolution(apiUri, width, height, mazeAlgorithm, pathfindingAlgorithm, seed) {
    const res = await fetch(
        `${apiUri}/solve?seed=${seed}&height=${height}&width=${width}&mazeAlgorithm=${mazeAlgorithm}&pathfindingAlgorithm=${pathfindingAlgorithm}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
    if (!res.ok) throw new Error("Erro ao buscar solução do labirinto");
    const solution = await res.json();
    return solution.path;
}