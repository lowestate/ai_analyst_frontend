import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ChartData } from '../types';

// --- 1. ТИПИЗАЦИЯ ПАНЕЛИ УПРАВЛЕНИЯ ---
type ControlType = 'slider' | 'checkbox' | 'select';

interface BaseControl {
    id: string;
    label: string;
    type: ControlType;
}

interface SliderControl extends BaseControl {
    type: 'slider';
    min: number;
    max: number;
    step: number;
    defaultValue: number;
}

interface CheckboxControl extends BaseControl {
    type: 'checkbox';
    defaultValue: boolean;
}

interface SelectControl extends BaseControl {
    type: 'select';
    options: string[];
    defaultValue: string;
}

// Объединяем все возможные элементы управления
type ChartControl = SliderControl | CheckboxControl | SelectControl;


// --- 2. ИНТЕРАКТИВНЫЙ КОМПОНЕНТ ДЛЯ ОДНОГО ГРАФИКА ---
const InteractiveChart: React.FC<{ chart: ChartData, preview?: boolean }> = ({ chart, preview }) => {
    
    // Определяем, какие контролы нужны для конкретного графика.
    // Сюда легко добавлять новые инструменты для любых других графиков!
    let controls: ChartControl[] = [];
    if (chart.type === 'cross_deps') {
        controls = [
            { type: 'slider', id: 'threshold', label: 'Порог связи', min: 0, max: 1, step: 0.05, defaultValue: 0.4 }
        ];
    }

    // Инициализируем локальный State значениями по умолчанию
    const [controlValues, setControlValues] = useState<Record<string, any>>(() => {
        const init: Record<string, any> = {};
        controls.forEach(c => init[c.id] = c.defaultValue);
        return init;
    });

    // Обработчик изменения любого контрола
    const handleControlChange = (id: string, val: any) => {
        setControlValues(prev => ({ ...prev, [id]: val }));
    };

    // --- БАЗОВЫЕ НАСТРОЙКИ ---
    const isCorrelation = chart.type === 'correlation';
    const previewLayout: any = {
        margin: { t: 5, b: 5, l: 5, r: 5 },
        xaxis: { visible: false, showgrid: false, zeroline: false },
        yaxis: { visible: false, showgrid: false, zeroline: false },
        showlegend: false,
        autosize: true,
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        position: 'relative', // Важно для абсолютного позиционирования панели
        overflow: preview ? 'hidden' : 'visible',
        display: preview ? 'block' : 'flex',
        justifyContent: 'center',
        aspectRatio: preview ? (isCorrelation || chart.type === 'cross_deps' ? '1 / 1' : '2 / 1') : 'auto'
    };

    let plotData: any[] = [];
    let plotLayout: any = {};

    // --- ОТРИСОВКА КОРРЕЛЯЦИИ ---
    if (chart.type === 'correlation') {
        const cols = Object.keys(chart.data);
        const z_vals = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));
        plotData = [{
            z: z_vals, x: !preview ? cols : [], y: !preview ? cols : [],
            type: 'heatmap', colorscale: 'Viridis', showscale: !preview,
            text: !preview ? z_vals.map(r => r.map(v => String(v))) : undefined,
            texttemplate: !preview ? "%{text}" : undefined,
            hoverinfo: preview ? 'skip' : 'all'
        }];
        plotLayout = preview ? previewLayout : {
            title: { text: 'Корреляционная матрица', x: 0, xanchor: 'left' },
            width: Math.min(window.innerWidth * 0.8, 800),
            height: Math.min(window.innerHeight * 0.8, 700),
            margin: { t: 80, r: 50, b: 80, l: 80 },
            xaxis: { automargin: true, tickangle: -45 }, yaxis: { automargin: true }
        };
    }

    // --- ОТРИСОВКА РАСПРЕДЕЛЕНИЙ ---
    if (chart.type === 'category_count' || chart.type === 'numeric_hist') {
        const col = chart.data.column_name || 'Unknown';
        const isNumeric = chart.type === 'numeric_hist';
        const xData = isNumeric ? chart.data.x : Object.keys(chart.data.counts);
        const yData = isNumeric ? chart.data.y : Object.values(chart.data.counts);
        
        plotData = [{ 
            x: xData, y: yData, type: 'bar', 
            marker: { color: isNumeric ? '#e27c4a' : '#4a90e2' } 
        }];
        plotLayout = preview ? previewLayout : {
            title: { text: `Распределение: ${col}`, x: 0, xanchor: 'left' },
            width: Math.min(window.innerWidth * 0.8, 700),
            height: Math.min(window.innerHeight * 0.8, 500),
            xaxis: { automargin: true, title: isNumeric ? { text: 'Значения' } : undefined },
            yaxis: { automargin: true, title: { text: 'Количество' } },
            margin: { t: 80, b: 80, l: 80, r: 50 }
        };
    }

    // --- ОТРИСОВКА АНОМАЛИЙ ---
    if (chart.type === 'outliers') {
        const col = chart.data.column_name || 'Unknown';
        plotData = [{ 
            y: chart.data.y, type: 'box', name: col,
            marker: { color: '#e74c3c' }, boxpoints: 'outliers',
            hoverinfo: preview ? 'skip' : 'all'
        }];
        plotLayout = preview ? previewLayout : {
            title: { text: `Разброс значений: ${col}`, x: 0, xanchor: 'left' },
            width: Math.min(window.innerWidth * 0.8, 700),
            height: Math.min(window.innerHeight * 0.8, 500),
            yaxis: { automargin: true },
            margin: { t: 80, b: 80, l: 80, r: 50 }
        };
    }

    // --- ОТРИСОВКА КРОСС-ЗАВИСИМОСТЕЙ ---
    // --- ОТРИСОВКА КРОСС-ЗАВИСИМОСТЕЙ ---
    if (chart.type === 'cross_deps') {
        const features = Object.keys(chart.data.matrix);
        const numNodes = features.length;
        const nodeX = features.map((_, i) => Math.cos((2 * Math.PI * i) / numNodes));
        const nodeY = features.map((_, i) => Math.sin((2 * Math.PI * i) / numNodes));
        const edgeX: (number | null)[] = [];
        const edgeY: (number | null)[] = [];
        
        const currentThreshold = controlValues['threshold'] || 0.4;

        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                const score = Math.abs(chart.data.matrix[features[i]][features[j]]);
                if (score > currentThreshold) {
                    edgeX.push(nodeX[i], nodeX[j], null);
                    edgeY.push(nodeY[i], nodeY[j], null);
                }
            }
        }

        plotData = [
            {
                x: edgeX, y: edgeY,
                type: 'scatter',
                mode: 'lines',
                line: { 
                    // ТОЧЕЧНЫЙ ФИКС: В превью делаем линии ярче (opacity: 1) и чуть толще
                    color: preview ? '#888' : '#a0aec0', 
                    width: preview ? 0.5 : 1.5 
                },
                hoverinfo: 'none',
                opacity: preview ? 1 : 0.6 
            },
            {
                x: nodeX, y: nodeY,
                type: 'scatter',
                mode: preview ? 'markers' : 'markers+text',
                text: features,
                textposition: 'top center',
                marker: { 
                    size: preview ? 10 : 24, 
                    color: '#4a90e2', 
                    line: { color: '#ffffff', width: preview ? 1 : 2 } 
                },
                hoverinfo: preview ? 'skip' : 'text',
                hovertext: features.map(f => `Признак: ${f}`)
            }
        ];

        // ПОЛНОЕ РАЗДЕЛЕНИЕ LAYOUT: Теперь они не зависят друг от друга
        if (preview) {
            plotLayout = {
                margin: { t: 10, b: 10, l: 10, r: 10 },
                xaxis: { 
                    visible: false, 
                    range: [-1.2, 1.2], // Фиксируем область, чтобы линии не улетали
                    fixedrange: true 
                },
                yaxis: { 
                    visible: false, 
                    range: [-1.2, 1.2], 
                    fixedrange: true, 
                    scaleanchor: 'x', scaleratio: 1 
                },
                showlegend: false,
                autosize: true,
            };
        } else {
            plotLayout = {
                title: { 
                    text: `Граф сильных связей (Score > ${currentThreshold.toFixed(2)})`, 
                    x: 0, xanchor: 'left' 
                },
                width: Math.min(window.innerWidth * 0.8, 700),
                height: Math.min(window.innerHeight * 0.8, 700),
                xaxis: { visible: false, showgrid: false, zeroline: false },
                yaxis: { visible: false, showgrid: false, zeroline: false, scaleanchor: 'x', scaleratio: 1 },
                margin: { t: 100, r: 80, b: 50, l: 80 },
                showlegend: false,
                hovermode: 'closest'
            };
        }
    }

    // --- РЕНДЕР ПАНЕЛИ УПРАВЛЕНИЯ ---
    const renderControlPanel = () => {
        // Не рендерим панель в превью или если нет контролов
        if (preview || controls.length === 0) return null;

        return (
            <div style={{
                position: 'absolute',
                top: 25, 
                right: 30, // Смещаем вправо от заголовка
                background: 'rgba(255,255,255,0.9)',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 10,
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                border: '1px solid #eee'
            }}>
                {controls.map(ctrl => {
                    if (ctrl.type === 'slider') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', minWidth: '120px' }}>
                                    {ctrl.label}: {controlValues[ctrl.id].toFixed(2)}
                                </label>
                                <input 
                                    type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} 
                                    value={controlValues[ctrl.id]}
                                    onChange={e => handleControlChange(ctrl.id, parseFloat(e.target.value))}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        );
                    }
                    if (ctrl.type === 'checkbox') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="checkbox" checked={controlValues[ctrl.id]}
                                    onChange={e => handleControlChange(ctrl.id, e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                            </div>
                        );
                    }
                    if (ctrl.type === 'select') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <select 
                                    value={controlValues[ctrl.id]}
                                    onChange={e => handleControlChange(ctrl.id, e.target.value)}
                                    style={{ fontSize: '12px', padding: '2px 5px', borderRadius: '4px' }}
                                >
                                    {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    if (plotData.length === 0) return null; // Защита от неизвестных типов

    return (
        <div style={containerStyle}>
            {renderControlPanel()}
            <Plot
                data={plotData}
                layout={plotLayout}
                config={{ displayModeBar: !preview, responsive: true }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

// --- 3. ГЛАВНЫЙ ЭКСПОРТ ---
export const DataCharts: React.FC<{ charts: ChartData[], preview?: boolean }> = ({ charts, preview }) => {
    return (
        <div style={{ pointerEvents: preview ? 'none' : 'auto', width: '100%' }}>
            {charts.map((chart, idx) => (
                <InteractiveChart key={idx} chart={chart} preview={preview} />
            ))}
        </div>
    );
};