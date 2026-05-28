import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataCharts } from './Charts';
import { ChartData } from '../../types';

interface RightSidebarProps {
    charts: ChartData[];
    onSelectChart: (chart: ChartData) => void;
    isDatasetLoaded: boolean;
    isBanned?: boolean;
    activeChatId?: string | null;
}

export const COLORS = {
    white: '#ffffff', black: '#000000', transparent: 'transparent',
    dark: '#343434', accent: '#3399FF', accent_brighter: '#0080ff', accent_ligher: '#5cadff',
    gray50: '#fafafa', gray100: '#f4f4f5', gray150: '#ececed', gray200: '#e4e4e7',
    gray300: '#d4d4d8', gray400: '#a1a1aa', gray500: '#71717a', gray600: '#52525b',
    gray700: '#3f3f46', gray800: '#27272a', gray900: '#18181b',
    errorBg: '#fef2f2', errorBorder: '#f87171',
    shadowLight05: 'rgba(52, 52, 52, 0.05)', shadowLight08: 'rgba(52, 52, 52, 0.08)',
    shadowMedium10: 'rgba(52, 52, 52, 0.12)', shadowDark30: 'rgba(0,0,0,0.4)', overlay50: 'rgba(0,0,0,0.6)'
};

export const FOLDERS = [
    {
        id: 'finance', title: 'Бизнес и финансы',
        types: ['cash_flow_chart', 'pnl_report', 'expense_pie_chart',
            'abc_analysis', 'unit_economics', 'revenue_forecast', 'cohort_analysis']
    },
    {
        id: 'relations', title: 'Связи в данных',
        types: ['correlation', 'dependency', 'pairplot', 'feature_importances', 'feature_tree']
    },
    {
        id: 'distributions', title: 'Распределения',
        types: ['category_count', 'numeric_hist']
    },
    {
        id: 'anomalies', title: 'Аномалии',
        types: ['outliers']
    },
    {
        id: 'trends', title: 'Тренды',
        types: ['trend_line']
    },
];

export const getChartInfo = (chart: ChartData) => {
    if (chart.type === 'correlation') return { title: 'Корреляционная матрица', columnName: null, subtitle: null };
    if (chart.type === 'category_count') return { title: 'Распределение:', columnName: chart.data?.column_name || 'Unknown', subtitle: 'Категориальный столбец' };
    if (chart.type === 'numeric_hist') return { title: 'Распределение:', columnName: chart.data?.column_name || 'Unknown', subtitle: 'Числовой столбец' };
    if (chart.type === 'outliers') return { title: 'Аномалии:', columnName: chart.data?.column_name || 'Unknown', subtitle: 'Boxplot (Выбросы)' };
    if (chart.type === 'trend_line') return { title: 'Тренды во времени:', columnName: chart.data?.date_col || 'Date', subtitle: 'Линейный график' };
    if (chart.type === 'dependency') {
        const sub = chart.data?.sub_type;
        const subtitle = sub === 'scatter' ? 'График рассеяния' : sub === 'box' ? 'Ящик с усами' : 'Матрица сопряженности';
        return {
            title: 'Зависимость:',
            columnName: `${chart.data?.col1} vs ${chart.data?.col2}`,
            subtitle
        };
    };
    if (chart.type === 'pairplot') {
        return {
            title: 'Зависимости признаков',
            subtitle: 'Pairplot'
        };
    }
    if (chart.type === 'feature_importances') {
        return {
            title: 'Важность признаков для',
            columnName: chart.data?.target || 'Unknown', // Используем target из данных бэкенда
            subtitle: 'Горизонтальный барчарт' // Исправили подпись
        };
    }
    if (chart.type === 'feature_tree') {
        return {
            title: 'Дерево признаков',
        };
    }
    if (chart.type === 'cash_flow_chart') return { title: 'Cash Flow', subtitle: 'Гистограмма динамики' };
    if (chart.type === 'pnl_report') return { title: 'P&L', subtitle: 'Каскадная диаграмма' };
    if (chart.type === 'expense_pie_chart') return { title: 'Расходы', subtitle: 'Кольцевая диаграмма' };
    if (chart.type === 'abc_analysis') return { title: 'ABC-анализ', subtitle: 'Диаграмма Парето' };
    if (chart.type === 'unit_economics') return { title: 'Юнит-экономика', subtitle: 'ARPU vs CAC' };
    if (chart.type === 'revenue_forecast') return { title: 'Прогноз', subtitle: 'Тренд выручки' };
    if (chart.type === 'cohort_analysis') return { title: 'Retention', subtitle: 'Тепловая карта когорт' };
    return { title: 'График', columnName: null, subtitle: null };
};

export const RightSidebar: React.FC<RightSidebarProps> = ({ charts, onSelectChart, isDatasetLoaded, isBanned = false, activeChatId }) => {
    const navigate = useNavigate();

    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        finance: true,
        relations: true,
        distributions: true,
        anomalies: true,
        trends: true
    });

    const toggleFolder = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Состояние для хранения ID папок, которые сейчас "мигают"
    const [highlightedFolders, setHighlightedFolders] = useState<Record<string, boolean>>({});

    // Реф для хранения предыдущего количества графиков в каждой папке
    const prevCounts = useRef<Record<string, number>>({});

    useEffect(() => {
        const newCounts: Record<string, number> = {};
        const flashes: Record<string, boolean> = {};
        let hasNewCharts = false;

        FOLDERS.forEach(folder => {
            const count = charts.filter(c => folder.types.includes(c.type)).length;
            newCounts[folder.id] = count;

            // Если папка уже была инициализирована и в ней стало больше графиков
            if (prevCounts.current[folder.id] !== undefined && count > prevCounts.current[folder.id]) {
                flashes[folder.id] = true;
                hasNewCharts = true;
            }
        });

        // Сохраняем текущее состояние для следующего сравнения
        prevCounts.current = newCounts;

        if (hasNewCharts) {
            // 1. Включаем черный бордер мгновенно
            setHighlightedFolders(flashes);

            // 2. Через короткую паузу выключаем, чтобы запустить CSS transition
            const timer = setTimeout(() => {
                setHighlightedFolders({});
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [charts]);

    const hasCharts = charts.length > 0;

    return (
        <>
            <style>{`
            .hide-scroll::-webkit-scrollbar { display: none; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            .thin-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
            .thin-scroll::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
        `}</style>

            <div
                className="col-right thin-scroll"
                style={{
                    display: "block",
                    overflowY: "auto",
                    background: COLORS.gray50,
                    borderLeft: `1px solid ${COLORS.gray200}`,
                    height: "100%",
                }}
            >
                {/* КНОПКА ДАШБОРДА */}
                {isDatasetLoaded && hasCharts && (
                    <div
                        style={{
                            padding: "0 12px 12px 12px",
                            display: "flex",
                            flexDirection: "row",
                            gap: "10px",
                            borderBottom: `1px solid ${COLORS.gray200}`,
                            background: COLORS.white,
                            boxSizing: "border-box",
                        }}
                    >
                        <button
                            disabled={isBanned}
                            className="btn-unified"
                            onClick={() => {
                                if (!isBanned)
                                    navigate("/dashboard", {
                                        state: { charts, folders: FOLDERS, activeChatId },
                                    });
                            }}
                            style={{
                                flex: 1,
                            }}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style={{ display: "inline-block", shapeRendering: "crispEdges", marginRight: "6px" }}
                            >
                                <rect x="1" y="1" width="8" height="8" />
                                <rect x="11" y="1" width="8" height="8" />
                                <rect x="1" y="11" width="8" height="8" />
                                <rect x="11" y="11" width="8" height="8" fill="var(--bg-color)" />
                                <rect x="12" y="12" width="6" height="6" />
                            </svg>
                            ДАШБОРД
                        </button>
                    </div>
                )}

                {isDatasetLoaded ? (
                    FOLDERS.map((folder) => {
                        const folderCharts = charts.filter((c) =>
                            folder.types.includes(c.type),
                        );
                        const isExpanded = expanded[folder.id];
                        const isHighlighted = highlightedFolders[folder.id];

                        return (
                            <div
                                key={folder.id}
                                style={{
                                    width: "100%",
                                    borderBottom: `1px solid ${COLORS.gray200}`,
                                    flexShrink: 0,
                                    // Динамический бордер для подсветки новых графиков
                                    border: isHighlighted
                                        ? "1px solid #000000"
                                        : `1px solid ${COLORS.transparent}`,
                                    borderBottomColor: isHighlighted
                                        ? "#000000"
                                        : COLORS.gray200,
                                    transition: isHighlighted
                                        ? "none"
                                        : "border-color 1.5s ease-out",
                                }}
                            >
                                {/* Заголовок папки */}
                                <div
                                    onClick={() => toggleFolder(folder.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        padding: "14px 12px",
                                        userSelect: "none",
                                        transition: "background 0.2s",
                                        background: COLORS.white,
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "#f8f9fa")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = COLORS.white)
                                    }
                                >
                                    <div
                                        style={{
                                            transition: "transform 0.3s ease",
                                            transform: isExpanded
                                                ? "rotate(90deg)"
                                                : "rotate(0deg)",
                                            marginRight: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                            color: "#666",
                                            marginTop: '1px'
                                        }}
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            color: "#333",
                                            fontSize: "14px",
                                            flex: 1,
                                        }}
                                    >
                                        {folder.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            color: folderCharts.length > 0 ? "#4a90e2" : "#aaa",
                                            background:
                                                folderCharts.length > 0 ? "#e0f0ff" : "#f0f0f0",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        {folderCharts.length}
                                    </div>
                                </div>

                                {/* Контент папки */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateRows: isExpanded ? "1fr" : "0fr",
                                        transition: "grid-template-rows 0.3s ease-in-out",
                                        background: "#fafbfc",
                                    }}
                                >
                                    <div style={{ overflow: "hidden" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                padding: folderCharts.length > 0 ? "12px" : "0",
                                                gap: "12px",
                                            }}
                                        >
                                            {folderCharts.length === 0 ? (
                                                <div
                                                    style={{
                                                        color: "#aaa",
                                                        fontStyle: "italic",
                                                        fontSize: "13px",
                                                        padding: "15px 0",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Пусто
                                                </div>
                                            ) : (
                                                [...folderCharts].reverse().map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="chart-preview-box"
                                                        onClick={() => {
                                                            if (!isBanned) onSelectChart(c);
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            boxSizing: "border-box",
                                                            padding: "16px",
                                                            cursor: isBanned ? "not-allowed" : "pointer",
                                                            background: COLORS.white,
                                                            border: "1px solid ${COLORS.gray200}",
                                                            borderRadius: "12px",
                                                            boxShadow: "0 2px 4px \${COLORS.shadowLight05}",
                                                            opacity: isBanned ? 0.7 : 1,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: "13px",
                                                                fontWeight: 600,
                                                                color: "#444",
                                                                textAlign: "left",
                                                                width: "100%",
                                                                whiteSpace: "normal",
                                                                wordBreak: "break-word",
                                                                lineHeight: "1.3",
                                                                marginBottom: "12px",
                                                            }}
                                                        >
                                                            {getChartInfo(c).title} <br />
                                                            <span
                                                                style={{
                                                                    fontWeight: 400,
                                                                    color: COLORS.gray600,
                                                                }}
                                                            >
                                                                {getChartInfo(c)
                                                                    .columnName?.split("_")
                                                                    .join("\u200B_")}
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                pointerEvents: "none",
                                                                width: "100%",
                                                            }}
                                                        >
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
                    })
                ) : (
                    <div
                        style={{
                            color: "#888",
                            fontStyle: "italic",
                            fontSize: "14px",
                            textAlign: "center",
                            marginTop: "40px",
                            lineHeight: "1.6",
                        }}
                    >
                        Здесь будут графики
                        <br />
                    </div>
                )}
            </div >
        </>
    );
};