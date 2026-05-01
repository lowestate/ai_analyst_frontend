import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { ChartData } from '../types';
import { CHART_REGISTRY } from '../chartRegistry';

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
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // --- АРХИТЕКТУРА 1: Инициализация контроллеров (выполняется 1 раз) ---
    const controls = useMemo<ChartControl[]>(() => {
        const ctrls: ChartControl[] = [];
        switch (chart.type) {
            case 'correlation':
                ctrls.push({ type: 'select', id: 'sign', label: 'Связь', options: ['Все', 'Только прямая (+)', 'Только обратная (-)'], defaultValue: 'Все' });
                ctrls.push({ type: 'slider', id: 'thresh_pos', label: 'Прямая корреляция >', min: 0, max: 1, step: 0.05, defaultValue: 0 });
                ctrls.push({ type: 'slider', id: 'thresh_neg', label: 'Обратная корреляция <', min: -1, max: 0, step: 0.05, defaultValue: 0 });
                ctrls.push({ type: 'checkbox', id: 'hide_diag', label: 'Скрыть диагональ', defaultValue: false });
                ctrls.push({ type: 'slider', id: 'precision', label: 'Точность', min: 0, max: 5, step: 1, defaultValue: 2 });
                break;
            case 'cross_deps':
                ctrls.push({ type: 'slider', id: 'threshold', label: 'Порог связи', min: 0, max: 1, step: 0.005, defaultValue: 0.4 });
                break;
            case 'trend_line':
                const xDates = chart.data.x || [];
                if (xDates.length > 0) {
                    const minDate = xDates[0].split(' ')[0];
                    const maxDate = xDates[xDates.length - 1].split(' ')[0];
                    ctrls.push({ type: 'date', id: 'date_start', label: 'От', defaultValue: minDate, min: minDate, max: maxDate });
                    ctrls.push({ type: 'date', id: 'date_end', label: 'До', defaultValue: maxDate, min: minDate, max: maxDate });
                }
                ctrls.push({ type: 'multiselect', id: 'visible_columns', label: 'Показатели', options: chart.data.numeric_cols || [], defaultValue: (chart.data.numeric_cols || []).slice(0, 5) });
                break;
            case 'pairplot':
                if (chart.data.all_columns?.length > 2) {
                    ctrls.push({ type: 'multiselect', id: 'splom_columns', label: 'Признаки', options: chart.data.all_columns, defaultValue: chart.data.default_columns });
                }
                break;
        }
        return ctrls;
    }, [chart]);

    // --- АРХИТЕКТУРА 2: Состояние значений ---
    const [controlValues, setControlValues] = useState<Record<string, any>>(() => {
        const init: Record<string, any> = {};
        controls.forEach(c => init[c.id] = c.defaultValue);
        return init;
    });

    const handleControlChange = (id: string, val: any) => setControlValues(prev => ({ ...prev, [id]: val }));

    const chartDef = CHART_REGISTRY[chart.type as keyof typeof CHART_REGISTRY];
    let chartTitle = chartDef ? chartDef.plotTitle(chart.data, controlValues) : 'График';

    const previewLayout: any = {
        margin: { t: 5, b: 5, l: 5, r: 5 },
        xaxis: { visible: false, showgrid: false, zeroline: false }, yaxis: { visible: false, showgrid: false, zeroline: false },
        showlegend: false, autosize: true,
    };

    const containerStyle: React.CSSProperties = {
        width: preview ? '100%' : '90vw', height: preview ? 'auto' : '85vh', maxWidth: '100%',
        position: 'relative', overflow: preview ? 'hidden' : 'visible',
        display: 'flex', flexDirection: 'column', alignItems: 'center', aspectRatio: preview ? '3 / 2' : 'auto'
    };

    let plotData: any[] = [];
    let plotLayout: any = {};

    // --- АРХИТЕКТУРА 3: Роутинг графиков (чистый Switch вместо спама If) ---
    switch (chart.type) {
        case 'correlation': {
            const { sign, thresh_pos, thresh_neg, hide_diag, precision } = controlValues;
            const cols = Object.keys(chart.data);
            const z_vals = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));

            // 1. Фильтрация данных
            const z_filtered = z_vals.map((row, i) => row.map((val, j) => {
                if (hide_diag && i === j) return null;
                if (sign === 'Только прямая (+)' && val < 0) return null;
                if (sign === 'Только обратная (-)' && val > 0) return null;
                if (val > 0 && val < thresh_pos) return null;
                if (val < 0 && val > thresh_neg) return null;
                if (val === 0 && (thresh_pos > 0 || thresh_neg < 0)) return null; // Убираем нули если есть порог
                return val;
            }));

            // 2. Форматирование текста с учетом precision
            const text_filtered = z_filtered.map(row => row.map(val => val === null ? '' : val.toFixed(precision)));

            const fontSize = cols.length > 30 ? 8 : cols.length > 15 ? 10 : 12;

            plotData = [{
                z: z_filtered, x: !preview ? cols : [], y: !preview ? cols : [],
                type: 'heatmap', colorscale: 'RdBu', zmin: -1, zmax: 1, zmid: 0, 
                showscale: !preview, 
                // ИЗМЕНЕНИЕ 2: Убрали xgap и ygap, чтобы не было серой сетки
                text: !preview ? text_filtered : undefined,
                texttemplate: !preview ? "%{text}" : undefined,
                hoverinfo: preview ? 'skip' : 'x+y+text'
            }];
            
            plotLayout = preview ? previewLayout : { 
                plot_bgcolor: '#ffffff', // ИЗМЕНЕНИЕ 2: Идеально белый фон для пустых (отфильтрованных) ячеек
                paper_bgcolor: '#ffffff',
                margin: { t: 30, r: 50, b: 120, l: 150 }, 
                xaxis: { 
                    automargin: true, 
                    tickangle: -45,
                    tickmode: 'linear', // ИЗМЕНЕНИЕ 1: Принудительно показываем ВСЕ подписи
                    dtick: 1,
                    tickfont: { size: fontSize }
                }, 
                yaxis: { 
                    automargin: true, 
                    autorange: 'reversed',
                    tickmode: 'linear', // ИЗМЕНЕНИЕ 1: Принудительно показываем ВСЕ подписи
                    dtick: 1,
                    tickfont: { size: fontSize }
                } 
            };
            break;
        }

        case 'category_count':
        case 'numeric_hist': {
            const isNumeric = chart.type === 'numeric_hist';
            const xData = isNumeric ? chart.data.x : Object.keys(chart.data.counts);
            const yData = isNumeric ? chart.data.y : Object.values(chart.data.counts);
            plotData = [{ x: xData, y: yData, type: 'bar', marker: { color: isNumeric ? '#e27c4a' : '#4a90e2' } }];
            plotLayout = preview ? previewLayout : { xaxis: { automargin: true }, yaxis: { automargin: true }, margin: { t: 30, b: 80, l: 80, r: 50 } };
            break;
        }

        case 'trend_line': {
            const numericCols = chart.data.numeric_cols;
            const startDate = controlValues['date_start'];
            const endDate = controlValues['date_end'];
            let startIdx = 0; let endIdx = chart.data.x.length - 1;

            if (startDate && endDate) {
                startIdx = chart.data.x.findIndex((d: string) => d.split(' ')[0] >= startDate);
                if (startIdx === -1) startIdx = 0; 
                for (let i = chart.data.x.length - 1; i >= 0; i--) {
                    if (chart.data.x[i].split(' ')[0] <= endDate) { endIdx = i; break; }
                }
            }

            const sliceEnd = endIdx + 1;
            const xData = chart.data.x.slice(startIdx, sliceEnd);
            const activeCols = numericCols.filter((col: string, idx: number) => {
                if (preview) return idx < 5;   
                const selectedList = controlValues['visible_columns'] as string[];
                return selectedList ? selectedList.includes(col) : false;
            });

            plotData = activeCols.map((col: string) => ({
                x: xData, y: chart.data.y[col].slice(startIdx, sliceEnd), 
                type: 'scatter', mode: 'lines', name: col, line: { width: 2 }, hoverinfo: preview ? 'skip' : 'all'
            }));
            plotLayout = preview ? previewLayout : {
                // Теперь график обновится, если изменится хоть одна колонка или любая из дат
                datarevision: `${activeCols.join(',')}_${startDate}_${endDate}`, 
                xaxis: { automargin: true, type: 'date' }, yaxis: { automargin: true, title: { text: 'Значения метрик' } },
                margin: { t: 20, b: 80, l: 80, r: 50 }, showlegend: true, legend: { orientation: 'h', y: -0.2 } 
            };
            break;
        }

        case 'pairplot': {
            const allDims = chart.data.dimensions || [];
            const selectedList = controlValues['splom_columns'] as string[] || chart.data.default_columns || [];
            
            // 1. Вытаскиваем оригинальные имена колонок 
            const activeOriginalLabels = allDims
                .filter((dim: any) => preview ? chart.data.default_columns.includes(dim.label) : selectedList.includes(dim.label))
                .map((dim: any) => dim.label);

            // 2. В самих dimensions обнуляем label, чтобы Plotly не рисовал кашу слева по вертикали
            const activeDims = allDims.filter((dim: any) => {
                if (preview) return chart.data.default_columns.includes(dim.label);
                return selectedList.includes(dim.label);
            }).map((dim: any) => ({
                ...dim,
                label: '' // <--- Прячем системные вертикальные подписи
            }));
            
            plotData = [{
                type: 'splom', dimensions: activeDims,
                marker: { color: '#4a90e2', size: preview ? 2 : 4, opacity: 0.6, line: { color: 'white', width: 0.5 } },
                hoverinfo: preview ? 'skip' : 'all'
            }];

            // 3. Создаем кастомные ГОРИЗОНТАЛЬНЫЕ подписи слева (через аннотации)
            const numDims = activeOriginalLabels.length;
            const annotations: any[] = [];
            
            if (!preview) {
                activeOriginalLabels.forEach((label: string, i: number) => {
                    const shortLabel = label.length > 20 ? label.substring(0, 17) + '...' : label;
                    
                    // Подписи для оси Y (слева, строго горизонтально)
                    annotations.push({
                        xref: 'paper', yref: 'paper',
                        // ФИКС: Вычитаем из 1, чтобы 0-й элемент был наверху, а не внизу
                        x: -0.04, y: 1 - ((i + 0.5) / numDims), 
                        xanchor: 'right', yanchor: 'middle',
                        text: shortLabel, showarrow: false, font: { size: 12, color: '#333' }
                    });

                    // Подписи для оси X (снизу, под углом 15 градусов) — остаются без изменений
                    annotations.push({
                        xref: 'paper', yref: 'paper',
                        x: (i + 0.5) / numDims, y: -0.05, 
                        xanchor: 'right', yanchor: 'top',
                        textangle: -15, 
                        text: shortLabel, showarrow: false, font: { size: 12, color: '#333' }
                    });
                });
            }
            
            // 4. Формируем лэйаут
            let splomLayout: any = {
                datarevision: activeDims.length,
                // margin.b: 120 (увеличили нижний отступ, чтобы наклонный текст влез и не обрезался)
                margin: { t: 30, b: 90, l: 170, r: 20 }, 
                hovermode: 'closest', dragmode: 'select',
                autosize: true,
                annotations: annotations 
            };

            for (let i = 1; i <= Math.max(5, activeDims.length); i++) {
                const suffix = i === 1 ? '' : String(i);
                if (preview) {
                    splomLayout[`xaxis${suffix}`] = { showticklabels: false, visible: false };
                    splomLayout[`yaxis${suffix}`] = { showticklabels: false, visible: false };
                } else {
                    // Теперь мы скрываем системные title И для Y, И для X, потому что используем аннотации
                    splomLayout[`xaxis${suffix}`] = { title: { text: '' }, automargin: true };
                    splomLayout[`yaxis${suffix}`] = { title: { text: '' }, automargin: true };
                }
            }
            plotLayout = preview ? { ...previewLayout, ...splomLayout, margin: { t: 5, b: 5, l: 5, r: 5 } } : splomLayout;

            if (!preview) chartTitle = `Матрица рассеяния (Выбрано признаков: ${activeDims.length})`;
            break;
        }

        case 'feature_importances': {
            plotData = [{ 
                type: 'bar', 
                orientation: 'h', // Делает бары горизонтальными
                x: chart.data.importances, 
                y: chart.data.features, 
                marker: { 
                    color: '#328fec', // Твой фирменный цвет
                    opacity: 0.8
                },
                hoverinfo: preview ? 'skip' : 'x+y'
            }];
            
            plotLayout = preview 
                ? previewLayout 
                : { 
                    margin: { t: 30, r: 50, b: 50, l: 150 }, // Левый отступ побольше для названий колонок
                    xaxis: { title: { text: 'Вес важности' }, automargin: true },
                    yaxis: { automargin: true }
                  };
            break;
        }

        case 'dependency': {
            const { sub_type, col1, col2 } = chart.data;
            if (sub_type === 'scatter') {
                plotData = [{ x: chart.data.x, y: chart.data.y, type: 'scatter', mode: 'markers', marker: { color: '#4a90e2', opacity: 0.6, size: 8, line: { color: '#ffffff', width: 0.5 } }, hoverinfo: preview ? 'skip' : 'all' }];
                plotLayout = preview ? previewLayout : { xaxis: { automargin: true, title: { text: col2 }, zeroline: false }, yaxis: { automargin: true, title: { text: col1 }, zeroline: false }, margin: { t: 30, b: 80, l: 80, r: 50 }, hovermode: 'closest' };
            } else if (sub_type === 'heatmap') {
                plotData = [{ z: chart.data.z, x: chart.data.x, y: chart.data.y, type: 'heatmap', colorscale: 'Blues', showscale: !preview, hoverinfo: preview ? 'skip' : 'all' }];
                plotLayout = preview ? previewLayout : { margin: { t: 30, r: 50, b: 80, l: 120 }, xaxis: { automargin: true, title: { text: col2 }, tickangle: -45 }, yaxis: { automargin: true, title: { text: col1 } } };
            } else if (sub_type === 'box') {
                plotData = chart.data.categories.map((cat: string, idx: number) => ({ y: chart.data.values[idx], type: 'box', name: cat, boxpoints: 'outliers', hoverinfo: preview ? 'skip' : 'all' }));
                plotLayout = preview ? previewLayout : { xaxis: { automargin: true, title: { text: chart.data.cat_col } }, yaxis: { automargin: true, title: { text: chart.data.num_col }, zeroline: false }, margin: { t: 30, b: 80, l: 80, r: 50 }, showlegend: false };
            }
            if (!preview) chartTitle = `Зависимость: ${col1} от ${col2}`;
            break;
        }

        case 'outliers': {
            const col = chart.data.column_name || 'Unknown';
            plotData = [{ y: chart.data.y, type: 'box', name: col, marker: { color: '#e74c3c' }, boxpoints: 'outliers', hoverinfo: preview ? 'skip' : 'all' }];
            plotLayout = preview ? previewLayout : { yaxis: { automargin: true }, margin: { t: 30, b: 80, l: 80, r: 50 } };
            break;
        }

        case 'cross_deps': {
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
            plotLayout = preview 
                ? { margin: { t: 10, b: 10, l: 10, r: 10 }, xaxis: { visible: false, range: [-1.2, 1.2], fixedrange: true }, yaxis: { visible: false, range: [-1.2, 1.2], fixedrange: true, scaleanchor: 'x', scaleratio: 1 }, showlegend: false, autosize: true }
                // Добавили datarevision: currentThreshold
                : { datarevision: currentThreshold, xaxis: { visible: false, showgrid: false, zeroline: false }, yaxis: { visible: false, showgrid: false, zeroline: false, scaleanchor: 'x', scaleratio: 1 }, margin: { t: 30, r: 80, b: 50, l: 80 }, showlegend: false, hovermode: 'closest' };
        }
        break;
    }

    const renderControlPanel = () => {
        if (preview || controls.length === 0) return null;
        return (
            <div style={{
                background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e1e4e8', 
                display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px', width: '100%'
            }}>
                {controls.map(ctrl => {
                    // Рендер Checkbox
                    if (ctrl.type === 'checkbox') return (
                        <label key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#333', cursor: 'pointer' }}>
                            <input type="checkbox" checked={controlValues[ctrl.id]} onChange={e => handleControlChange(ctrl.id, e.target.checked)} />
                            {ctrl.label}
                        </label>
                    );
                    
                    // Рендер Select
                    if (ctrl.type === 'select') return (
                        <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                            <select value={controlValues[ctrl.id]} onChange={e => handleControlChange(ctrl.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', outline: 'none' }}>
                                {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    );

                    // Рендер Slider
                    if (ctrl.type === 'slider') {
                        const val = Number(controlValues[ctrl.id]) || 0;
                        const percentage = ((val - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
                        const valFormatted = val.toFixed(ctrl.step >= 1 ? 0 : 2);
                        
                        // Проверяем, оканчивается ли лейбл на > или <
                        const match = ctrl.label.match(/^(.*?)\s*([><])$/);

                        if (match) {
                            // 1. Сценарий для порогов (Прямая/Обратная корреляция > / <)
                            const textParts = match[1].split(' '); // Разбиваем слова для переноса строк
                            const operator = match[2]; // Знак > или <

                            return (
                                <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    
                                    {/* 1. Текст названия в две строки */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: '#555', lineHeight: '1.2', textAlign: 'center' }}>
                                        {textParts.map((part, i) => <span key={i}>{part}</span>)}
                                    </div>
                                    
                                    {/* 2. Знак оператора (> или <) */}
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                        {operator}
                                    </div>

                                    {/* 3. Значение порога без двоеточия */}
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', minWidth: '32px', textAlign: 'center' }}>
                                        {valFormatted}
                                    </div>

                                    {/* 4. Сам ползунок справа */}
                                    <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={val} 
                                        onChange={e => handleControlChange(ctrl.id, parseFloat(e.target.value))} 
                                        style={{ width: '100px', margin: 0, cursor: 'pointer', background: `linear-gradient(to right, #328fec 0%, #328fec ${percentage}%, #e4e4e7 ${percentage}%, #e4e4e7 100%)` }} 
                                    />
                                </div>
                            );
                        }

                        // 2. Стандартный сценарий (например, для ползунка "Точность: 2")
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', minWidth: 'auto', whiteSpace: 'nowrap' }}>
                                    {ctrl.label}: {valFormatted}
                                </label>
                                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={val} 
                                    onChange={e => handleControlChange(ctrl.id, parseFloat(e.target.value))} 
                                    style={{ width: '100px', margin: 0, cursor: 'pointer', background: `linear-gradient(to right, #328fec 0%, #328fec ${percentage}%, #e4e4e7 ${percentage}%, #e4e4e7 100%)` }} 
                                />
                            </div>
                        );
                    }

                    // 2. ДЕЙТПИКЕР (Date для графиков тренда)
                    if (ctrl.type === 'date') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <input 
                                    type="date" 
                                    min={ctrl.min} max={ctrl.max} 
                                    value={controlValues[ctrl.id]} 
                                    onChange={e => handleControlChange(ctrl.id, e.target.value)} 
                                    style={{ padding: '4px 8px', border: '1px solid #e1e4e8', borderRadius: '6px', fontSize: '12px', color: '#333', background: '#fff', outline: 'none' }}
                                />
                            </div>
                        );
                    }

                    // 3. ВЫПАДАЮЩИЙ СПИСОК (уже был в твоем коде)
                    if (ctrl.type === 'multiselect') {
                        const isOpen = openDropdown === ctrl.id;
                        const selectedList = (controlValues[ctrl.id] as string[]) || []; 
                        const isAllSelected = selectedList.length === ctrl.options.length;

                        return (
                            <div key={ctrl.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseLeave={() => setOpenDropdown(null)}>
                                {/* ... ЗДЕСЬ ОСТАЕТСЯ ТВОЙ ОРИГИНАЛЬНЫЙ КОД ДЛЯ MULTISELECT ... */}
                                {/* (Я его не пишу целиком, чтобы не засорять ответ, просто оставь его как есть) */}
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <div 
                                    onClick={() => setOpenDropdown(isOpen ? null : ctrl.id)}
                                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff', minWidth: '130px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span>Выбрано: {selectedList.length}</span>
                                    <span style={{ fontSize: '9px', marginLeft: '6px' }}>{isOpen ? '▲' : '▼'}</span>
                                </div>
                                {isOpen && (
                                    <div style={{ position: 'absolute', top: '100%', right: '0', paddingTop: '6px', zIndex: 999 }}>
                                        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '250px', overflowY: 'auto', minWidth: '200px', padding: '5px 0' }}>
                                            
                                            <div 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    const next = isAllSelected ? [] : [...ctrl.options]; 
                                                    handleControlChange(ctrl.id, next); 
                                                }} 
                                                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isAllSelected ? '#f0f7ff' : 'transparent', borderBottom: '1px solid #eee', marginBottom: '4px' }} 
                                                onMouseEnter={e => e.currentTarget.style.background = isAllSelected ? '#e0f0ff' : '#f8f9fa'} 
                                                onMouseLeave={e => e.currentTarget.style.background = isAllSelected ? '#f0f7ff' : 'transparent'} 
                                            >
                                                <input type="checkbox" checked={isAllSelected} readOnly style={{ cursor: 'pointer' }} />
                                                <span style={{ fontSize: '12px', color: '#333', fontWeight: 600 }}>Все признаки</span>
                                            </div>

                                            {ctrl.options.map(opt => {
                                                const isChecked = selectedList.includes(opt);
                                                return (
                                                    <div key={opt} onClick={(e) => { e.stopPropagation(); const next = isChecked ? selectedList.filter((v: string) => v !== opt) : [...selectedList, opt]; handleControlChange(ctrl.id, next); }} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isChecked ? '#f0f7ff' : 'transparent', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isChecked ? '#e0f0ff' : '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = isChecked ? '#f0f7ff' : 'transparent'} >
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

    if (plotData.length === 0 && chart.type !== 'trend_line') return null;

    return (
        <div style={containerStyle}>
            {!preview && (
                <div style={{ width: '100%', padding: '0 10px', boxSizing: 'border-box', textAlign: 'left' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px', fontWeight: 600 }}>{chartTitle}</h3>
                    {renderControlPanel()}
                </div>
            )}
            <Plot data={plotData} layout={plotLayout} config={{ displayModeBar: !preview, responsive: true }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export const DataCharts: React.FC<{ charts: ChartData[], preview?: boolean }> = ({ charts, preview }) => {
    if (!charts || charts.length === 0) return null;

    return (
        <div style={{ pointerEvents: preview ? 'none' : 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {charts.map((chart, idx) => (
                <InteractiveChart key={idx} chart={chart} preview={preview} />
            ))}
        </div>
    );
};