import React, { useState, useEffect } from 'react';
import { Message, ChatSession, ChartData } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { ChatArea } from './components/ChatArea';
import { RightSidebar } from './components/RightSidebar';
import { DataCharts } from './components/Charts';
import * as XLSX from 'xlsx';

const COLORS = {
    // Базовые
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // Фирменные цвета Taible
    dark: '#343434',
    accent: '#3399FF',
    accent_brighter: '#0080ff',
    accent_ligher: '#5cadff',

    // Серые оттенки (современная шкала)
    gray50: '#fafafa',
    gray100: '#f4f4f5',
    gray150: '#ececed',
    gray200: '#e4e4e7',
    gray300: '#d4d4d8',
    gray400: '#a1a1aa',
    gray500: '#71717a',
    gray600: '#52525b',
    gray700: '#3f3f46',
    gray800: '#27272a',
    gray900: '#18181b',

    // Статусы
    errorBg: '#fef2f2',
    errorBorder: '#f87171',

    // Тени и наложения (RGBA)
    shadowLight05: 'rgba(52, 52, 52, 0.05)',
    shadowLight08: 'rgba(52, 52, 52, 0.08)',
    shadowMedium10: 'rgba(52, 52, 52, 0.12)',
    shadowDark30: 'rgba(0,0,0,0.4)',
    overlay50: 'rgba(0,0,0,0.6)'
};

const COLUMN_DISIVISION_PARTS = {
    left: 1,
    middle: 5,
    right: 1
}

const GLOBAL_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { overflow: hidden; background-color: ${COLORS.gray50}; color: ${COLORS.dark}; }

    .app-root { display: flex; flex-direction: column; height: 100vh; width: 100vw; }
    .app-layout { display: flex; flex: 1; overflow: hidden; }

    /* --- ХЭДЕР (ШАПКА) --- */
    .app-header {
        height: 50px;
        background: ${COLORS.white};
        border-bottom: 1px solid ${COLORS.gray200};
        display: flex;
        align-items: center;
        padding: 0 24px;
        flex-shrink: 0;
        z-index: 100;
    }
    .header-logo-container {
        display: flex;
        align-items: center;
        gap: 8px;
        user-select: none;
        margin-left: 40px;
    }

    .header-title {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.6px;
        color: ${COLORS.gray700};
        display: flex;
        align-items: center;
        line-height: 1;
        /* Убираем нижний отступ, центрируем через flex */
        margin: 0;
        transform: translateY(-2.5px); /* Финальная микро-коррекция по высоте */
    }

    .ai-highlight {
        color: ${COLORS.accent}; /* Твой новый синий */
        margin-left: 1px; /* Тот самый отступ в 1 пиксель от 't' */
        display: inline-block;
    }

    .header-logo-container svg {
        display: block; /* Убираем инлайновые отступы снизу */
        flex-shrink: 0; /* Чтобы лого не сжималось */
    }

    /* --- ЛЕВАЯ КОЛОНКА --- */
    .col-left { 
        flex: ${COLUMN_DISIVISION_PARTS.left}; 
        background: ${COLORS.gray100}; 
        border-right: 1px solid ${COLORS.gray200}; 
        display: flex; 
        flex-direction: column; 
        padding: 18px 12px; 
        overflow-y: hidden; 
    }
    .btn-upload { 
        display: block; text-align: center; background: ${COLORS.white}; 
        border: 1.5px solid ${COLORS.dark}; color: ${COLORS.dark};
        border-radius: 12px; padding: 12px; cursor: pointer; font-weight: 600; 
        font-size: 14px; margin-bottom: 24px; transition: all 0.2s ease;
        box-shadow: 0 2px 0 ${COLORS.shadowLight05};
    }
    .btn-upload:hover { background: ${COLORS.dark}; color: ${COLORS.white}; }
    .btn-upload:active { transform: translateY(2px); box-shadow: none; }
    
    .chat-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 4px; }
    .chat-list::-webkit-scrollbar { width: 6px; }
    .chat-list::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 4px; }
    
    .chat-item { 
        padding: 14px 16px; border-radius: 12px; cursor: pointer; 
        border: 1px solid transparent; background: transparent; transition: all 0.2s ease; 
    }
    .chat-item:hover { background: ${COLORS.gray100}; }
    .chat-item.active { 
        background: ${COLORS.white}; border: 1px solid ${COLORS.gray200}; 
        box-shadow: 0 2px 8px ${COLORS.shadowLight05};
    }
    .chat-item .dataset-desc { font-size: 14px; font-weight: 600; color: ${COLORS.dark}; margin-bottom: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chat-item .dataset-name { font-size: 12px; color: ${COLORS.gray500}; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* --- ЦЕНТРАЛЬНАЯ КОЛОНКА --- */
    .col-center { flex: ${COLUMN_DISIVISION_PARTS.middle}; display: flex; flex-direction: column; background: ${COLORS.white}; position: relative; min-width: 0; }
    .messages-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: ${COLORS.white};
        overflow-y: auto;
        padding: 0 40px 32px 40px; /* Убрали верхний паддинг, чтобы sticky прилипал к самому верху */
        scrollbar-width: thin; /* Тонкий скроллбар для Firefox */
        scrollbar-color: ${COLORS.gray300} transparent;
        position: relative; /* Создаем контекст для позиционирования */
    }
    .messages-wrapper::-webkit-scrollbar {
        width: 6px;
        display: block; /* Скроллбар теперь виден */
    }
    .messages-wrapper::-webkit-scrollbar-thumb {
        background-color: ${COLORS.gray200};
        border-radius: 10px;
    }

    .messages-wrapper::-webkit-scrollbar-thumb:hover {
        background-color: ${COLORS.gray300};
    }

    /* Сообщения */
    .msg-row { display: flex; width: 100%; margin-bottom: 24px; animation: slideUp 0.3s ease forwards; opacity: 0; transform: translateY(10px); }
    .msg-bubble { position: relative; border-radius: 16px; padding: 16px 20px; word-wrap: break-word; font-size: 15px; line-height: 1.5; }

    /* Агент */
    .msg-row.agent { justify-content: flex-start; }
    .msg-bubble.agent { 
        width: 73%; /* Явно задаем 70% вместо max-width */
        background: ${COLORS.white}; 
        border: 1px solid ${COLORS.gray200}; 
        color: ${COLORS.dark}; 
        box-shadow: 0 4px 12px ${COLORS.shadowLight05};
        border-bottom-left-radius: 4px;
    }

    /* Агент (Ошибка) */
    .msg-bubble.agent.error { background: ${COLORS.errorBg}; border: 1px solid ${COLORS.errorBorder}; color: ${COLORS.errorBorder}; box-shadow: none; }

    /* Пользователь */
    .msg-row.user { justify-content: flex-end; }
    .msg-bubble.user { 
        max-width: 60%; background: ${COLORS.gray100}; color: ${COLORS.dark}; 
        border: 1px solid ${COLORS.accent_brighter}; border-bottom-right-radius: 4px;
        box-shadow: 0 4px 12px ${COLORS.shadowLight08};
        font-weight: 450
    }

    /* Инпут */
    .input-container { padding: 20px 40px; display: flex; justify-content: center; background: ${COLORS.white}; border-top: 1px solid ${COLORS.gray100}; }
    .input-box { 
        height: 45px; width: 100%; display: flex; background: ${COLORS.gray50}; 
        border: 1.5px solid ${COLORS.gray200}; border-radius: 12px; overflow: hidden; 
        transition: all 0.2s ease;
    }
    .input-box:focus-within { border-color: ${COLORS.accent}; background: ${COLORS.white}; box-shadow: 0 0 0 3px rgba(51, 153, 255, 0.15); }
    .input-box input { flex: 1; border: none; padding: 0 20px; outline: none; font-size: 15px; background: transparent; color: ${COLORS.dark}; }
    .input-box input::placeholder { color: ${COLORS.gray500}; }
    .input-box button { background: ${COLORS.transparent}; border: none; padding: 0 20px; font-size: 20px; cursor: pointer; color: ${COLORS.accent}; transition: 0.2s; }
    .input-box button:hover { transform: scale(1.1); color: #2080e0; }

    /* Таблица Семпла */
    .sample-container {
        width: 100%;
        background: ${COLORS.white};
        border: 1px solid ${COLORS.gray200};
        border-radius: 12px 12px 12px 12px; /* Скругление снизу, так как сверху она прижата */
        margin-bottom: 24px;
        margin-top: 24px;
        z-index: 10;
        transition: all 0.3s ease;
    }
    .sample-container.pinned {
        position: sticky;
        top: 0;
        z-index: 50; /* Достаточно высокий, чтобы быть над сообщениями */
        box-shadow: 0 4px 12px ${COLORS.shadowLight08};
        border-top: none;
        border-radius: 0; /* Убираем скругления при залипании для красоты */
    }
    .sample-container.hidden-state { opacity: 0.8; }
    .sample-controls { display: flex; gap: 10px; height: 40px; padding: 12px 16px; border-bottom: 1px solid ${COLORS.gray200}; background: ${COLORS.gray50}; }
    .sample-btn { padding: 6px 12px; border: 1px solid ${COLORS.gray300}; background: ${COLORS.white}; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: 0.2s; color: ${COLORS.dark}; }
    .sample-btn:hover { background: ${COLORS.gray100}; }
    .sample-btn.active { background: ${COLORS.dark}; color: ${COLORS.white}; border-color: ${COLORS.dark}; }
    .table-wrapper { overflow-x: auto; transition: max-height 0.4s ease, padding 0.4s ease; max-height: 400px; background: ${COLORS.white}; }
    
    .table-wrapper {
        overflow-x: auto; /* Включает горизонтальный скролл */
        overflow-y: hidden; /* Вертикальный скролл не нужен, если ограничиваем высоту через контейнер */
        transition: max-height 0.4s ease;
        max-height: 350px; 
        background: ${COLORS.white};
        display: block; /* Гарантирует корректную работу overflow-x */
    }
    .table-wrapper::-webkit-scrollbar-track { background: ${COLORS.transparent}; margin: 0 10px; }
    .table-wrapper::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 6px; border: 2px solid ${COLORS.white}; }
    .table-wrapper::-webkit-scrollbar-thumb:hover { background: ${COLORS.gray400}; }
    .table-wrapper.collapsed { max-height: 0; overflow: hidden; }
    
    .sample-table { width: 100%; border-collapse: collapse; background: ${COLORS.white}; }
    .sample-table th, .sample-table td { 
        border-bottom: 1px solid ${COLORS.gray200}; 
        padding: 6px 12px; /* Уменьшено с 12px/16px для экономии высоты */
        text-align: left; 
        font-size: 13px;
        white-space: nowrap; /* Чтобы таблица растягивалась вширь и появлялся скролл */
    }
    .sample-table th { background: ${COLORS.gray50}; font-weight: 600; color: ${COLORS.accent_brighter}; position: sticky; top: 0; }
    .sample-table tr:hover td { background: ${COLORS.gray50}; }

    /* --- ПРАВАЯ КОЛОНКА --- */
    .col-right { 
        flex: ${COLUMN_DISIVISION_PARTS.right}; 
        background: ${COLORS.gray50}; 
        border-left: 1px solid ${COLORS.gray200}; 
        overflow-y: auto; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        padding: 24px 0; 
        gap: 20px; 
        min-width: 0; 
    }
    .col-right::-webkit-scrollbar { width: 6px; }
    .col-right::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 4px; }

    .chart-preview-box { 
        width: 85%; aspect-ratio: 4/3;
        background: ${COLORS.white}; 
        border: 1px solid ${COLORS.gray200};
        border-radius: 12px; 
        box-shadow: 0 2px 8px ${COLORS.shadowLight05}; 
        cursor: pointer; 
        transition: all 0.2s ease; 
        display: flex; 
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px; 
        color: ${COLORS.gray600};
        font-size: 13px;
        font-weight: 500;
        text-align: center;
    }
    .chart-preview-box:hover { transform: translateY(-4px); box-shadow: 0 8px 16px ${COLORS.shadowLight08}; border-color: ${COLORS.accent}; color: ${COLORS.accent}; }

    /* --- МОДАЛЬНОЕ ОКНО --- */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: ${COLORS.overlay50}; backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; animation: fadeIn 0.2s forwards; }
    .modal-content { 
        background: ${COLORS.white}; 
        padding: 30px; 
        border-radius: 20px; 
        width: 90vw; /* Увеличен до 90% ширины экрана */
        max-width: 1400px; /* Ограничитель для очень больших мониторов */
        max-height: 90vh; 
        overflow: auto; 
        transform: scale(0.95); 
        animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        box-shadow: 0 20px 40px ${COLORS.shadowDark30}; 
        position: relative; 
    }
    /* --- АНИМАЦИИ --- */
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes scaleUp { to { transform: scale(1); } }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

    /* Лоадер */
    .loading-text { font-size: 14px; font-weight: 500; color: ${COLORS.gray500}; animation: pulse 1.5s infinite ease-in-out; }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

    /* Markdown стили внутри сообщений */
    .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 14px; display: block; overflow-x: auto; max-width: 100%; border-radius: 8px; box-shadow: 0 0 0 1px ${COLORS.gray200}; }
    .markdown-body th, .markdown-body td { border-bottom: 1px solid ${COLORS.gray200}; padding: 10px 14px; }
    .markdown-body th { background-color: ${COLORS.gray50}; text-align: left; font-weight: 600; color: ${COLORS.gray700}; }
    .markdown-body tr:last-child td { border-bottom: none; }
    .markdown-body p { margin-bottom: 12px; }
    .markdown-body p:last-child { margin-bottom: 0; }
    .markdown-body h3 { margin-bottom: 12px; margin-top: 20px; font-size: 16px; color: ${COLORS.dark}; }
    .markdown-body ul { margin-left: 24px; margin-bottom: 12px; }
    .markdown-body table::-webkit-scrollbar { height: 8px; }
    .markdown-body table::-webkit-scrollbar-track { background: ${COLORS.transparent}; margin: 0 4px; }
    .markdown-body table::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 4px; }

    /* --- КАСТОМНЫЙ ПОЛЗУНОК --- */
    .custom-slider {
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        border-radius: 4px;
        outline: none;
        cursor: pointer;
    }

    /* Ползунок (шарик) для Chrome/Safari/Edge */
    .custom-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #328fec;
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }

    /* Ползунок (шарик) для Firefox */
    .custom-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #328fec;
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }

    /* --- iOS Toggle для AI --- */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 25px;
        flex-shrink: 0;
    }
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #e4e4e7;
        transition: .3s;
        border-radius: 24px;
    }
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3.5px;
        bottom: 4px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .toggle-switch input:checked + .toggle-slider {
        background-color: #328fec; /* Твой фирменный синий */
    }
    .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(16px);
    }
    .ai-toggle-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 8px;
        align-self: flex-start;
        cursor: pointer;
    }
    .ai-toggle-label {
        font-size: 14px;
        font-weight: 600;
        color: #52525b;
        user-select: none;
        margin-bottom: 3px;
    }
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

    const uniqueCharts: ChartData[] = []; // Заодно типизируем массив
    const seenKeys = new Set<string>();

    allCharts.forEach(chart => {
        // ЯВНО УКАЗЫВАЕМ TYPE STRING ЗДЕСЬ:
        let key: string = chart.type; 
        
        // Формируем уникальный идентификатор в зависимости от типа графика
        if (chart.type === 'dependency') {
            key = `${chart.type}_${chart.data.col1}_${chart.data.col2}`;
        } else if (chart.type === 'trend_line') {
            key = `${chart.type}_${chart.data.date_col}`;
        } else if (chart.data && chart.data.column_name) {
            key = `${chart.type}_${chart.data.column_name}`;
        }

        // Если графика с таким ключом еще не было — добавляем в панель
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueCharts.push(chart);
        }
    });
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

    const sendMessage = async (overrideText?: string, useAiFlag: boolean = false, useCleanData: boolean = true) => {
        const textToSend = overrideText || input;

        if (!textToSend.trim() || !activeChat || activeChat === "temp_loading") return;

        const userMsg = { id: Date.now().toString(), sender: 'user' as const, text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput(''); 
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: activeChat,
                    message: textToSend,
                    use_ai: useAiFlag,
                    use_clean_data: useCleanData
                })
            });

            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);

            const data = await res.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(), // +1 для уникальности ID, если ответ пришел мгновенно
                sender: 'agent',
                text: data.reply,
                charts: data.charts
            }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'agent',
                text: `Ошибка при обработке запроса: ${err.message}`,
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{GLOBAL_STYLES}</style>
            <div className="app-root">
                {/* ХЭДЕР С ЛОГОТИПОМ TAIBLE */}
                <header className="app-header">
                    <div className="header-logo-container">
                        {/* Логотип: синий в нем можно тоже заменить на #328fec для идеального соответствия */}
                        <svg width="34" height="26" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                            <rect x="2" y="2" width="36" height="26" rx="6" fill="#ffffff" />
                            {/* Я заменил здесь цвет на #328fec, чтобы всё было в одном тоне */}
                            <path d="M 2 15 H 20 V 2 H 8 A 6 6 0 0 0 2 8 V 15 Z" fill={COLORS.accent_ligher} />
                            <path d="M 20 15 H 38 V 8 A 6 6 0 0 0 32 2 H 20 V 15 Z" fill={COLORS.accent_ligher} />
                            <rect x="2" y="2" width="36" height="26" rx="6" stroke="#343434" strokeWidth="3" fill="none" />
                            <line x1="2" y1="15" x2="38" y2="15" stroke="#343434" strokeWidth="3"/>
                            <line x1="20" y1="2" x2="20" y2="28" stroke="#343434" strokeWidth="3"/>
                        </svg>

                        <span className="header-title">
                            t<span className="ai-highlight">ai</span>ble
                        </span>
                    </div>
                </header>

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
                        charts={uniqueCharts} /* БЫЛО: charts={allCharts} */
                        onSelectChart={setSelectedChart}
                        isDatasetLoaded={!!activeChat && activeChat !== "temp_loading"} 
                    />

                    {selectedChart && (
                        <div className="modal-overlay" onClick={() => setSelectedChart(null)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <DataCharts charts={[selectedChart]} preview={false} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;