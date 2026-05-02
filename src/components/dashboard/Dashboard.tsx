import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ChartData } from '../../types';
import { DataCharts } from '../Charts';
import { DashboardWidgetPlot } from './WidgetPlot'
import { FOLDERS, getChartInfo } from '../RightSidebar';
import { COLORS } from '../../colorPalette'

const GRID_SIZE = 10; 
const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

interface FolderData { id: string; title: string; types: string[]; }
interface DashboardItem { id: string; chart: ChartData; folderId: string; x: number; y: number; w: number; h: number; }
interface GroupBounds { x: number; y: number; w: number; h: number; }

interface ChartSettings {
    showLabels: boolean;
    angle: number;
    fontSize: number;
}

const DEFAULT_SETTINGS: ChartSettings = { showLabels: true, angle: 0, fontSize: 10 };

const findFreeSpace = (items: DashboardItem[], startX: number, startY: number, w: number, h: number) => {
    let x = startX;
    let y = startY;
    let hasOverlap = true;
    let attempts = 0;

    while (hasOverlap && attempts < 50) {
        hasOverlap = false;
        for (const item of items) {
            const overlapX = x < item.x + item.w + GRID_SIZE && x + w + GRID_SIZE > item.x;
            const overlapY = y < item.y + item.h + GRID_SIZE && y + h + GRID_SIZE > item.y;

            if (overlapX && overlapY) {
                hasOverlap = true;
                x = item.x + item.w + GRID_SIZE; 
                break; 
            }
        }
        attempts++;
    }
    return { x, y };
};

export const Dashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLDivElement>(null);

    const state = location.state as { charts: ChartData[], folders: FolderData[] } | null;
    const charts = state?.charts || [];
    const folders = state?.folders || FOLDERS;

    const [dashItems, setDashItems] = useState<DashboardItem[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
        relations: true, distributions: true, anomalies: true, trends: true
    });
    
    const [chartSettings, setChartSettings] = useState<Record<string, ChartSettings>>({});
    const [activeSettingsMenu, setActiveSettingsMenu] = useState<string | null>(null);

    // --- ЛОГИКА Z-INDEX ДЛЯ НАСТРОЕК ---
    // Вычисляем, к какой группе относится открытое меню
    const activeChart = dashItems.find(i => i.id === activeSettingsMenu);
    const activeGroupId = activeChart ? activeChart.folderId : null;

    const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);

    const [groupBounds, setGroupBounds] = useState<Record<string, GroupBounds>>(() => {
        const init: Record<string, GroupBounds> = {};
        folders.forEach((f: FolderData, i: number) => {
            init[f.id] = { x: 20 + (i % 2) * 380, y: 20 + Math.floor(i / 2) * 280, w: 340, h: 240 };
        });
        return init;
    });

    useEffect(() => {
        if (!charts || charts.length === 0) navigate('/');
    }, [charts, navigate]);

    const toggleFolder = (id: string) => setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));

    const handleDragStart = (e: React.DragEvent, chart: ChartData, folderId: string) => {
        e.dataTransfer.setData('chart', JSON.stringify(chart));
        e.dataTransfer.setData('folderId', folderId);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const chartData = e.dataTransfer.getData('chart');
        const folderId = e.dataTransfer.getData('folderId');

        if (chartData && folderId && canvasRef.current) {
            const chart = JSON.parse(chartData);
            const folderItems = dashItems.filter(i => i.folderId === folderId);
            
            const targetW = 280;
            const targetH = 200;
            
            let finalX = GRID_SIZE;
            let finalY = GRID_SIZE;

            if (folderItems.length > 0) {
                const rect = canvasRef.current.getBoundingClientRect();
                const mouseX = e.clientX - rect.left + canvasRef.current.scrollLeft;
                const mouseY = e.clientY - rect.top + canvasRef.current.scrollTop;

                const group = groupBounds[folderId];
                
                let newX = Math.round((mouseX - group.x) / GRID_SIZE) * GRID_SIZE;
                let newY = Math.round((mouseY - group.y - 24) / GRID_SIZE) * GRID_SIZE; 

                newX = Math.max(GRID_SIZE, newX);
                newY = Math.max(GRID_SIZE, newY);

                const hitChart = folderItems.find(i => newX >= i.x && newX <= i.x + i.w && newY >= i.y && newY <= i.y + i.h);
                if (hitChart) {
                    newX = hitChart.x + hitChart.w + GRID_SIZE;
                    newY = hitChart.y;
                }

                const freeSpace = findFreeSpace(folderItems, newX, newY, targetW, targetH);
                finalX = freeSpace.x;
                finalY = freeSpace.y;
            }

            const newId = `${chart.type}-${Date.now()}`;
            const newItem: DashboardItem = { id: newId, chart, folderId, x: finalX, y: finalY, w: targetW, h: targetH };
            
            setChartSettings(prev => ({ ...prev, [newId]: { ...DEFAULT_SETTINGS } }));

            setDashItems(prev => {
                const next = [...prev, newItem];
                setGroupBounds(gb => {
                    if (folderItems.length === 0) {
                        return { ...gb, [folderId]: { ...gb[folderId], w: finalX + targetW + GRID_SIZE, h: finalY + targetH + GRID_SIZE + 24 } };
                    } else {
                        const maxW = Math.max(gb[folderId].w, finalX + targetW + GRID_SIZE);
                        const maxH = Math.max(gb[folderId].h, finalY + targetH + GRID_SIZE + 24); 
                        return { ...gb, [folderId]: { ...gb[folderId], w: maxW, h: maxH } };
                    }
                });
                return next;
            });
        }
    };

    const removeItem = (id: string) => {
        setDashItems(prev => prev.filter(item => item.id !== id));
        setChartSettings(prev => { const next = {...prev}; delete next[id]; return next; });
        setActiveSettingsMenu(null);
    };
    
    const updateItem = (id: string, folderId: string, updates: Partial<DashboardItem>) => {
        setDashItems(prev => {
            const next = prev.map(item => {
                if (item.id === id) {
                    return { 
                        ...item, 
                        ...updates, 
                        // Принудительно округляем координаты до сетки
                        x: Math.max(0, snapToGrid(updates.x ?? item.x)), 
                        y: Math.max(0, snapToGrid(updates.y ?? item.y)) 
                    };
                }
                return item;
            });
            const currentItem = next.find(i => i.id === id)!;
            
            setGroupBounds(gb => {
                const maxW = Math.max(gb[folderId].w, currentItem.x + currentItem.w + GRID_SIZE);
                const maxH = Math.max(gb[folderId].h, currentItem.y + currentItem.h + GRID_SIZE + 24);
                return { ...gb, [folderId]: { ...gb[folderId], w: maxW, h: maxH } };
            });
            return next;
        });
    };

    const updateGroup = (id: string, updates: Partial<GroupBounds>) => {
        setGroupBounds(prev => ({ 
            ...prev, 
            [id]: { 
                ...prev[id], 
                ...updates, 
                // Принудительно округляем координаты до сетки
                x: Math.max(0, snapToGrid(updates.x ?? prev[id].x)), 
                y: Math.max(0, snapToGrid(updates.y ?? prev[id].y)) 
            } 
        }));
    };

    const updateSettings = (id: string, updates: Partial<ChartSettings>) => {
        setChartSettings(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    };

    const exportPNG = async () => {
        if (!canvasRef.current) return;
        setIsExporting('png');
        setActiveSettingsMenu(null); 
        try {
            await new Promise(res => setTimeout(res, 50)); 
            const canvas = await html2canvas(canvasRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const link = document.createElement('a'); link.download = 'dashboard.png'; link.href = canvas.toDataURL('image/png'); link.click();
        } finally { setIsExporting(null); }
    };

    const exportPDF = async () => {
        if (!canvasRef.current) return;
        setIsExporting('pdf');
        setActiveSettingsMenu(null);
        try {
            await new Promise(res => setTimeout(res, 50)); 
            const canvas = await html2canvas(canvasRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('dashboard.pdf');
        } finally { setIsExporting(null); }
    };

    return (
        <>
        <style>{`
            .dashboard-canvas {
                background-color: #ffffff;
                background-image: linear-gradient(#e6f0fa 1px, transparent 1px), linear-gradient(90deg, #e6f0fa 1px, transparent 1px);
                background-size: 20px 20px; background-position: -1px -1px;
            }
            .force-chart-height > div { height: 100% !important; width: 100% !important; aspect-ratio: auto !important; margin: 0 !important; }
            .force-chart-height .js-plotly-plot { height: 100% !important; }
            .thin-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
            .thin-scroll::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
            
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .export-spinner {
                display: inline-block; width: 12px; height: 12px;
                border: 2px solid white; border-bottom-color: transparent; border-radius: 50%;
                animation: spin 0.8s linear infinite; margin-right: 6px; vertical-align: middle;
            }
            
            .settings-slider {
                -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: #e4e4e7; outline: none; margin: 8px 0;
            }
            .settings-slider::-webkit-slider-thumb {
                -webkit-appearance: none; appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #3399FF; cursor: pointer;
            }
        `}</style>

        <div 
            onMouseDown={() => setActiveSettingsMenu(null)} // <-- ЗАКРЫВАЕТ МЕНЮ ПРИ КЛИКЕ МИМО
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundColor: COLORS.white, overflow: 'hidden', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", pointerEvents: isExporting ? 'none' : 'auto' }}
        >
            
            <div style={{ flex: 6, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ height: '48px', background: COLORS.white, borderBottom: `1px solid ${COLORS.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', flexShrink: 0, zIndex: 10 }}>
                    <h2 style={{ margin: 0, color: COLORS.gray800, fontSize: '16px', fontWeight: 600 }}>Дашборд</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={exportPNG} disabled={!!isExporting} style={btnStyle}>
                            {isExporting === 'png' ? <><span className="export-spinner"></span>Сохранение...</> : 'PNG'}
                        </button>
                        <button onClick={exportPDF} disabled={!!isExporting} style={btnStyle}>
                            {isExporting === 'pdf' ? <><span className="export-spinner"></span>Сохранение...</> : 'PDF'}
                        </button>
                        <button onClick={() => navigate('/')} style={{ ...btnStyle, backgroundColor: COLORS.white, color: COLORS.dark, border: `1px solid ${COLORS.gray300}` }}>Закрыть</button>
                    </div>
                </div>

                <div ref={canvasRef} className="dashboard-canvas thin-scroll" style={{ flex: 1, overflow: 'auto', position: 'relative' }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                    {folders.map((folder: FolderData) => {
                        const folderItems = dashItems.filter(i => i.folderId === folder.id);
                        if (folderItems.length === 0) return null;

                        const bounds = groupBounds[folder.id];

                        return (
                            <Rnd
                                key={folder.id}
                                size={{ width: bounds.w, height: bounds.h }} position={{ x: bounds.x, y: bounds.y }}
                                onDragStop={(e, d) => updateGroup(folder.id, { x: d.x, y: d.y })}
                                onResizeStop={(e, dir, ref, delta, position) => { updateGroup(folder.id, { w: parseInt(ref.style.width, 10), h: parseInt(ref.style.height, 10), ...position }); }}
                                
                                onResize={(e, dir, ref) => {
                                    const newW = parseInt(ref.style.width, 10);
                                    const newH = parseInt(ref.style.height, 10);
                                    
                                    setDashItems(prev => prev.map(item => {
                                        if (item.folderId === folder.id) {
                                            let iw = item.w;
                                            let ih = item.h;
                                            if (item.x + iw > newW - 5) iw = Math.max(100, newW - item.x - 5);
                                            if (item.y + ih > newH - 29) ih = Math.max(80, newH - item.y - 29);
                                            if (iw !== item.w || ih !== item.h) return { ...item, w: iw, h: ih };
                                        }
                                        return item;
                                    }));
                                }}
                                dragGrid={[GRID_SIZE, GRID_SIZE]} resizeGrid={[GRID_SIZE, GRID_SIZE]}
                                dragHandleClassName="group-drag-handle" 
                                style={{
                                    background: '#f4f8fb', borderRadius: '8px', border: `1px solid ${COLORS.accent_ligher}`,
                                    boxShadow: `0 4px 12px rgba(51, 153, 255, 0.1)`, display: 'flex', flexDirection: 'column', position: 'absolute',
                                    zIndex: activeGroupId === folder.id ? 100 : 1 // ВЫВОДИМ ГРУППУ НА ПЕРЕДНИЙ ПЛАН
                                }}
                            >
                                <div className="group-drag-handle" style={{ padding: '2px 8px', fontSize: '14px', fontWeight: 600, color: COLORS.accent_brighter, borderBottom: `1px solid ${COLORS.gray200}`, height: '24px', boxSizing: 'border-box', cursor: 'grab', background: COLORS.white, borderRadius: '7px 7px 0 0', display: 'flex', alignItems: 'center' }}>
                                    {folder.title}
                                </div>
                                
                                <div style={{ position: 'relative', width: '100%', flex: 1 }}>
                                    {folderItems.map(item => {
                                        const settings = chartSettings[item.id] || DEFAULT_SETTINGS;
                                        
                                        return (
                                            <Rnd
                                                key={item.id} bounds="parent" size={{ width: item.w, height: item.h }} position={{ x: item.x, y: item.y }}
                                                onDragStop={(e, d) => updateItem(item.id, folder.id, { x: d.x, y: d.y })}
                                                onResizeStop={(e, dir, ref, delta, position) => { updateItem(item.id, folder.id, { w: parseInt(ref.style.width, 10), h: parseInt(ref.style.height, 10), ...position }); }}
                                                dragGrid={[GRID_SIZE, GRID_SIZE]} resizeGrid={[GRID_SIZE, GRID_SIZE]}
                                                dragHandleClassName="chart-drag-handle"
                                                style={{
                                                    border: `1px solid ${COLORS.gray300}`, borderRadius: '6px', background: COLORS.white,
                                                    boxShadow: `0 2px 6px ${COLORS.shadowLight05}`, display: 'flex', flexDirection: 'column', position: 'absolute',
                                                    zIndex: activeSettingsMenu === item.id ? 100 : 1 // ВЫВОДИМ ГРАФИК НА ПЕРЕДНИЙ ПЛАН
                                                }}
                                            >
                                                <div className="chart-drag-handle" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'grab' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 6px', background: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}`, height: '22px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.gray700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {['category_count', 'numeric_hist', 'outliers'].includes(item.chart.type) 
                                                                ? getChartInfo(item.chart).columnName 
                                                                : <>{getChartInfo(item.chart).title} <span style={{fontWeight: 400, color: COLORS.gray500}}>{getChartInfo(item.chart).columnName}</span></>
                                                            }
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                                                            
                                                            <button 
                                                                onMouseDown={(e) => e.stopPropagation()} 
                                                                onClick={() => setActiveSettingsMenu(activeSettingsMenu === item.id ? null : item.id)} 
                                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', opacity: activeSettingsMenu === item.id ? 1 : 0.6 }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <circle cx="12" cy="12" r="3"></circle>
                                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                                                </svg>
                                                            </button>
                                                            
                                                            <button 
                                                                onMouseDown={(e) => e.stopPropagation()} 
                                                                onClick={() => removeItem(item.id)} 
                                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', opacity: 0.6 }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>

                                                            {activeSettingsMenu === item.id && !isExporting && (
                                                                <div 
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    style={{ 
                                                                        position: 'absolute', top: '0', left: 'calc(100% + 8px)', background: COLORS.white, 
                                                                        border: `1px solid ${COLORS.gray200}`, borderRadius: '8px', padding: '12px', 
                                                                        boxShadow: `0 4px 16px ${COLORS.shadowDark30}`, zIndex: 9999, width: '180px', cursor: 'default'
                                                                    }}
                                                                >
                                                                    <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '8px', color: COLORS.gray700 }}>Настройки подписей</div>
                                                                    
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', marginBottom: '10px' }}>
                                                                        <input type="checkbox" checked={settings.showLabels} onChange={(e) => updateSettings(item.id, { showLabels: e.target.checked })} />
                                                                        Отображать оси
                                                                    </label>

                                                                    <div style={{ opacity: settings.showLabels ? 1 : 0.5, pointerEvents: settings.showLabels ? 'auto' : 'none' }}>
                                                                        <div style={{ fontSize: '10px', color: COLORS.gray500, display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span>Угол: {settings.angle}°</span>
                                                                        </div>
                                                                        <input 
                                                                            type="range" className="settings-slider" min="0" max="90" step="15" 
                                                                            value={settings.angle} onChange={(e) => updateSettings(item.id, { angle: parseInt(e.target.value) })}
                                                                        />

                                                                        <div style={{ fontSize: '10px', color: COLORS.gray500, display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                                                                            <span>Размер: {settings.fontSize}px</span>
                                                                        </div>
                                                                        <input 
                                                                            type="range" className="settings-slider" min="8" max="14" step="1" 
                                                                            value={settings.fontSize} onChange={(e) => updateSettings(item.id, { fontSize: parseInt(e.target.value) })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="force-chart-height" style={{ flex: 1, overflow: 'hidden' }}>
                                                        <DashboardWidgetPlot chart={item.chart} settings={settings} />
                                                    </div>
                                                </div>
                                            </Rnd>
                                        );
                                    })}
                                </div>
                            </Rnd>
                        );
                    })}
                </div>
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ С КАРТОЧКАМИ */}
            <div className="thin-scroll" style={{ flex: 1, height: '100%', overflowY: 'auto', background: COLORS.gray50, borderLeft: `1px solid ${COLORS.gray200}`, zIndex: 10 }}>
                {folders.map((folder: FolderData) => {
                    const folderCharts = charts.filter((c: ChartData) => folder.types.includes(c.type));
                    const isExpanded = expandedFolders[folder.id];

                    return (
                        <div key={folder.id} style={{ width: '100%', borderBottom: `1px solid ${COLORS.gray200}`, flexShrink: 0 }}>
                            <div onClick={() => toggleFolder(folder.id)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '14px 16px', userSelect: 'none', transition: 'background 0.2s', background: COLORS.white }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = COLORS.white}>
                                <div style={{ transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', marginRight: '12px', display: 'flex', alignItems: 'center', color: '#666' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '14px', flex: 1 }}>{folder.title}</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: folderCharts.length > 0 ? '#4a90e2' : '#aaa', background: folderCharts.length > 0 ? '#e0f0ff' : '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>{folderCharts.length}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateRows: isExpanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-in-out', background: '#fafbfc' }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', padding: folderCharts.length > 0 ? '12px' : '0', gap: '12px' }}>
                                        {folderCharts.length === 0 ? (
                                            <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '13px', padding: '15px 0', textAlign: 'center' }}>Пусто</div>
                                        ) : (
                                            [...folderCharts].reverse().map((c, i) => (
                                                <div 
                                                    key={i} draggable onDragStart={(e) => handleDragStart(e, c, folder.id)}
                                                    className="chart-preview-box" 
                                                    style={{ 
                                                        width: '100%', boxSizing: 'border-box', padding: '16px', 
                                                        cursor: 'grab', background: COLORS.white, 
                                                        border: `1px solid ${COLORS.gray200}`, borderRadius: '12px', 
                                                        boxShadow: `0 2px 4px ${COLORS.shadowLight05}` 
                                                    }}
                                                >
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', textAlign: 'left', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3', marginBottom: '12px' }}>
                                                        {getChartInfo(c).title} <br/><span style={{fontWeight: 400, color: COLORS.gray600}}>{getChartInfo(c).columnName?.split('_').join('\u200B_')}</span>
                                                    </div>
                                                    <div style={{ pointerEvents: 'none', width: '100%' }}>
                                                        <DataCharts charts={[c]} preview={true} />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        </>
    );
};

const btnStyle = { padding: '6px 14px', backgroundColor: COLORS.accent, color: COLORS.white, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', minWidth: '60px', justifyContent: 'center' };