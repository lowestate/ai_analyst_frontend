import React, { useState } from 'react';
import { ChartData } from '../types';
import { DataCharts } from './Charts';

interface RightSidebarProps {
    charts: ChartData[];
    onSelectChart: (chart: ChartData) => void;
    isDatasetLoaded: boolean;
}

const FOLDERS = [
    { id: 'relations', title: 'Связи в данных', types: ['correlation', 'cross_deps'] },
    { id: 'distributions', title: 'Распределения признаков', types: ['category_count', 'numeric_hist'] },
    { id: 'anomalies', title: 'Аномалии', types: ['outliers'] },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({ charts, onSelectChart, isDatasetLoaded }) => {
    
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        relations: true,
        distributions: true,
        anomalies: true
    });

    const toggleFolder = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getChartInfo = (chart: ChartData) => {
        if (chart.type === 'correlation') return { title: 'Корреляционная матрица', columnName: null, subtitle: null };
        if (chart.type === 'category_count') return { title: 'Распределение:', columnName: chart.data?.column_name || 'Unknown', subtitle: 'Категориальный столбец' };
        if (chart.type === 'numeric_hist') return { title: 'Распределение:', columnName: chart.data?.column_name || 'Unknown', subtitle: 'Числовой столбец' };
        if (chart.type === 'outliers') return { title: 'Аномалии:', columnName: chart.data?.column_name || 'Unknown', subtitle: 'Boxplot (Выбросы)' };
        if (chart.type === 'cross_deps') return { title: 'Кросс-зависимости', columnName: null, subtitle: 'Пузырьковая матрица' };
        return { title: 'График', columnName: null, subtitle: null };
    };

    return (
        <>
        <style>{`
            .hide-scroll::-webkit-scrollbar { display: none; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="col-right hide-scroll" style={{ padding: '20px 15px', display: 'block', overflowY: 'auto' }}>
            
            {/* ЕСЛИ ДАТАСЕТ ЗАГРУЖЕН — ПОКАЗЫВАЕМ ПАПКИ */}
            {isDatasetLoaded ? (
                FOLDERS.map(folder => {
                    const folderCharts = charts.filter(c => folder.types.includes(c.type));
                    const isExpanded = expanded[folder.id];

                    return (
                        <div key={folder.id} style={{ 
                            marginBottom: '15px', width: '100%',
                            background: '#ffffff', 
                            borderRadius: '10px', 
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            overflow: 'hidden'
                        }}>
                            {/* Заголовок папки и содержимое (твой текущий код) */}
                            <div 
                                onClick={() => toggleFolder(folder.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                                    padding: '14px 16px',
                                    userSelect: 'none', transition: 'background 0.2s',
                                    borderBottom: isExpanded ? '1px solid #f0f0f0' : '1px solid transparent'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    transition: 'transform 0.3s ease',
                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    marginRight: '12px', display: 'flex', alignItems: 'center', color: '#666'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '14px', flex: 1 }}>{folder.title}</div>
                                <div style={{ 
                                    fontSize: '12px', fontWeight: 600, color: folderCharts.length > 0 ? '#4a90e2' : '#aaa', 
                                    background: folderCharts.length > 0 ? '#e0f0ff' : '#f0f0f0', 
                                    padding: '2px 8px', borderRadius: '12px' 
                                }}>
                                    {folderCharts.length}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.3s ease-in-out',
                                background: '#fafbfc'
                            }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: folderCharts.length > 0 ? '10px 0 20px 0' : '0', gap: '20px' }}>
                                        {folderCharts.length === 0 ? (
                                            <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '13px', padding: '15px 0' }}>Пусто</div>
                                        ) : (
                                            [...folderCharts].reverse().map((c, i) => (
                                                <div key={i} className="chart-preview-box" onClick={() => onSelectChart(c)} style={{ flexDirection: 'column', width: '92%' }}>
                                                    {/* Рендер превью графика (твой текущий код) */}
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '10px', textAlign: 'left', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3' }}>
                                                        {getChartInfo(c).title} {getChartInfo(c).columnName?.split('_').join('\u200B_')}
                                                    </div>
                                                    <DataCharts charts={[c]} preview={true} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                /* ЕСЛИ ДАТАСЕТ НЕ ЗАГРУЖЕН — ПОКАЗЫВАЕМ ЗАГЛУШКУ */
                <div style={{
                    color: '#888', 
                    fontStyle: 'italic', 
                    fontSize: '14px', 
                    textAlign: 'center', 
                    marginTop: '40px',
                    lineHeight: '1.6'
                }}>
                    Здесь будут графики<br/>
                </div>
            )}

        </div>
        </>
    );
};