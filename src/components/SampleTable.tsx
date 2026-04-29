import React, { useState, useEffect } from 'react';

export const SampleTable: React.FC<{ dataPool: any[] }> = ({ dataPool }) => {
    const [sample, setSample] = useState<any[]>([]);
    const [isPinned, setIsPinned] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const refreshSample = () => {
        if (!dataPool || dataPool.length === 0) return;
        const shuffled = [...dataPool].sort(() => 0.5 - Math.random());
        setSample(shuffled.slice(0, Math.min(5, dataPool.length)));
    };

    useEffect(() => {
        refreshSample();
    }, [dataPool]);

    // --- ФУНКЦИЯ ДЛЯ КРАСИВОГО ОТОБРАЖЕНИЯ ДАННЫХ ---
    const formatCellValue = (header: string, val: any) => {
        if (val == null) return '';
        
        // Проверяем, похоже ли название столбца на дату
        const isDateColumn = ['date', 'time', 'дата', 'день', 'месяц', 'год', 'period'].some(kw => 
            header.toLowerCase().includes(kw)
        );

        // Если это число в диапазоне Excel-дат
        if (isDateColumn && typeof val === 'number' && val > 10000 && val < 100000) {
            // Магия перевода из Excel Serial Date в JS Date
            const ms = Math.round((val - 25569) * 86400 * 1000);
            const d = new Date(ms);
            
            // Жестко отсекаем время, оставляя только формат YYYY-MM-DD 
            // Это вернет дату ровно в том виде, в котором она была в изначальном файле
            return d.toISOString().substring(0, 10);
        }

        // Заодно округляем бесконечные дроби (например, 0.3333333333)
        if (typeof val === 'number' && !Number.isInteger(val)) {
            return Number(val.toFixed(4));
        }

        return String(val);
    };

    if (sample.length === 0) return null;
    const headers = Object.keys(sample[0]);

    return (
        <div className={`sample-container ${isPinned ? 'pinned' : ''} ${isHidden ? 'hidden-state' : ''}`}>
            <div className="sample-controls">
                {/* Иконка: Закрепить / Открепить (Булавка) */}
                <button 
                    onClick={() => setIsPinned(!isPinned)} 
                    className={`sample-btn ${isPinned ? 'active' : ''}`}
                    title={isPinned ? 'Открепить' : 'Закрепить датасет'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="17" x2="12" y2="22"></line>
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.24V6a3 3 0 0 0-3-3h-0a3 3 0 0 0-3 3v5.24a2 2 0 0 1-1.11 1.31l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                    </svg>
                </button>

                {/* Иконка: Скрыть / Показать (Слеш / Минус) */}
                <button 
                    onClick={() => setIsHidden(!isHidden)} 
                    className="sample-btn"
                    title={isHidden ? 'Показать датасет' : 'Скрыть датасет'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {isHidden ? (
                        // Слеш (когда скрыто)
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="20" x2="20" y2="4"></line>
                        </svg>
                    ) : (
                        // Минус (когда раскрыто)
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    )}
                </button>

                {/* Третья кнопка "Другой семпл" остается без изменений */}
                {!isHidden && (
                    <button onClick={refreshSample} className="sample-btn">
                        Другой семпл
                    </button>
                )}
            </div>

            <div className={`table-wrapper ${isHidden ? 'collapsed' : ''}`}>
                <table className="sample-table">
                    <thead>
                        <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {sample.map((row, i) => (
                            // ПРИМЕНЯЕМ ФОРМАТТЕР К ЗНАЧЕНИЯМ ЯЧЕЕК
                            <tr key={i}>{headers.map(h => <td key={h}>{formatCellValue(h, row[h])}</td>)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};