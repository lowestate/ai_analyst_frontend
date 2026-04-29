import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ChartData } from '../types';

// --- 1. ТИПИЗАЦИЯ ПАНЕЛИ УПРАВЛЕНИЯ ---
type ControlType = 'slider' | 'checkbox' | 'select' | 'date' | 'multiselect';

interface BaseControl { id: string; label: string; type: ControlType; }
interface SliderControl extends BaseControl { type: 'slider'; min: number; max: number; step: number; defaultValue: number; }
interface CheckboxControl extends BaseControl { type: 'checkbox'; defaultValue: boolean; }
interface SelectControl extends BaseControl { type: 'select'; options: string[]; defaultValue: string; }
interface DateControl extends BaseControl { type: 'date'; defaultValue: string; min?: string; max?: string; }
interface MultiSelectControl extends BaseControl { type: 'multiselect'; options: string[]; defaultValue: string[]; }

type ChartControl = SliderControl | CheckboxControl | SelectControl | DateControl | MultiSelectControl;

// --- 2. ИНТЕРАКТИВНЫЙ КОМПОНЕНТ ДЛЯ ОДНОГО ГРАФИКА ---
const InteractiveChart: React.FC<{ chart: ChartData, preview?: boolean }> = ({ chart, preview }) => {
    
    let controls: ChartControl[] = [];
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    
    if (chart.type === 'cross_deps') {
        controls = [{ type: 'slider', id: 'threshold', label: 'Порог связи', min: 0, max: 1, step: 0.05, defaultValue: 0.4 }];
    }
    
    if (chart.type === 'trend_line') {
        const numCols = chart.data.numeric_cols || [];
        const xDates = chart.data.x || [];
        
        if (xDates.length > 0) {
            const minDate = xDates[0].split(' ')[0];
            const maxDate = xDates[xDates.length - 1].split(' ')[0];
            controls.push({ type: 'date', id: 'date_start', label: 'От', defaultValue: minDate, min: minDate, max: maxDate });
            controls.push({ type: 'date', id: 'date_end', label: 'До', defaultValue: maxDate, min: minDate, max: maxDate });
        }

        // ТЕПЕРЬ ДРОПДАУН ЕСТЬ ВСЕГДА (даже если признаков мало)
        controls.push({
            type: 'multiselect', id: 'visible_columns', label: 'Показатели',
            options: numCols, defaultValue: numCols.slice(0, 5) 
        });
    }

    const [controlValues, setControlValues] = useState<Record<string, any>>(() => {
        const init: Record<string, any> = {};
        controls.forEach(c => init[c.id] = c.defaultValue);
        return init;
    });

    const handleControlChange = (id: string, val: any) => {
        setControlValues(prev => ({ ...prev, [id]: val }));
    };

    let chartTitle = '';
    if (chart.type === 'correlation') chartTitle = 'Корреляционная матрица';
    else if (chart.type === 'category_count' || chart.type === 'numeric_hist') chartTitle = `Распределение: ${chart.data.column_name || 'Unknown'}`;
    else if (chart.type === 'outliers') chartTitle = `Разброс значений: ${chart.data.column_name || 'Unknown'}`;
    else if (chart.type === 'cross_deps') chartTitle = `Граф сильных связей (Score > ${(controlValues['threshold'] || 0.4).toFixed(2)})`;
    else if (chart.type === 'trend_line') chartTitle = `Анализ трендов (Ось X: ${chart.data.date_col})`;

    const isCorrelation = chart.type === 'correlation';
    const previewLayout: any = {
        margin: { t: 5, b: 5, l: 5, r: 5 },
        xaxis: { visible: false, showgrid: false, zeroline: false }, yaxis: { visible: false, showgrid: false, zeroline: false },
        showlegend: false, autosize: true,
    };

    const containerStyle: React.CSSProperties = {
        width: '100%', position: 'relative', overflow: preview ? 'hidden' : 'visible',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        aspectRatio: preview ? (isCorrelation || chart.type === 'cross_deps' ? '1 / 1' : '2 / 1') : 'auto'
    };

    let plotData: any[] = [];
    let plotLayout: any = {};

    // ... (ТУТ КОД ДЛЯ КОРРЕЛЯЦИИ, РАСПРЕДЕЛЕНИЙ И АНОМАЛИЙ ОСТАЕТСЯ ПРЕЖНИМ) ...
    if (chart.type === 'correlation') {
        const cols = Object.keys(chart.data);
        const z_vals = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));
        plotData = [{ z: z_vals, x: !preview ? cols : [], y: !preview ? cols : [], type: 'heatmap', colorscale: 'Viridis', showscale: !preview, text: !preview ? z_vals.map(r => r.map(v => String(v))) : undefined, texttemplate: !preview ? "%{text}" : undefined, hoverinfo: preview ? 'skip' : 'all' }];
        plotLayout = preview ? previewLayout : { width: Math.min(window.innerWidth * 0.8, 800), height: Math.min(window.innerHeight * 0.8, 700), margin: { t: 30, r: 50, b: 80, l: 80 }, xaxis: { automargin: true, tickangle: -45 }, yaxis: { automargin: true } };
    }

    if (chart.type === 'category_count' || chart.type === 'numeric_hist') {
        const isNumeric = chart.type === 'numeric_hist';
        const xData = isNumeric ? chart.data.x : Object.keys(chart.data.counts);
        const yData = isNumeric ? chart.data.y : Object.values(chart.data.counts);
        plotData = [{ x: xData, y: yData, type: 'bar', marker: { color: isNumeric ? '#e27c4a' : '#4a90e2' } }];
        plotLayout = preview ? previewLayout : { width: Math.min(window.innerWidth * 0.8, 700), height: Math.min(window.innerHeight * 0.8, 500), xaxis: { automargin: true, title: isNumeric ? { text: 'Значения' } : undefined }, yaxis: { automargin: true, title: { text: 'Количество' } }, margin: { t: 30, b: 80, l: 80, r: 50 } };
    }

    if (chart.type === 'outliers') {
        const col = chart.data.column_name || 'Unknown';
        plotData = [{ y: chart.data.y, type: 'box', name: col, marker: { color: '#e74c3c' }, boxpoints: 'outliers', hoverinfo: preview ? 'skip' : 'all' }];
        plotLayout = preview ? previewLayout : { width: Math.min(window.innerWidth * 0.8, 700), height: Math.min(window.innerHeight * 0.8, 500), yaxis: { automargin: true }, margin: { t: 30, b: 80, l: 80, r: 50 } };
    }

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
                if (Math.abs(chart.data.matrix[features[i]][features[j]]) > currentThreshold) {
                    edgeX.push(nodeX[i], nodeX[j], null);
                    edgeY.push(nodeY[i], nodeY[j], null);
                }
            }
        }

        plotData = [
            { x: edgeX, y: edgeY, type: 'scatter', mode: 'lines', line: { color: preview ? '#888' : '#a0aec0', width: preview ? 0.5 : 1.5 }, hoverinfo: 'none', opacity: preview ? 1 : 0.6 },
            { x: nodeX, y: nodeY, type: 'scatter', mode: preview ? 'markers' : 'markers+text', text: features, textposition: 'top center', marker: { size: preview ? 10 : 24, color: '#4a90e2', line: { color: '#ffffff', width: preview ? 1 : 2 } }, hoverinfo: preview ? 'skip' : 'text', hovertext: features.map(f => `Признак: ${f}`) }
        ];

        if (preview) {
            plotLayout = { margin: { t: 10, b: 10, l: 10, r: 10 }, xaxis: { visible: false, range: [-1.2, 1.2], fixedrange: true }, yaxis: { visible: false, range: [-1.2, 1.2], fixedrange: true, scaleanchor: 'x', scaleratio: 1 }, showlegend: false, autosize: true };
        } else {
            plotLayout = { width: Math.min(window.innerWidth * 0.8, 700), height: Math.min(window.innerHeight * 0.8, 700), xaxis: { visible: false, showgrid: false, zeroline: false }, yaxis: { visible: false, showgrid: false, zeroline: false, scaleanchor: 'x', scaleratio: 1 }, margin: { t: 30, r: 80, b: 50, l: 80 }, showlegend: false, hovermode: 'closest' };
        }
    }

    // --- ОТРИСОВКА ТРЕНДОВ ---
    if (chart.type === 'trend_line') {
        const numericCols = chart.data.numeric_cols;
        const startDate = controlValues['date_start'];
        const endDate = controlValues['date_end'];
        
        let startIdx = 0;
        let endIdx = chart.data.x.length - 1;

        if (startDate && endDate) {
            startIdx = chart.data.x.findIndex((d: string) => d.split(' ')[0] >= startDate);
            if (startIdx === -1) startIdx = 0; 
            for (let i = chart.data.x.length - 1; i >= 0; i--) {
                if (chart.data.x[i].split(' ')[0] <= endDate) {
                    endIdx = i; break;
                }
            }
        }

        const sliceEnd = endIdx + 1;
        const xData = chart.data.x.slice(startIdx, sliceEnd);

        // ЖЕЛЕЗОБЕТОННЫЙ ФИЛЬТР: рисуем только то, что отмечено галочками в selectedList
        const activeCols = numericCols.filter((col: string, idx: number) => {
            if (preview) return idx < 5;   
            const selectedList = controlValues['visible_columns'] as string[];
            return selectedList ? selectedList.includes(col) : false; // Если нет в списке — не рисуем
        });

        plotData = activeCols.map((col: string) => ({
            x: xData, y: chart.data.y[col].slice(startIdx, sliceEnd), 
            type: 'scatter', mode: 'lines', name: col, line: { width: 2 },
            hoverinfo: preview ? 'skip' : 'all'
        }));

        // datarevision заставляет Plotly принудительно обновить линии, когда меняются чекбоксы
        plotLayout = preview ? previewLayout : {
            datarevision: activeCols.length, 
            width: Math.min(window.innerWidth * 0.8, 800), height: Math.min(window.innerHeight * 0.8, 500),
            xaxis: { automargin: true, type: 'date' },
            yaxis: { automargin: true, title: { text: 'Значения метрик' } },
            margin: { t: 20, b: 80, l: 80, r: 50 }, showlegend: true, legend: { orientation: 'h', y: -0.2 } 
        };
    }

    const renderControlPanel = () => {
        if (preview || controls.length === 0) return null;

        return (
            <div style={{
                background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e1e4e8', 
                display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', 
                marginBottom: '10px', width: '100%', boxSizing: 'border-box'
            }}>
                {controls.map(ctrl => {
                    if (ctrl.type === 'slider') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', minWidth: '120px' }}>{ctrl.label}: {controlValues[ctrl.id].toFixed(2)}</label>
                                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={controlValues[ctrl.id]} onChange={e => handleControlChange(ctrl.id, parseFloat(e.target.value))} style={{ cursor: 'pointer' }} />
                            </div>
                        );
                    }
                    if (ctrl.type === 'date') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <input type="date" min={ctrl.min} max={ctrl.max} value={controlValues[ctrl.id]} onChange={e => handleControlChange(ctrl.id, e.target.value)} style={{ fontSize: '12px', padding: '2px 5px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }} />
                            </div>
                        );
                    }
                    if (ctrl.type === 'multiselect') {
                        const isOpen = openDropdown === ctrl.id;
                        const selectedList = controlValues[ctrl.id] as string[];
                        
                        return (
                            <div key={ctrl.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseLeave={() => setOpenDropdown(null)}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <div 
                                    onClick={() => setOpenDropdown(isOpen ? null : ctrl.id)}
                                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff', minWidth: '130px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span>Выбрано: {selectedList ? selectedList.length : 0}</span>
                                    <span style={{ fontSize: '9px', marginLeft: '6px' }}>{isOpen ? '▲' : '▼'}</span>
                                </div>
                                
                                {isOpen && (
                                    // НЕВИДИМЫЙ МОСТИК: paddingTop: '6px' создает зону, внутри которой мышка считается "дома"
                                    <div style={{ position: 'absolute', top: '100%', right: '0', paddingTop: '6px', zIndex: 999 }}>
                                        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '250px', overflowY: 'auto', minWidth: '200px', padding: '5px 0' }}>
                                            {ctrl.options.map(opt => {
                                                const isChecked = selectedList ? selectedList.includes(opt) : false;
                                                return (
                                                    <div key={opt} 
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             const next = isChecked ? selectedList.filter((v: string) => v !== opt) : [...(selectedList || []), opt];
                                                             handleControlChange(ctrl.id, next);
                                                         }}
                                                         style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isChecked ? '#f0f7ff' : 'transparent', transition: 'background 0.2s' }}
                                                         onMouseEnter={e => e.currentTarget.style.background = isChecked ? '#e0f0ff' : '#f8f9fa'}
                                                         onMouseLeave={e => e.currentTarget.style.background = isChecked ? '#f0f7ff' : 'transparent'}
                                                    >
                                                        <input type="checkbox" checked={isChecked} readOnly style={{ cursor: 'pointer' }} />
                                                        <span style={{ fontSize: '12px', color: '#333' }}>{opt}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    if (plotData.length === 0) return null;

    return (
        <div style={containerStyle}>
            {!preview && (
                <div style={{ width: '100%', padding: '20px 20px 0 20px', boxSizing: 'border-box', textAlign: 'left' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px', fontWeight: 600 }}>{chartTitle}</h3>
                    {renderControlPanel()}
                </div>
            )}
            <Plot data={plotData} layout={plotLayout} config={{ displayModeBar: !preview, responsive: true }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export const DataCharts: React.FC<{ charts: ChartData[], preview?: boolean }> = ({ charts, preview }) => {
    return (
        <div style={{ pointerEvents: preview ? 'none' : 'auto', width: '100%' }}>
            {charts.map((chart, idx) => (
                <InteractiveChart key={idx} chart={chart} preview={preview} />
            ))}
        </div>
    );
};