export interface ChartData {
    type: 
        'correlation'
        | 'column_stats'
        | 'category_count'
        | 'numeric_hist'
        | 'outliers'
        | 'cross_deps'
        | 'trend_line'
        | 'dependency'
        | 'pairplot'
        | 'feature_importances';
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