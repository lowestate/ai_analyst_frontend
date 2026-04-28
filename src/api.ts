const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const uploadDataset = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
    return res.json();
};

export const sendChatMessage = async (chatId: string, message: string) => {
    const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message })
    });
    return res.json();
};

export const fetchSampleData = async (chatId: string) => {
    const res = await fetch(`${API_URL}/sample/${chatId}`);
    return res.json();
};