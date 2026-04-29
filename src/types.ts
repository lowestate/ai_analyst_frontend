export interface ChartData {
    type: 'correlation' | 'column_stats' | 'category_count' | 'numeric_hist';
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