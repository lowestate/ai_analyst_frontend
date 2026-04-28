export interface ChartData {
    type: 'correlation' | 'column_stats';
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