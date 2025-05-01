export async function fetchMaze(apiUri, width, height, algorithm, seed) {
    const res = await fetch(
        `${apiUri}?height=${height}&width=${width}&mazeAlgorithm=${algorithm}&seed=${seed}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
    if (!res.ok) throw new Error("Erro ao buscar labirinto");
    return res.json();
}