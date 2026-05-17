import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { GLOBAL_STYLES } from './globasStyles';
import { Message, ChatSession, ChartData } from './types';

import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { DataCharts } from './components/Charts';
import { Header } from './components/Header';

import { ChatArea } from './components/chat/ChatArea';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthModal } from './components/user/LoginOrRegister';
import { UserPage } from './components/user/UserPage'
import { UploadModal } from './components/upload_data/UploadData';

function MainLayout() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
    const [localDataPool, setLocalDataPool] = useState<any[]>([]);
    const [dbSchema, setDbSchema] = useState<any | null>(null);
    const [chartsPayload, setChartsPayload] = useState<any[]>([]);
    const [aiRequests, setAiRequests] = useState<number[]>([]);

    // --- СТЕЙТЫ АВТОРИЗАЦИИ ---
    const [currentUser, setCurrentUser] = useState<{ username: string, id: number, plan_name?: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // --- СТЕЙТЫ ЗАГРУЗКИ ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadTab, setUploadTab] = useState<'file' | 'db'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dbCreds, setDbCreds] = useState({ host: '', port: '5432', database: '', user: '', password: '' });
    const [currentView, setCurrentView] = useState<'chat' | 'profile'>('chat');
    const allCharts = messages.flatMap(m => m.charts || []);
    const uniqueCharts: ChartData[] = [];
    const seenKeys = new Set<string>();

    allCharts.forEach(chart => {
        let key: string = chart.type;
        if (chart.type === 'dependency') {
            key = `${chart.type}_${chart.data.col1}_${chart.data.col2}`;
        } else if (chart.type === 'trend_line') {
            key = `${chart.type}_${chart.data.date_col}`;
        } else if (chart.data && chart.data.column_name) {
            key = `${chart.type}_${chart.data.column_name}`;
        }
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

    useEffect(() => {
        const fetchSessions = async () => {
            if (!currentUser) {
                setSessions([]); // Очищаем список чатов, если вышли из аккаунта
                return;
            }
            try {
                // ПЕРЕДАЕМ user_id:
                const res = await fetch(`http://localhost:8001/sessions?user_id=${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data);
                }
            } catch (err) {
                console.error("Ошибка загрузки истории", err);
            }
        };
        fetchSessions();

        const fetchUserPlan = async () => {
            if (!currentUser) return;
            try {
                const res = await fetch(`http://localhost:8001/users/${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.plan_name) {
                        setCurrentUser(prev => prev ? { ...prev, plan_name: data.plan_name.toLowerCase() } : null);
                    }
                }
            } catch (err) {
                console.error("Ошибка получения плана", err);
            }
        };
        fetchUserPlan();
    }, [currentUser?.id]);

    useEffect(() => {
        if (currentUser?.plan_name !== 'pro') return;
        const interval = setInterval(() => {
            const now = Date.now();
            setAiRequests(prev => prev.filter(t => now - t < 60000));
        }, 1000);
        return () => clearInterval(interval);
    }, [currentUser?.plan_name]);

    const handleSelectChat = async (id: string) => {
        if (id === activeChat || !currentUser) return;
        setActiveChat("temp_loading");
        setMessages([]);
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:8001/chat/${id}?user_id=${currentUser.id}`);
            if (!res.ok) throw new Error("Ошибка загрузки чата");
            const data = await res.json();

            setDbSchema(data.db_schema || null);
            setLocalDataPool(data.data_sample || []);

            setMessages(data.messages);
            setChartsPayload(data.charts_payload || []);
            setActiveChat(id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        if (!currentUser) return;
        try {
            const res = await fetch(`http://localhost:8001/chat/${chatId}?user_id=${currentUser.id}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== chatId));
                if (activeChat === chatId) {
                    setActiveChat(null);
                    setMessages([]);
                    setDbSchema(null);
                    setChartsPayload([]);
                }
            }
        } catch (err) {
            console.error("Ошибка при удалении чата", err);
        }
    };

    const handleDbCredsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDbCreds(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDataSubmit = async () => {
        // Проверяем, вошел ли пользователь
        if (!currentUser) {
            alert("Пожалуйста, войдите в аккаунт перед загрузкой файла.");
            setIsUploadModalOpen(false);
            setIsAuthModalOpen(true);
            return;
        }

        setIsUploadModalOpen(false);
        setActiveChat("temp_loading");
        setMessages([]);
        setLoading(true);

        try {
            const formData = new FormData();

            // ---> НОВОЕ: Передаем ID пользователя на бэкенд <---
            formData.append('user_id', currentUser.id.toString());

            let uploadFilename = "";

            if (uploadTab === 'file' && selectedFile) {
                uploadFilename = selectedFile.name;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');
                    let rawData: any[] = [];
                    if (isCSV) {
                        const text = event.target?.result as string;
                        const workbook = XLSX.read(text, { type: 'string' });
                        rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: false });
                    } else {
                        const arrayBuffer = event.target?.result as ArrayBuffer;
                        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: false });
                    }
                    setLocalDataPool(rawData);
                };
                if (selectedFile.name.toLowerCase().endsWith('.csv')) reader.readAsText(selectedFile, 'UTF-8');
                else reader.readAsArrayBuffer(selectedFile);

                formData.append('file', selectedFile);

            } else if (uploadTab === 'db') {
                uploadFilename = `PostgreSQL: ${dbCreds.database}`;
                const payload = { type: 'postgresql', credentials: dbCreds };
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                const virtualFile = new File([blob], 'database_credentials.json', { type: 'application/json' });

                formData.append('file', virtualFile);
            }

            const res = await fetch('http://localhost:8001/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            const data = await res.json();

            if (data.db_schema) {
                setDbSchema(data.db_schema);
            } else {
                setDbSchema(null);
            }

            setSessions(prev => [...prev, { id: data.chat_id, datasetName: data.dataset_summary, filename: uploadFilename }]);
            setActiveChat(data.chat_id);
            setMessages([{ id: Date.now().toString(), sender: 'agent', text: data.preprocessing_report }]);

        } catch (err: any) {
            setMessages([{ id: Date.now().toString(), sender: 'agent', text: `Ошибка загрузки: ${err.message}`, isError: true }]);
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    const handleRefreshSchema = async () => {
        if (!activeChat || activeChat === "temp_loading") return null;
        try {
            const res = await fetch('http://localhost:8001/refresh_schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: activeChat })
            });
            if (!res.ok) throw new Error('Ошибка обновления схемы');

            const newSchema = await res.json();
            setDbSchema(newSchema);
            return newSchema;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const isSubmitDisabled =
        (uploadTab === 'file' && !selectedFile) ||
        (uploadTab === 'db' && (!dbCreds.host || !dbCreds.database || !dbCreds.user || !dbCreds.password));

    const sendMessage = async (overrideText?: string, useAiFlag: boolean = false, colsToRemove: string[] = [], sqlAction?: 'approve' | 'reject', sqlFeedback?: string, sqlQuery?: string, isRetry: boolean = false) => {

        // ИСПРАВЛЕНИЕ: Формируем текст так, чтобы отклоненный запрос остался в истории чата
        let textToSend = overrideText || input;

        if (sqlAction === 'approve') {
            textToSend = "Запрос подтвержден.";
        } else if (sqlAction === 'reject') {
            // Вшиваем отклоненный SQL и тег, чтобы компонент SqlValidation смог это распарсить из истории
            textToSend = `Запрос отклонен.\n\n[STATUS: reject]\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n**Причина отклонения:** ${sqlFeedback || "Не указана"}`;
        }

        if (!textToSend?.trim() && !sqlAction || !activeChat || activeChat === "temp_loading") return;

        const isDbMode = !!dbSchema;
        const aiActuallyUsed = isDbMode || useAiFlag;

        if (currentUser?.plan_name === 'pro' && aiActuallyUsed) {
            // Clean up old before checking
            const now = Date.now();
            const validRequests = aiRequests.filter(t => now - t < 60000);

            if (validRequests.length >= 5) {
                const oldest = validRequests[0] || Date.now();
                const waitSecs = Math.max(0, Math.ceil(60 - (Date.now() - oldest) / 1000));

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'agent',
                    text: `Лимит запросов превышен, подождите ${waitSecs} секунд до обновления лимита.`,
                    isWarning: true
                }]);
                return;
            }

            setAiRequests([...validRequests, now]);
        }

        // Если это не ретрай и не скрытый SQL-экшен, рисуем пузырь юзера
        if (!sqlAction && !isRetry) {
            const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend };
            setMessages(prev => [...prev, userMsg]);
        }

        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: activeChat,
                    user_id: currentUser?.id,
                    message: textToSend,
                    use_ai: useAiFlag,
                    cols_to_remove: colsToRemove,
                    sql_action: sqlAction,
                    sql_feedback: sqlFeedback,
                    sql_query: sqlQuery
                })
            });

            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            const data = await res.json();

            let textToDisplay = data.reply;
            if (data.is_waiting_for_sql && data.sql_query) {
                textToDisplay += `\n\n\`\`\`sql\n${data.sql_query}\n\`\`\``;
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: textToDisplay,
                charts: data.charts,
                isSqlWaiting: data.is_waiting_for_sql
            }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'agent',
                text: `Ошибка при обработке запроса: ${err.message}`,
                isError: true,
                // СОХРАНЯЕМ ПАРАМЕТРЫ ПРИ ОШИБКЕ
                retryData: { overrideText, useAiFlag, colsToRemove, sqlAction, sqlFeedback, sqlQuery }
            }]);
        } finally {
            setLoading(false);
        }
    };

    // ФУНКЦИЯ ДЛЯ КНОПКИ РЕТРАЯ
    const handleRetryMessage = (msgId: string, retryData: any) => {
        // Убираем красное сообщение с ошибкой
        setMessages(prev => prev.filter(m => m.id !== msgId));
        // Запускаем заново с флагом isRetry = true
        sendMessage(
            retryData.overrideText,
            retryData.useAiFlag,
            retryData.colsToRemove,
            retryData.sqlAction,
            retryData.sqlFeedback,
            retryData.sqlQuery,
            true
        );
    };

    const handleLogout = async () => {
        if (!currentUser) return;

        try {
            // Дергаем серверный логаут (опционально, но полезно для логов/статистики)
            await fetch(`http://localhost:8001/logout?user_id=${currentUser.id}`, {
                method: 'POST'
            });
        } catch (err) {
            console.error("Ошибка при выходе из системы", err);
        }

        // Очищаем стейты
        setCurrentView('chat');
        setCurrentUser(null);
        setSessions([]);
        setActiveChat(null);
        setMessages([]);
        setDbSchema(null);
        setChartsPayload([]);
        setLocalDataPool([]);
        setSelectedChart(null);
    };

    return (
        <>
            <style>{GLOBAL_STYLES}</style>

            {isAuthModalOpen && (
                <AuthModal
                    onClose={() => setIsAuthModalOpen(false)}
                    onSuccess={(user) => setCurrentUser(user)}
                />
            )}

            <div className="app-root">
                <Header
                    currentUser={currentUser}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onLogout={handleLogout}
                    onOpenProfile={() => setCurrentView('profile')}
                />
                {currentView === 'chat' ? (
                    <div className="app-layout">
                        <LeftSidebar
                            sessions={sessions}
                            activeChat={activeChat}
                            onSelectChat={handleSelectChat}
                            onOpenUploadModal={() => setIsUploadModalOpen(true)}
                            onDeleteChat={handleDeleteChat}
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
                            dbSchema={dbSchema}
                            onRefreshSchema={handleRefreshSchema}
                            initialCharts={chartsPayload}
                            onRetry={handleRetryMessage}
                            currentUser={currentUser}
                            aiRequests={aiRequests}
                        />

                        <RightSidebar
                            charts={uniqueCharts}
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

                        <UploadModal
                            isOpen={isUploadModalOpen}
                            onClose={() => setIsUploadModalOpen(false)}
                            uploadTab={uploadTab}
                            setUploadTab={setUploadTab}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            dbCreds={dbCreds}
                            onDbCredsChange={handleDbCredsChange}
                            onSubmit={handleDataSubmit}
                            isSubmitDisabled={isSubmitDisabled}
                            currentUser={currentUser}
                        />
                    </div>
                ) : (
                    <UserPage
                        currentUser={currentUser!}
                        onBack={() => setCurrentView('chat')}
                        onPlanChange={(newPlan) => setCurrentUser(prev => prev ? { ...prev, plan_name: newPlan } : null)}
                    />
                )}
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;