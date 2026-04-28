import React from 'react';
import Plot from 'react-plotly.js';
import { ChartData } from '../types';

export const DataCharts: React.FC<{ charts: ChartData[], preview?: boolean }> = ({ charts, preview }) => {
    return (
        <div style={{ pointerEvents: preview ? 'none' : 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {charts.map((chart, idx) => {
                if (chart.type === 'correlation') {
                    const cols = Object.keys(chart.data);
                    const z_vals = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));

                    const layout: any = preview ? {
                        margin: { t: 0, b: 0, l: 0, r: 0 },
                        xaxis: { visible: false, showgrid: false, zeroline: false },
                        yaxis: { visible: false, showgrid: false, zeroline: false },
                        showlegend: false,
                        autosize: true,
                        height: 200
                    } : {
                        title: 'Корреляционная матрица',
                        width: Math.min(window.innerWidth * 0.8, 800),
                        height: Math.min(window.innerHeight * 0.8, 700),
                        margin: { t: 50, r: 50 }, // b и l убрали, так как они теперь считаются автоматически
                        xaxis: { automargin: true, tickangle: -45 }, // Наклон текста снизу, чтобы длинные слова не слипались
                        yaxis: { automargin: true }
                    };

                    return (
                        <Plot
                            key={idx}
                            data={[{
                                z: z_vals,
                                x: preview ? [] : cols,
                                y: preview ? [] : cols,
                                type: 'heatmap',
                                colorscale: 'cmap',
                                showscale: !preview,
                                text: !preview ? z_vals.map(r => r.map(v => String(v))) : undefined,
                                texttemplate: !preview ? "%{text}" : undefined,
                                hoverinfo: preview ? 'skip' : 'all'
                            } as any]}
                            layout={layout}
                            config={{ displayModeBar: !preview, responsive: true }}
                            style={preview ? { width: '100%' } : {}}
                        />
                    );
                }

                if (chart.type === 'column_stats') {
                    const catCols = Object.keys(chart.data.categorical);
                    if(catCols.length === 0) return null;
                    const col = catCols[0]; // Для превью показываем только первый барчарт
                    const counts = chart.data.categorical[col];

                    const layout: any = preview ? {
                        margin: { t: 0, b: 0, l: 0, r: 0 },
                        xaxis: { visible: false, showgrid: false },
                        yaxis: { visible: false, showgrid: false },
                        showlegend: false,
                        autosize: true,
                        height: 150
                    } : {
                        title: `Распределение: ${col}`,
                        width: Math.min(window.innerWidth * 0.8, 700),
                        height: Math.min(window.innerHeight * 0.8, 500)
                    };

                    return (
                        <Plot
                            key={col}
                            data={[{
                                x: Object.keys(counts),
                                y: Object.values(counts),
                                type: 'bar',
                                marker: { color: '#4a90e2' }
                            } as any]}
                            layout={layout}
                            config={{ displayModeBar: !preview, responsive: true }}
                            style={preview ? { width: '100%' } : {}}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};