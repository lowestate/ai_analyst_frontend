export interface ChartData {
    type: 'correlation'
        | 'column_stats'
        | 'category_count'
        | 'numeric_hist'
        | 'outliers'
        | 'cross_deps'
        | 'trend_line'
        | 'dependency'
        | 'pairplot'
        | 'feature_importances'
        | 'feature_tree'
        | 'cash_flow_chart'
        | 'pnl_report'
        | 'expense_pie_chart'
        | 'abc_analysis'
        | 'unit_economics'
        | 'revenue_forecast';
    data: any;
}

export interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    charts?: ChartData[];
    isError?: boolean;
}

export interface ChatSession {
    id: string;
    datasetName: string;
    filename: string;
}