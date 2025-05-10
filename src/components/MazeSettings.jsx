import React from "react";

export default function MazeSettings({
                                         width, height, cellSize, algorithm, theme, seed, onSeedChange,
                                         onWidthChange, onHeightChange, onCellSizeChange, onAlgorithmChange, onThemeChange,
                                         algorithmOptions, themes, onApply, isLoading
                                     }) {
    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Configurações</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seed (-1 para gerar aleatoriamente):
                    </label>

                    <input
                        type="number"
                        value={seed}
                        onChange={onSeedChange}
                        className="w-28 p-1 text-center border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largura:
                    </label>
                    <input
                        type="number"
                        min="5"
                        max="50"
                        value={width}
                        onChange={onWidthChange}
                        className="w-16 p-1 text-center border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Altura:
                    </label>
                    <input
                        type="number"
                        min="5"
                        max="50"
                        value={height}
                        onChange={onHeightChange}
                        className="w-16 p-1 text-center border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tamanho da célula (px):
                    </label>
                    <input
                        type="range"
                        min="6"
                        max="100"
                        value={cellSize}
                        onChange={onCellSizeChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                        type="number"
                        min="6"
                        max="100"
                        value={cellSize}
                        onChange={onCellSizeChange}
                        className="w-16 p-1 text-center border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Algoritmo de geração:
                    </label>
                    <select
                        value={algorithm}
                        onChange={onAlgorithmChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {algorithmOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tema visual:
                    </label>
                    <select
                        value={theme}
                        onChange={onThemeChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {Object.entries(themes).map(([key, t]) => (
                            <option key={key} value={key}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    onClick={onApply}
                    disabled={isLoading}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-sm"
                >
                    Aplicar e Gerar
                </button>
            </div>
        </div>
    );
}