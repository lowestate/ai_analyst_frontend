import React from 'react';
import { ChartData } from '../types';
import { DataCharts } from './Charts';

interface RightSidebarProps {
    charts: ChartData[];
    onSelectChart: (chart: ChartData) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ charts, onSelectChart }) => {
    
    const getChartInfo = (chart: ChartData) => {
        if (chart.type === 'correlation') {
            return { title: 'Корреляционная матрица', columnName: null, subtitle: null };
        }
        if (chart.type === 'category_count') {
            return { 
                title: 'Распределение:', 
                columnName: chart.data?.column_name || 'Unknown', 
                subtitle: 'Категориальный столбец' 
            };
        }
        if (chart.type === 'numeric_hist') {
            return { 
                title: 'Распределение:', 
                columnName: chart.data?.column_name || 'Unknown', 
                subtitle: 'Числовой столбец' 
            };
        }
        return { title: 'График', columnName: null, subtitle: null };
    };

    return (
        <div className="col-right">
            {charts.map((c, i) => {
                const info = getChartInfo(c);

                // МАГИЯ ЗДЕСЬ: Вставляем невидимый пробел (\u200B) перед каждым подчеркиванием.
                // Это позволяет браузеру переносить строку, оставляя "_" в начале новой строки.
                const formattedColumnName = info.columnName 
                    ? info.columnName.split('_').join('\u200B_')
                    : '';

                return (
                    <div 
                        key={i} 
                        className="chart-preview-box" 
                        onClick={() => onSelectChart(c)}
                        style={{ flexDirection: 'column' }} 
                    >
                        {/* Обновленный заголовок */}
                        <div style={{ 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            color: '#444', 
                            marginBottom: info.subtitle ? '2px' : '10px', 
                            textAlign: 'left', 
                            width: '100%',
                            // Убрали nowrap и ellipsis, разрешили перенос
                            whiteSpace: 'normal',   
                            wordBreak: 'break-word', 
                            lineHeight: '1.3'
                        }}>
                            {info.title} {formattedColumnName}
                        </div>
                        
                        {/* Подзаголовок */}
                        {info.subtitle && (
                            <div style={{ 
                                fontSize: '11px', 
                                fontStyle: 'italic', 
                                color: '#888', 
                                marginBottom: '8px', 
                                textAlign: 'left', 
                                width: '100%' 
                            }}>
                                {info.subtitle}
                            </div>
                        )}
                        
                        <DataCharts charts={[c]} preview={true} />
                    </div>
                );
            })}
            
            {charts.length === 0 && (
                <div style={{color: '#888', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', marginTop: '40px'}}>
                    Здесь появятся графики<br/>после анализа
                </div>
            )}
        </div>
    );
};