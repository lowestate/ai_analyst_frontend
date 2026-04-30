import { ChartData } from './types';

export interface ChartContext {
    threshold?: number;
}

interface ChartDef {
    chatTitle: (data: any) => string;
    plotTitle: (data: any, context?: ChartContext) => string;
}

export const CHART_REGISTRY: Record<Exclude<ChartData['type'], 'column_stats'>, ChartDef> = {
    correlation: {
        chatTitle: () => 'Корреляционная матрица',
        plotTitle: () => 'Корреляционная матрица',
    },
    category_count: {
        chatTitle: (data) => `Распределение: ${data.column_name}`,
        plotTitle: (data) => `Распределение: ${data.column_name || 'Unknown'}`,
    },
    numeric_hist: {
        chatTitle: (data) => `Распределение: ${data.column_name}`,
        plotTitle: (data) => `Распределение: ${data.column_name || 'Unknown'}`,
    },
    outliers: {
        chatTitle: (data) => `Аномалии: ${data.column_name || 'Unknown'}`,
        plotTitle: (data) => `Разброс значений: ${data.column_name || 'Unknown'}`,
    },
    cross_deps: {
        chatTitle: () => 'Кросс-зависимости',
        plotTitle: (_, context) => `Граф сильных связей (Score > ${(context?.threshold || 0.4).toFixed(2)})`,
    },
    trend_line: {
        chatTitle: (data) => `Тренд по ${data.date_col}`,
        plotTitle: (data) => `Анализ трендов (Ось X: ${data.date_col})`,
    },
    dependency: {
        chatTitle: (data) => `Зависимость: ${data.col1} от ${data.col2}`,
        plotTitle: (data) => `Зависимость: ${data.col1} от ${data.col2}`,
    },
    pairplot: {
        chatTitle: () => 'Зависимости признаков',
        plotTitle: () => 'Матрица рассеяния',
    },
    feature_importances: {
        chatTitle: (data) => `Важность признаков для: ${data.target}`,
        plotTitle: (data) => `Топ влияющих факторов на ${data.target}`,
    },
};