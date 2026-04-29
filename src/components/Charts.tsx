import React from 'react';
import Plot from 'react-plotly.js';
import { ChartData } from '../types';

export const DataCharts: React.FC<{ charts: ChartData[], preview?: boolean }> = ({ charts, preview }) => {
    return (
        <div style={{ pointerEvents: preview ? 'none' : 'auto', width: '100%' }}>
            {charts.map((chart, idx) => {
                const isCorrelation = chart.type === 'correlation';
                const isDist = chart.type === 'category_count' || chart.type === 'numeric_hist';

                // Настройки Layout для превью
                const previewLayout: any = {
                    margin: { t: 5, b: 5, l: 5, r: 5 },
                    xaxis: { visible: false, showgrid: false, zeroline: false },
                    yaxis: { visible: false, showgrid: false, zeroline: false },
                    showlegend: false,
                    autosize: true, // Позволяем графику занимать всё место в контейнере
                };

                // Стили контейнера для соблюдения пропорций
                const containerStyle: React.CSSProperties = preview ? {
                    width: '100%',
                    // Квадрат 1:1 для матрицы, 4:3 (высота = 3/4 ширины) для распределений
                    aspectRatio: isCorrelation ? '1 / 1' : '2 / 1', 
                    overflow: 'hidden'
                } : {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                };

                if (isCorrelation) {
                    const cols = Object.keys(chart.data);
                    const z_vals = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));

                    return (
                        <div key={idx} style={containerStyle}>
                            <Plot
                                data={[{
                                    z: z_vals,
                                    x: !preview ? cols : [],
                                    y: !preview ? cols : [],
                                    type: 'heatmap',
                                    colorscale: 'Viridis',
                                    showscale: !preview,
                                    text: !preview ? z_vals.map(r => r.map(v => String(v))) : undefined,
                                    texttemplate: !preview ? "%{text}" : undefined,
                                    hoverinfo: preview ? 'skip' : 'all'
                                } as any]}
                                layout={preview ? previewLayout : {
                                    title: 'Корреляционная матрица',
                                    width: Math.min(window.innerWidth * 0.8, 800),
                                    height: Math.min(window.innerHeight * 0.8, 700),
                                    margin: { t: 50, r: 50 },
                                    xaxis: { automargin: true, tickangle: -45 },
                                    yaxis: { automargin: true }
                                }}
                                config={{ displayModeBar: !preview, responsive: true }}
                                useResizeHandler={true} // Важно для работы aspect-ratio
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    );
                }

                if (isDist) {
                    const col = chart.data.column_name || 'Unknown';
                    const isNumeric = chart.type === 'numeric_hist';
                    const xData = isNumeric ? chart.data.x : Object.keys(chart.data.counts);
                    const yData = isNumeric ? chart.data.y : Object.values(chart.data.counts);

                    return (
                        <div key={idx} style={containerStyle}>
                            <Plot
                                data={[{ 
                                    x: xData, 
                                    y: yData, 
                                    type: 'bar', 
                                    marker: { color: isNumeric ? '#e27c4a' : '#4a90e2' } 
                                } as any]}
                                layout={preview ? previewLayout : {
                                    title: `Распределение: ${col}`,
                                    width: Math.min(window.innerWidth * 0.8, 700),
                                    height: Math.min(window.innerHeight * 0.8, 500),
                                    // Добавляем подписи к осям
                                    xaxis: { 
                                        automargin: true, 
                                        // Подпись по оси X только для числовых
                                        title: isNumeric ? { text: 'Значения' } : undefined 
                                    },
                                    yaxis: { 
                                        automargin: true, 
                                        // Подпись по оси Y (частота/количество) для всех
                                        title: { text: 'Количество' } 
                                    }
                                }}
                                config={{ displayModeBar: !preview, responsive: true }}
                                useResizeHandler={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};