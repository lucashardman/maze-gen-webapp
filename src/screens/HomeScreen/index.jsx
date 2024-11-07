
export async function getServerSideProps() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    const res = await fetch(
        `${process.env.MAZE_API_URI}?height=100&width=100&mazeAlgorithm=HuntAndKill&seed=-1`,
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
    console.log(maze)
    return (
        <div className="flex flex-col items-center my-5">
            {maze.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {row.map((cell, cellIndex) => {
                        return(
                            <div
                                key={cellIndex}
                                className={`w-8 h-8 border-2 
                                ${cell.upEdge ? 'border-t-white' : 'border-t-black'} 
                                ${cell.downEdge ? 'border-b-white' : 'border-b-black'} 
                                ${cell.leftEdge ? 'border-l-white' : 'border-l-black'} 
                                ${cell.rightEdge ? 'border-r-white' : 'border-r-black'}`}
                            ></div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

export default HomeScreen;