import React from "react";

export default function MazeControls({
                                         onReset, onNewMaze, onToggleVisited, onToggleSettings, onDownload,
                                         isLoading, showVisitedCells
                                     }) {
    return (
        <div className="flex flex-wrap justify-center gap-3 mb-4">
            <button
                onClick={onReset}
                disabled={isLoading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md transition-colors shadow-sm
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            >
                Reiniciar Jogo
            </button>
            <button
                onClick={onNewMaze}
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
                onClick={onToggleVisited}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-2
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            >
                {showVisitedCells ? "Ocultar Rastro" : "Mostrar Rastro"}
            </button>
            <button
                onClick={onToggleSettings}
                className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors shadow-sm"
            >
                Configurações
            </button>
            <button
                onClick={onDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
            >
                Baixar como Imagem
            </button>
        </div>
    );
}