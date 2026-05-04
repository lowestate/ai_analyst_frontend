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
    feature_tree: {
        chatTitle: () => `Дендрограмма признаков`,
        plotTitle: () => `Дендрограмма признаков (иерархическая кластеризация)`,
    },
    cash_flow_chart: {
        chatTitle: () => 'Движение денежных средств',
        plotTitle: () => 'Движение денежных средств (Cash Flow)',
    },
    pnl_report: {
        chatTitle: () => 'Отчет о прибылях и убытках',
        plotTitle: () => 'Прибыли и убытки (P&L)',
    },
    expense_pie_chart: {
        chatTitle: () => 'Структура расходов',
        plotTitle: () => 'Структура расходов по категориям',
    },
    abc_analysis: {
        chatTitle: () => 'ABC-анализ (Парето)',
        plotTitle: () => 'ABC-анализ (Кумулятивная выручка)',
    },
    unit_economics: {
        chatTitle: () => 'Юнит-экономика',
        plotTitle: () => 'ARPU vs CAC по источникам',
    },
    revenue_forecast: {
        chatTitle: () => 'Прогноз выручки',
        plotTitle: () => 'Исторический тренд и Прогноз',
    },
};