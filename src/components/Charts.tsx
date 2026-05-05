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

// --- 2. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ОПИСАНИЙ ГРАФИКОВ ---
const getChartDescription = (type: string): string => {
    switch (type) {
        case 'feature_tree': return 'Этот график показывает "расстояние" между признаками. Если ветви сливаются ниже пунктирной линии (порога), эти параметры считаются дубликатами. Внутри одной группы (цвета) достаточно оставить только один признак, чтобы не перегружать модели машинного обучения. Чем меньше порог кластеров, тем больше сходство у найденых столбцов.';
        case 'correlation': return 'Тепловая карта показывает силу и направление линейной связи между числовыми параметрами. Значения, близкие к 1 или -1, указывают на сильную взаимосвязь, а близкие к 0 — на её отсутствие. Помогает быстро найти факторы, влияющие друг на друга.';
        case 'trend_line': return 'Отображает динамику изменения показателей во времени. Полезно для выявления трендов, сезонности и резких скачков (аномалий) в исторической перспективе.';
        case 'pairplot': return 'Матрица рассеяния позволяет одним взглядом оценить попарные зависимости множества признаков, выявить кластеры и нелинейные паттерны, которые "не видит" обычная корреляция.';
        case 'feature_importances': return 'Показывает вес (важность) каждого параметра в предсказании целевой переменной. Чем длиннее полоса, тем сильнее этот признак влияет на результат по оценке модели (Random Forest).';
        case 'dependency': return 'Детальный анализ зависимости между двумя конкретными метриками. Помогает понять форму их взаимосвязи и визуально оценить плотность и разброс данных.';
        case 'outliers': return 'Диаграмма размаха (Boxplot) наглядно демонстрирует распределение данных: медиану, квартили и помогает быстро обнаружить статистические выбросы (аномалии).';
        case 'category_count':
        case 'numeric_hist': return 'Гистограмма визуализирует частоту распределения данных. Показывает, какие значения (или категории) встречаются чаще всего, а какие — являются редкостью.';
        case 'cash_flow_chart': return 'График движения денежных средств (Cash Flow) показывает притоки и оттоки денег по периодам. Зеленые столбцы — это профицит, красные — дефицит (отток превышает приток). Помогает прогнозировать кассовые разрывы.';
        case 'pnl_report': return 'Отчет о прибылях и убытках (P&L). Отражает общую выручку, понесенные расходы и итоговую чистую прибыль (или убыток). Каскадная диаграмма (Waterfall) наглядно показывает, как доходы «съедаются» расходами.';
        case 'expense_pie_chart': return 'Структура расходов демонстрирует, на какие категории (статьи затрат) уходит основная часть бюджета компании.';
        case 'abc_analysis': return 'Классический закон Парето (80/20). Синие столбики — это ваша выручка по категориям. Красная линия показывает НАКОПЛЕННЫЙ процент. Как только красная линия пересекает отметку 80% — все товары слева от неё являются вашим ядром (группа А), которое приносит основные деньги.';
        case 'unit_economics': return 'Оценка эффективности каналов. Зеленый столбец (LTV) — выручка с клиента за всё время. Красный (CAC) — стоимость его привлечения. Оранжевая линия (ROMI) показывает окупаемость в процентах — ищите каналы с самым высоким ROMI.';
        case 'revenue_forecast': return 'Прогноз выручки на основе исторического тренда. Закрашенная зона (конус неопределенности) показывает возможный разброс доходов: от пессимистичного до оптимистичного сценария.';
        case 'cohort_analysis': return 'Тепловая карта жизненного цикла клиентов (Retention). Показывает "здоровье" базы: строки — это когорты (пользователи, пришедшие в один месяц). Столбцы — месяцы с момента первой покупки. Темные ячейки означают высокую лояльность, белые пустоты — отток.';
        default: return 'Визуализация данных для подробного анализа.';
    }
};

// --- 3. ИНТЕРАКТИВНЫЙ КОМПОНЕНТ ДЛЯ ОДНОГО ГРАФИКА ---
const InteractiveChart: React.FC<{ chart: ChartData, preview?: boolean }> = ({ chart, preview }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // --- АРХИТЕКТУРА 1: Инициализация контроллеров (выполняется 1 раз) ---
    const controls = useMemo<ChartControl[]>(() => {
        const ctrls: ChartControl[] = [];
        switch (chart.type) {
            case 'correlation' : {
                ctrls.push({ type: 'select', id: 'sign', label: 'Связь', options: ['Все', 'Только прямая (+)', 'Только обратная (-)'], defaultValue: 'Все' });
                ctrls.push({ type: 'slider', id: 'thresh_pos', label: 'Прямая корреляция >', min: 0, max: 1, step: 0.05, defaultValue: 0 });
                ctrls.push({ type: 'slider', id: 'thresh_neg', label: 'Обратная корреляция <', min: -1, max: 0, step: 0.05, defaultValue: 0 });
                ctrls.push({ type: 'checkbox', id: 'hide_diag', label: 'Скрыть диагональ', defaultValue: false });
                ctrls.push({ type: 'slider', id: 'precision', label: 'Точность', min: 0, max: 5, step: 1, defaultValue: 2 });
                break;
            }
            case 'trend_line':{
                const xDates = chart.data.x || [];
                if (xDates.length > 0) {
                    const minDate = xDates[0].split(' ')[0];
                    const maxDate = xDates[xDates.length - 1].split(' ')[0];
                    ctrls.push({ type: 'date', id: 'date_start', label: 'От', defaultValue: minDate, min: minDate, max: maxDate });
                    ctrls.push({ type: 'date', id: 'date_end', label: 'До', defaultValue: maxDate, min: minDate, max: maxDate });
                }
                ctrls.push({ type: 'multiselect', id: 'visible_columns', label: 'Показатели', options: chart.data.numeric_cols || [], defaultValue: (chart.data.numeric_cols || []).slice(0, 5) });
                break;
            }
            case 'pairplot': {
                if (chart.data.all_columns?.length > 2) {
                    ctrls.push({ type: 'multiselect', id: 'splom_columns', label: 'Признаки', options: chart.data.all_columns, defaultValue: chart.data.default_columns });
                }
                break;
            }
            case 'feature_tree': {
                const dcoord = chart.data.dcoord || [];
                const maxDist = dcoord.length > 0 ? Math.ceil(Math.max(...dcoord.flat()) * 10) / 10 : 2;
                ctrls.push({ type: 'slider', id: 'cluster_threshold', label: 'Порог кластеров <', min: 0, max: maxDist, step: 0.02, defaultValue: 0.1 });
                break;
            }
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

    // ИЗМЕНЕНИЕ 1: Уменьшены отступы (padding), ширина 100% вместо 95vw для лучшего прилегания к модальному окну
    const containerStyle: React.CSSProperties = {
        width: '100%', 
        height: preview ? 'auto' : '83vh', 
        maxWidth: '100%',
        position: 'relative', 
        overflow: preview ? 'hidden' : 'visible',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        aspectRatio: preview ? '3 / 2' : 'auto',
        boxSizing: 'border-box'
    };

    let plotData: any[] = [];
    let plotLayout: any = {};
    let dynamicTextExplanation: React.ReactNode = null;

    // --- АРХИТЕКТУРА 3: Роутинг графиков (чистый Switch вместо спама If) ---
    switch (chart.type) {
        case 'correlation': {
            const { sign, thresh_pos, thresh_neg, hide_diag, precision } = controlValues;
            const cols = Object.keys(chart.data);
            const z_vals = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));

            const z_filtered = z_vals.map((row, i) => row.map((val, j) => {
                if (hide_diag && i === j) return null;
                if (sign === 'Только прямая (+)' && val < 0) return null;
                if (sign === 'Только обратная (-)' && val > 0) return null;
                if (val > 0 && val < thresh_pos) return null;
                if (val < 0 && val > thresh_neg) return null;
                if (val === 0 && (thresh_pos > 0 || thresh_neg < 0)) return null; 
                return val;
            }));

            const text_filtered = z_filtered.map(row => row.map(val => val === null ? '' : val.toFixed(precision)));
            const fontSize = cols.length > 30 ? 8 : cols.length > 15 ? 10 : 12;

            plotData = [{
                z: z_filtered, x: !preview ? cols : [], y: !preview ? cols : [],
                type: 'heatmap', colorscale: 'RdBu', zmin: -1, zmax: 1, zmid: 0, 
                showscale: !preview, 
                text: !preview ? text_filtered : undefined,
                texttemplate: !preview ? "%{text}" : undefined,
                hoverinfo: preview ? 'skip' : 'x+y+text'
            }];
            
            plotLayout = preview ? previewLayout : { 
                plot_bgcolor: '#ffffff', 
                paper_bgcolor: '#ffffff',
                margin: { t: 30, r: 50, b: 120, l: 150 }, 
                xaxis: { 
                    automargin: true, 
                    tickangle: -45,
                    tickmode: 'linear', 
                    dtick: 1,
                    tickfont: { size: fontSize }
                }, 
                yaxis: { 
                    automargin: true, 
                    autorange: 'reversed',
                    tickmode: 'linear', 
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
                datarevision: `${activeCols.join(',')}_${startDate}_${endDate}`, 
                xaxis: { automargin: true, type: 'date' }, yaxis: { automargin: true, title: { text: 'Значения метрик' } },
                margin: { t: 20, b: 80, l: 80, r: 50 }, showlegend: true, legend: { orientation: 'h', y: -0.2 } 
            };
            break;
        }

        case 'pairplot': {
            const allDims = chart.data.dimensions || [];
            const selectedList = controlValues['splom_columns'] as string[] || chart.data.default_columns || [];
            
            const activeOriginalLabels = allDims
                .filter((dim: any) => preview ? chart.data.default_columns.includes(dim.label) : selectedList.includes(dim.label))
                .map((dim: any) => dim.label);

            const activeDims = allDims.filter((dim: any) => {
                if (preview) return chart.data.default_columns.includes(dim.label);
                return selectedList.includes(dim.label);
            }).map((dim: any) => ({
                ...dim,
                label: '' 
            }));
            
            plotData = [{
                type: 'splom', dimensions: activeDims,
                marker: { color: '#4a90e2', size: preview ? 2 : 4, opacity: 0.6, line: { color: 'white', width: 0.5 } },
                hoverinfo: preview ? 'skip' : 'all'
            }];

            const numDims = activeOriginalLabels.length;
            const annotations: any[] = [];
            
            if (!preview) {
                activeOriginalLabels.forEach((label: string, i: number) => {
                    const shortLabel = label.length > 20 ? label.substring(0, 17) + '...' : label;
                    annotations.push({
                        xref: 'paper', yref: 'paper',
                        x: -0.04, y: 1 - ((i + 0.5) / numDims), 
                        xanchor: 'right', yanchor: 'middle',
                        text: shortLabel, showarrow: false, font: { size: 12, color: '#333' }
                    });
                    annotations.push({
                        xref: 'paper', yref: 'paper',
                        x: (i + 0.5) / numDims, y: -0.05, 
                        xanchor: 'right', yanchor: 'top',
                        textangle: -15, 
                        text: shortLabel, showarrow: false, font: { size: 12, color: '#333' }
                    });
                });
            }
            
            let splomLayout: any = {
                datarevision: activeDims.length,
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
                orientation: 'h', 
                x: chart.data.importances, 
                y: chart.data.features, 
                marker: { 
                    color: '#328fec',
                    opacity: 0.8
                },
                hoverinfo: preview ? 'skip' : 'x+y'
            }];
            
            plotLayout = preview 
                ? previewLayout 
                : { 
                    margin: { t: 30, r: 50, b: 50, l: 150 },
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

        case 'feature_tree': {
            interface TreeLink {
                id: number;
                x: number[];
                y: number[];
                height: number;
                parentId: number | null;
            }
            const { icoord, dcoord, ivl } = chart.data;
            const threshold = controlValues['cluster_threshold'] ?? 1.0;

            const links: TreeLink[] = icoord.map((x: number[], i: number) => ({
                id: i, 
                x: x, 
                y: dcoord[i], 
                height: Math.max(...dcoord[i]), 
                parentId: null
            }));

            links.forEach((parent: any) => {
                const px1 = parent.x[0], py1 = parent.y[0];
                const px2 = parent.x[3], py2 = parent.y[3];
                links.forEach((child: any) => {
                    if (parent.id === child.id) return;
                    const cx = (child.x[1] + child.x[2]) / 2, cy = child.y[1];
                    if (Math.abs(px1 - cx) < 0.1 && Math.abs(py1 - cy) < 0.1) child.parentId = parent.id;
                    else if (Math.abs(px2 - cx) < 0.1 && Math.abs(py2 - cy) < 0.1) child.parentId = parent.id;
                });
            });

            const sortedLinks = [...links].sort((a, b) => b.height - a.height);
            const palette = ['#e6194b', '#3cb44b', '#f58231', '#911eb4', '#4363d8', '#f032e6', '#008080', '#e6beff', '#9a6324'];
            let colorIdx = 0;
            const linkColorMap: Record<number, string> = {};

            sortedLinks.forEach((link: any) => {
                if (link.height > threshold) {
                    linkColorMap[link.id] = '#a0aec0';
                } else {
                    const parentColor = link.parentId !== null ? linkColorMap[link.parentId] : null;
                    if (!parentColor || parentColor === '#a0aec0') {
                        linkColorMap[link.id] = palette[colorIdx % palette.length];
                        colorIdx++;
                    } else {
                        linkColorMap[link.id] = parentColor;
                    }
                }
            });

            if (!preview) {
                const clustersMap = new Map<string, string[]>();
                const isolated: string[] = [];

                ivl.forEach((featureName: string, idx: number) => {
                    const leafX = idx * 10 + 5;
                    const currentNode = links.find(l => 
                        (Math.abs(l.x[0] - leafX) < 0.1 && l.y[0] < 0.001) || 
                        (Math.abs(l.x[3] - leafX) < 0.1 && l.y[3] < 0.001)
                    );

                    if (!currentNode || currentNode.height > threshold) {
                        isolated.push(featureName);
                        return;
                    }

                    let topNode = currentNode;
                    while (topNode.parentId !== null) {
                        const parent = links.find(l => l.id === topNode.parentId);
                        if (parent && parent.height <= threshold) topNode = parent;
                        else break;
                    }

                    const color = linkColorMap[topNode.id];
                    if (!clustersMap.has(color)) clustersMap.set(color, []);
                    clustersMap.get(color)!.push(featureName);
                });

                const clusterEntries = Array.from(clustersMap.entries());

                // ИЗМЕНЕНИЕ 2: Убрано жестко вшитое пояснение, так как оно переехало наверх. Оставлены только результаты групп.
                dynamicTextExplanation = (
                    <div style={{ 
                        marginTop: '0px', 
                        padding: '12px', 
                        background: '#f8f9fa', 
                        borderRadius: '8px', 
                        border: '1px solid #e1e4e8', 
                        width: '100%', 
                        boxSizing: 'border-box',
                        // ИЗМЕНЕНИЕ: Было жесткое height: '200px', теперь гибкое maxHeight
                        maxHeight: '140px', 
                        overflowY: 'auto'   
                    }}>
                        {clusterEntries.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {clusterEntries.map(([color, features], i) => (
                                        <div key={color} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px',
                                            background: '#ffffff',
                                            border: '1px solid #dce4ec',
                                            borderRadius: '16px', 
                                            padding: '6px 12px',  
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                        }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                            <div style={{ fontSize: '12px', color: '#444' }}>
                                                <span style={{ fontWeight: 600 }}>Группа {i + 1}:</span> {features.join(', ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isolated.length > 0 && (
                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                                <span style={{ fontWeight: 600, color: '#333' }}>Уникальные признаки:</span> {isolated.join(', ')} (их лучше не удалять)
                            </div>
                        )}
                    </div>
                );
            }

            plotData = links.map((link: any) => ({
                x: link.x, y: link.y, type: 'scatter', mode: 'lines',
                line: { color: linkColorMap[link.id], width: 2 }, hoverinfo: 'none', showlegend: false
            }));

            plotData.push({
                x: [0, ivl.length * 10], y: [threshold, threshold], type: 'scatter', mode: 'lines',
                line: { color: '#e74c3c', width: 1.5, dash: 'dash' }, hoverinfo: 'none', showlegend: false
            });

            const tickvals = ivl.map((_: any, index: number) => index * 10 + 5);

            plotLayout = preview ? previewLayout : {
                margin: { t: 10, r: 20, l: 60, b: 20 }, 
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                xaxis: { 
                    tickvals, 
                    ticktext: ivl, 
                    tickangle: -45, 
                    showgrid: false, 
                    zeroline: false,
                    automargin: true 
                },
                yaxis: { 
                    title: { 
                        // Используем <br> для переноса строки
                        text: 'Степень различия признаков<br><span style="font-size: 12px; color: #777; font-weight: normal;">(дистанция = 1 - корреляция, корреляция ∈ [-1, 1])</span>',
                        // Увеличим отступ, чтобы две строки не наезжали на цифры оси Y
                        standoff: 20 
                    }, 
                    showgrid: true, 
                    gridcolor: '#f0f4f8', 
                    zeroline: false 
                },
                hovermode: 'closest'
            };
            break;
        }
        case 'cash_flow_chart': {
            // Зеленый для плюса, красный для минуса
            const colors = chart.data.values.map((v: number) => v >= 0 ? '#3cb44b' : '#e6194b');
            
            plotData = [{
                x: chart.data.labels,
                y: chart.data.values,
                type: 'bar',
                marker: { color: colors },
                hoverinfo: preview ? 'skip' : 'x+y'
            }];
            plotLayout = preview ? previewLayout : {
                margin: { t: 30, r: 50, b: 80, l: 80 },
                xaxis: { automargin: true, type: 'category' },
                yaxis: { automargin: true, title: { text: 'Сумма' } }
            };
            break;
        }

        case 'pnl_report': {
            // Используем каскадную диаграмму (Waterfall) - идеально для P&L
            plotData = [{
                type: 'waterfall',
                x: ['Доходы', 'Расходы', 'Чистая прибыль'],
                y: [chart.data.total_income, -chart.data.total_expense, chart.data.net_profit],
                measure: ['relative', 'relative', 'total'],
                text: [chart.data.total_income, -chart.data.total_expense, chart.data.net_profit].map(v => String(v.toLocaleString())),
                textposition: 'outside',
                connector: { line: { color: "rgb(63, 63, 63)", width: 1, dash: "dot" } },
                decreasing: { marker: { color: '#e6194b' } },
                increasing: { marker: { color: '#3cb44b' } },
                totals: { marker: { color: chart.data.net_profit >= 0 ? '#3cb44b' : '#e6194b' } },
                hoverinfo: preview ? 'skip' : 'y'
            }];
            plotLayout = preview ? previewLayout : {
                margin: { t: 30, r: 50, b: 50, l: 80 },
                xaxis: { automargin: true },
                yaxis: { automargin: true, title: { text: 'Сумма' } },
                showlegend: false
            };
            break;
        }

        case 'expense_pie_chart': {
            // Кольцевая диаграмма (Donut chart)
            plotData = [{
                labels: chart.data.categories,
                values: chart.data.amounts,
                type: 'pie',
                hole: 0.45, // Делает дырку внутри (Donut)
                textinfo: preview ? 'none' : 'percent',
                hoverinfo: preview ? 'skip' : 'label+percent+value',
                marker: {
                    // Красивая цветовая палитра
                    colors: ['#4a90e2', '#e6194b', '#3cb44b', '#ffe119', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe']
                }
            }];
            
            // Если это превью в сайдбаре, скрываем легенду, чтобы влезло
            plotLayout = preview ? { ...previewLayout, showlegend: false, margin: { t: 5, b: 5, l: 5, r: 5 } } : {
                margin: { t: 20, r: 20, b: 20, l: 20 },
                showlegend: true,
                legend: { orientation: 'v', x: 1.1, y: 0.5 }
            };
            break;
        }

        case 'abc_analysis': {
            plotData = [
                { x: chart.data.categories, y: chart.data.amounts, type: 'bar', name: 'Выручка', marker: { color: '#4a90e2' } },
                { x: chart.data.categories, y: chart.data.cum_percent, type: 'scatter', mode: 'lines+markers', yaxis: 'y2', name: '% нарастающим итогом', line: { color: '#e6194b', width: 3 } }
            ];
            plotLayout = preview ? previewLayout : {
                margin: { t: 30, r: 50, b: 80, l: 80 },
                xaxis: { automargin: true },
                yaxis: { title: 'Сумма выручки' },
                yaxis2: { title: 'Накопленный %', overlaying: 'y', side: 'right', range: [0, 105], showgrid: false },
                showlegend: true, legend: { orientation: 'h', y: -0.2 }
            };
            break;
        }

        case 'unit_economics': {
            plotData = [
                { x: chart.data.sources, y: chart.data.arpu, type: 'bar', name: 'LTV (Выручка за всё время)', marker: { color: '#3cb44b' } },
                { x: chart.data.sources, y: chart.data.cac, type: 'bar', name: 'CAC (Затраты)', marker: { color: '#e6194b' } },
                { 
                    x: chart.data.sources, 
                    y: chart.data.romi, 
                    type: 'scatter', 
                    mode: preview ? 'lines+markers' : 'lines+markers+text', 
                    name: 'ROMI', 
                    // ИСПРАВЛЕНИЕ: Используем готовые подписи с бэкенда. 
                    // Fallback (map) оставлен на случай, если в Redis остались кэшированные данные со старой структуры.
                    text: chart.data.romi_text || chart.data.romi.map((r: any) => r + '%'), 
                    textposition: 'top center', 
                    yaxis: 'y2', 
                    line: { color: '#f58231', width: 2 }, 
                    marker: { size: 8 },
                    textfont: { size: 11, color: '#000000', weight: 'bold' }
                }
            ];
            plotLayout = preview ? previewLayout : {
                barmode: 'group',
                margin: { t: 30, r: 50, b: 80, l: 80 },
                xaxis: { automargin: true },
                yaxis: { title: 'Сумма' },
                yaxis2: { title: 'Окупаемость (ROMI %)', overlaying: 'y', side: 'right', showgrid: false },
                showlegend: true, legend: { orientation: 'h', y: -0.2 }
            };
            break;
        }

        case 'revenue_forecast': {
            plotData = [
                // 1. Исторический факт
                { x: chart.data.hist_dates, y: chart.data.hist_values, type: 'scatter', mode: 'lines+markers', name: 'Исторический факт', line: { color: '#4a90e2', width: 3 } },
                
                // 2. Верхняя граница конуса (прозрачная линия, нужна как "потолок" для заливки)
                { x: chart.data.forecast_dates, y: chart.data.forecast_upper, type: 'scatter', mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' },
                
                // 3. Нижняя граница конуса (заливает пространство от себя до верхней границы)
                { x: chart.data.forecast_dates, y: chart.data.forecast_lower, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(245, 130, 49, 0.15)', line: { width: 0 }, name: 'Возможный диапазон (Конус)', hoverinfo: 'skip' },
                
                // 4. Средний прогноз (пунктир) — рисуем поверх заливки
                { x: chart.data.forecast_dates, y: chart.data.forecast_values, type: 'scatter', mode: 'lines+markers', name: 'Прогноз (Средний)', line: { color: '#f58231', width: 3, dash: 'dash' } }
            ];
            plotLayout = preview ? previewLayout : {
                margin: { t: 30, r: 20, b: 80, l: 80 },
                xaxis: { automargin: true, type: 'date' },
                yaxis: { title: 'Выручка' },
                showlegend: true, legend: { orientation: 'h', y: -0.2 }
            };
            break;
        }

        case 'cohort_analysis': {
            plotData = [{
                z: chart.data.z,
                x: chart.data.periods,
                y: chart.data.cohorts,
                text: chart.data.text,
                type: 'heatmap',
                colorscale: 'Blues',
                showscale: !preview, // Прячем цветовую шкалу на превью
                texttemplate: preview ? undefined : "%{text}", // Показываем % в ячейках
                hoverinfo: preview ? 'skip' : 'x+y+text'
            }];
            plotLayout = preview ? previewLayout : {
                margin: { t: 30, r: 50, b: 50, l: 80 },
                xaxis: { 
                    title: 'Месяц жизни клиента (0 = первый заказ)', 
                    automargin: true, 
                    dtick: 1 // Заставляем показывать каждую цифру месяца
                },
                yaxis: { 
                    title: 'Когорта (Месяц)', 
                    automargin: true, 
                    autorange: 'reversed' // Важно: старые когорты (январь) должны быть наверху!
                }
            };
            break;
        }
    }

    const renderControlPanel = () => {
        if (preview || controls.length === 0) return null;
        const isFeatureTree = chart.type === 'feature_tree';
        return (
            <div style={{
                background: '#f8f9fa', padding: isFeatureTree ? '6px 12px' : '12px 16px', borderRadius: '8px', border: '1px solid #e1e4e8', 
                display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', width: '100%' // Убрали marginBottom, так как это последний элемент шапки
            }}>
                {controls.map(ctrl => {
                    if (ctrl.type === 'checkbox') return (
                        <label key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#333', cursor: 'pointer' }}>
                            <input type="checkbox" checked={controlValues[ctrl.id]} onChange={e => handleControlChange(ctrl.id, e.target.checked)} />
                            {ctrl.label}
                        </label>
                    );
                    
                    if (ctrl.type === 'select') return (
                        <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                            <select value={controlValues[ctrl.id]} onChange={e => handleControlChange(ctrl.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', outline: 'none' }}>
                                {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    );

                    if (ctrl.type === 'slider') {
                        const val = Number(controlValues[ctrl.id]) || 0;
                        const percentage = ((val - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
                        const valFormatted = val.toFixed(ctrl.step >= 1 ? 0 : 2);
                        const match = ctrl.label.match(/^(.*?)\s*([><])$/);

                        if (match) {
                            const operator = match[2];
                            const isClusterThreshold = ctrl.id === 'cluster_threshold';

                            return (
                                <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    
                                    {isClusterThreshold ? (
                                        // ИЗМЕНЕНИЕ: Порог кластеров в одну строку
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>
                                            {match[1]}
                                        </div>
                                    ) : (
                                        // Прямая/Обратная корреляция остаются в две строки (как башенка)
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: '#555', lineHeight: '1.2', textAlign: 'center' }}>
                                            {match[1].split(' ').map((part, i) => <span key={i}>{part}</span>)}
                                        </div>
                                    )}

                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{operator}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', minWidth: '32px', textAlign: 'center' }}>{valFormatted}</div>
                                    <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={val} 
                                        onChange={e => handleControlChange(ctrl.id, parseFloat(e.target.value))} 
                                        style={{ width: '100px', margin: 0, cursor: 'pointer', background: `linear-gradient(to right, #328fec 0%, #328fec ${percentage}%, #e4e4e7 ${percentage}%, #e4e4e7 100%)` }} 
                                    />
                                </div>
                            );
                        }
                    }

                    if (ctrl.type === 'date') {
                        return (
                            <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <input type="date" min={ctrl.min} max={ctrl.max} value={controlValues[ctrl.id]} 
                                    onChange={e => handleControlChange(ctrl.id, e.target.value)} 
                                    style={{ padding: '4px 8px', border: '1px solid #e1e4e8', borderRadius: '6px', fontSize: '12px', color: '#333', background: '#fff', outline: 'none' }}
                                />
                            </div>
                        );
                    }

                    if (ctrl.type === 'multiselect') {
                        const isOpen = openDropdown === ctrl.id;
                        const selectedList = (controlValues[ctrl.id] as string[]) || []; 
                        const isAllSelected = selectedList.length === ctrl.options.length;

                        return (
                            <div key={ctrl.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseLeave={() => setOpenDropdown(null)}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{ctrl.label}</label>
                                <div onClick={() => setOpenDropdown(isOpen ? null : ctrl.id)}
                                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff', minWidth: '130px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Выбрано: {selectedList.length}</span>
                                    <span style={{ fontSize: '9px', marginLeft: '6px' }}>{isOpen ? '▲' : '▼'}</span>
                                </div>
                                {isOpen && (
                                    <div style={{ position: 'absolute', top: '100%', right: '0', paddingTop: '6px', zIndex: 999 }}>
                                        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '250px', overflowY: 'auto', minWidth: '200px', padding: '5px 0' }}>
                                            <div onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    const next = isAllSelected ? [] : [...ctrl.options]; 
                                                    handleControlChange(ctrl.id, next); 
                                                }} 
                                                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isAllSelected ? '#f0f7ff' : 'transparent', borderBottom: '1px solid #eee', marginBottom: '4px' }} 
                                                onMouseEnter={e => e.currentTarget.style.background = isAllSelected ? '#e0f0ff' : '#f8f9fa'} 
                                                onMouseLeave={e => e.currentTarget.style.background = isAllSelected ? '#f0f7ff' : 'transparent'}>
                                                <input type="checkbox" checked={isAllSelected} readOnly style={{ cursor: 'pointer' }} />
                                                <span style={{ fontSize: '12px', color: '#333', fontWeight: 600 }}>Все признаки</span>
                                            </div>

                                            {ctrl.options.map(opt => {
                                                const isChecked = selectedList.includes(opt);
                                                return (
                                                    <div key={opt} onClick={(e) => { e.stopPropagation(); const next = isChecked ? selectedList.filter((v: string) => v !== opt) : [...selectedList, opt]; handleControlChange(ctrl.id, next); }} 
                                                        style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isChecked ? '#f0f7ff' : 'transparent', transition: 'background 0.2s' }} 
                                                        onMouseEnter={e => e.currentTarget.style.background = isChecked ? '#e0f0ff' : '#f8f9fa'} 
                                                        onMouseLeave={e => e.currentTarget.style.background = isChecked ? '#f0f7ff' : 'transparent'}>
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
    const isFeatureTree = chart.type === 'feature_tree';

    return (
        <div style={containerStyle}>
            {!preview && (
                // Уменьшили marginBottom для блока заголовка, если это дендрограмма
                <div style={{ width: '100%', boxSizing: 'border-box', textAlign: 'left', marginBottom: isFeatureTree ? '4px' : '12px' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#333', fontSize: '18px', fontWeight: 600 }}>{chartTitle}</h3>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: isFeatureTree ? '6px' : '12px', lineHeight: '1.4' }}>
                        {getChartDescription(chart.type)}
                    </div>
                    {renderControlPanel()}
                </div>
            )}
            
            {/* ИЗМЕНЕНИЕ: Обертка flex: 1 заставит Plotly занять ВСЁ свободное пространство по высоте */}
            <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
                <Plot data={plotData} layout={plotLayout} config={{ displayModeBar: !preview, responsive: true }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} />
            </div>
        
            {dynamicTextExplanation}
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