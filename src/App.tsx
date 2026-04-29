import React, { useState, useEffect } from 'react';
import { Message, ChatSession, ChartData } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { ChatArea } from './components/ChatArea';
import { RightSidebar } from './components/RightSidebar';
import { DataCharts } from './components/Charts';
import * as XLSX from 'xlsx';

const GLOBAL_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { overflow: hidden; }

    .app-layout { display: flex; height: 100vh; width: 100vw; }

    /* --- ЛЕВАЯ КОЛОНКА --- */
    .col-left { flex: 1; background: linear-gradient(to left, #e0f0ff, #ffffff); border-right: 1px solid #e0e0e0; display: flex; flex-direction: column; padding: 20px 15px; overflow-y: hidden; }
    .btn-upload { display: block; text-align: center; background: #f0f0f0; border: 1px solid #000; border-radius: 16px; padding: 12px; cursor: pointer; font-weight: 500; margin-bottom: 25px; transition: background 0.2s; }
    .btn-upload:hover { background: #ffffff; }
    .chat-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
    .chat-item { padding: 12px 15px; border-radius: 16px; cursor: pointer; border: 1px solid transparent; background: transparent; transition: all 0.2s; }
    .chat-item.active { background: #ffffff; border: 1px solid #000000; }
    .chat-item .dataset-desc { font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px; }
    .chat-item .dataset-name { font-size: 13px; font-style: italic; color: #666; }

    /* --- ЦЕНТРАЛЬНАЯ КОЛОНКА --- */
    .col-center { flex: 4; display: flex; flex-direction: column; background: linear-gradient(to right, #ffffff, #e0f0ff); position: relative; min-width: 0; }
    .messages-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: linear-gradient(to bottom, #e0f0ff, #ffffff);
        overflow-y: auto;
        padding: 20px;
        /* Добавляем это: */
        scrollbar-width: none; /* Для Firefox */
        -ms-overflow-style: none;  /* Для IE и Edge */
    }

    /* И добавляем этот блок для Chrome, Safari и Opera: */
    .messages-wrapper::-webkit-scrollbar {
        display: none;
    }

    /* Сообщения */
    .msg-row { display: flex; width: 100%; margin-bottom: 20px; }
    .msg-bubble { position: relative; border-radius: 16px; padding: 16px; word-wrap: break-word; }

    /* Агент: 2/3 ширины, слева, белый фон, без обводки, треугольник слева-снизу */
    .msg-row.agent { justify-content: flex-start; }
    .msg-bubble.agent { width: 66.66%; background: #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

    /* Агент (Ошибка) */
    .msg-bubble.agent.error { background: #ffe6e6; border: 1px solid #800000; box-shadow: none; }

    /* Пользователь: 1/3 ширины, справа, белый фон, черная обводка, треугольник справа-снизу */
    .msg-row.user { justify-content: flex-end; }
    .msg-bubble.user { width: 33.33%; background: #ffffff; border: 1px solid #000000; }

    /* Инпут */
    .input-container { padding: 15px 0; display: flex; justify-content: center; background: transparent; }
    .input-box { width: 95%; display: flex; background: #ffffff; border: 1px solid #000000; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .input-box input { flex: 1; border: none; padding: 16px 20px; outline: none; font-size: 15px; }
    .input-box input::placeholder { font-style: italic; color: #888; }
    .input-box button { background: transparent; border: none; padding: 0 20px; font-size: 20px; cursor: pointer; color: #333; }

    /* Таблица Семпла */
    .sample-container { width: 100%; background: #ffffff; border: 1px solid #ccc; border-radius: 12px; margin-bottom: 20px; transition: all 0.3s ease; z-index: 10; opacity: 1; }
    .sample-container.pinned { position: sticky; top: 0; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    .sample-container.hidden-state { opacity: 0.8; }
    .sample-controls { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; background: #fafafa; border-radius: 16px 8px 0 0; }
    .sample-btn { padding: 6px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; transition: 0.2s; }
    .sample-btn:hover { background: #eee; }
    .sample-btn.active { background: #e0e0e0; font-weight: bold; }
    .table-wrapper {
        overflow-x: auto;
        transition: max-height 0.4s ease, padding 0.4s ease;
        max-height: 400px;
        border-radius: 0 0 8px 8px; /* Убеждаемся, что углы контейнера скруглены */
        background: #ffffff;
    }

    /* --- КАСТОМНЫЙ СКРОЛЛБАР ДЛЯ ТАБЛИЦЫ --- */
    .table-wrapper::-webkit-scrollbar {
        height: 12px; /* Делаем его компактным */
    }

    .table-wrapper::-webkit-scrollbar-track {
        background: transparent;
        margin: 0 10px; /* Отступы по краям, чтобы ползунок вообще не касался углов контейнера */
    }

    .table-wrapper::-webkit-scrollbar-thumb {
        background: #cccccc;
        border-radius: 6px; /* Полностью круглый ползунок */
        border: 3px solid #ffffff; /* Имитация отступа от краев (эффект парящего скроллбара) */
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8; /* Чуть темнеет при наведении */
    }
    .table-wrapper.collapsed { max-height: 0; overflow: hidden; }
    .sample-table { width: 100%; border-collapse: collapse; background: #ffffff; }
    .sample-table th, .sample-table td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; font-size: 13px; }
    .sample-table th { background: #f5f5f5; font-weight: 600; }

    /* --- ПРАВАЯ КОЛОНКА --- */
    .col-right { flex: 1; background: linear-gradient(to right, #e0f0ff, #ffffff); border-left: 1px solid #e0e0e0; overflow-y: auto; display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 20px; min-width: 0; }
    .chart-preview-box { width: 95%; background: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; cursor: pointer; transition: transform 0.2s; display: flex; justify-content: center; align-items: center; padding: 10px; }
    .chart-preview-box:hover { transform: scale(1.02); }

    /* --- МОДАЛЬНОЕ ОКНО --- */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; animation: fadeIn 0.3s forwards; }
    .modal-content { background: #fff; padding: 20px; border-radius: 16px; max-width: 90vw; max-height: 90vh; overflow: auto; transform: scale(0.9); animation: scaleUp 0.3s forwards; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes scaleUp { to { transform: scale(1); } }

    /* Лоадер */
    .loading-text { font-style: italic; color: #666; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
`;

function App() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
    const [localDataPool, setLocalDataPool] = useState<any[]>([]);

    const allCharts = messages.flatMap(m => m.charts || []);
    const loadingPhrases = ['Анализирую...', 'Исследую...', 'Изучаю...', 'Отправляю датасет в пентагон...'];
    const [loadingIndex, setLoadingIndex] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (loading) interval = setInterval(() => setLoadingIndex(prev => (prev + 1) % loadingPhrases.length), 4000);
        else setLoadingIndex(0);
        return () => clearInterval(interval);
    }, [loading]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = async (event) => {
            const binaryStr = event.target?.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

            setLocalDataPool(rawData);
            setActiveChat("temp_loading");
            setMessages([]);
            setLoading(true);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
                const data = await res.json();

                setSessions(prev => [...prev, { id: data.chat_id, datasetName: data.dataset_summary, filename: file.name }]);
                setActiveChat(data.chat_id);
                setMessages([{ id: Date.now().toString(), sender: 'agent', text: data.preprocessing_report }]);
            } catch (err: any) {
                setMessages([{ id: Date.now().toString(), sender: 'agent', text: `Ошибка загрузки: ${err.message}`, isError: true }]);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeChat || activeChat === "temp_loading") return;
        const userMsg = { id: Date.now().toString(), sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: activeChat, message: input })
            });
            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            const data = await res.json();
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: data.reply, charts: data.charts }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: `Ошибка при обработке запроса: ${err.message}`, isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{GLOBAL_STYLES}</style>
            <div className="app-layout">
                <LeftSidebar
                    sessions={sessions}
                    activeChat={activeChat}
                    onSelectChat={setActiveChat}
                    onFileUpload={handleFileUpload}
                />

                <ChatArea
                    activeChat={activeChat}
                    messages={messages}
                    loading={loading}
                    loadingPhrase={loadingPhrases[loadingIndex]}
                    input={input}
                    setInput={setInput}
                    onSendMessage={sendMessage}
                    localDataPool={localDataPool}
                />

                <RightSidebar
                    charts={allCharts}
                    onSelectChart={setSelectedChart}
                />

                {selectedChart && (
                    <div className="modal-overlay" onClick={() => setSelectedChart(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <DataCharts charts={[selectedChart]} preview={false} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default App;