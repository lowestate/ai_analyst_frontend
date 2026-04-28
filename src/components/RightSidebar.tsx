import React from 'react';
import { ChartData } from '../types';
import { DataCharts } from './Charts';

interface RightSidebarProps {
    charts: ChartData[];
    onSelectChart: (chart: ChartData) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ charts, onSelectChart }) => {
    
    // Функция для программного определения названия графика
    const getChartTitle = (chart: ChartData) => {
        if (chart.type === 'correlation') {
            return 'Корреляционная матрица';
        }
        if (chart.type === 'column_stats') {
            const catCols = Object.keys(chart.data?.categorical || {});
            if (catCols.length > 0) {
                return `Распределение: ${catCols[0]}`;
            }
            return 'Статистика';
        }
        return 'График';
    };

    return (
        <div className="col-right">
            {charts.map((c, i) => (
                <div 
                    key={i} 
                    className="chart-preview-box" 
                    onClick={() => onSelectChart(c)}
                    // Переопределяем выравнивание, чтобы заголовок был сверху
                    style={{ flexDirection: 'column' }} 
                >
                    {/* Сам заголовок */}
                    <div style={{ 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: '#444', 
                        marginBottom: '5px', 
                        textAlign: 'left', 
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis' // Чтобы слишком длинные названия не ломали верстку
                    }}>
                        {getChartTitle(c)}
                    </div>
                    
                    <DataCharts charts={[c]} preview={true} />
                </div>
            ))}
            {charts.length === 0 && (
                <div style={{color: '#888', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', marginTop: '40px'}}>
                    Здесь появятся графики<br/>после анализа
                </div>
            )}
        </div>
    );
};