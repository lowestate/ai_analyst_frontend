import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { GLOBAL_STYLES } from "./globasStyles";
import { Message, ChatSession, ChartData } from "./types";

import { LeftSidebar } from "./pages/chat/LeftSidebar";
import { RightSidebar } from "./pages/chat/RightSidebar";
import { DataCharts } from "./pages/chat/Charts";
import { Header } from "./pages/Header";

import { ChatArea } from "./pages/chat/ChatArea";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { AdminPanel } from "./pages/admin_panel/AdminPanel";
import { AuthModal } from "./pages/user/LoginOrRegister";
import { UserPage } from "./pages/user/UserPage";
import { CabinetPage } from "./pages/user/CabinetPage";
import { UploadModal } from "./pages/upload_data/UploadData";
import { Homepage } from "./pages/Homepage";
import { NotFound } from "./pages/NotFound";

interface MainLayoutProps {
    currentUser: { username: string; id: number; plan_name?: string; role?: string } | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<{ username: string; id: number; plan_name?: string; role?: string } | null>>;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    banModalOpen: boolean;
    setBanModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleLogout: () => Promise<void>;
}

function MainLayout({
    currentUser,
    setCurrentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    banModalOpen,
    setBanModalOpen,
    handleLogout
}: MainLayoutProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
    const [localDataPool, setLocalDataPool] = useState<any[]>([]);
    const [dbSchema, setDbSchema] = useState<any | null>(null);
    const [chartsPayload, setChartsPayload] = useState<any[]>([]);
    const [aiRequests, setAiRequests] = useState<number[]>([]);

    // --- СТЕЙТЫ ЗАГРУЗКИ ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadTab, setUploadTab] = useState<"file" | "db">("file");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dbCreds, setDbCreds] = useState({
        host: "",
        port: "5432",
        database: "",
        user: "",
        password: "",
    });
    const [currentView, setCurrentView] = useState<"chat" | "profile">("chat");
    const location = useLocation();

    const localLogout = async () => {
        await handleLogout();
        setCurrentView("chat");
        setSessions([]);
        setActiveChat(null);
        setMessages([]);
        setDbSchema(null);
        setChartsPayload([]);
        setLocalDataPool([]);
        setSelectedChart(null);
    };

    useEffect(() => {
        if (location.state) {
            const state = location.state as any;
            if (state.view === "profile") {
                setCurrentView("profile");
            }
            if (state.activeChatId) {
                handleSelectChat(state.activeChatId);
            }
        }
    }, [location]);
    const allCharts = messages.flatMap((m) => m.charts || []);
    const uniqueCharts: ChartData[] = [];
    const seenKeys = new Set<string>();

    allCharts.forEach((chart) => {
        let key: string = chart.type;
        if (chart.type === "dependency") {
            key = `${chart.type}_${chart.data.col1}_${chart.data.col2}`;
        } else if (chart.type === "trend_line") {
            key = `${chart.type}_${chart.data.date_col}`;
        } else if (chart.data && chart.data.column_name) {
            key = `${chart.type}_${chart.data.column_name}`;
        }
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueCharts.push(chart);
        }
    });

    const [loadingPhrase, setLoadingPhrase] = useState("Проверка запроса...");

    // Trigger window resize events during the sidebar hide/show transition (0.3s)
    // This allows Plotly charts to dynamically adjust their width
    useEffect(() => {
        let isCancelled = false;
        const start = Date.now();
        const duration = 350;

        const animateResize = () => {
            if (isCancelled) return;
            window.dispatchEvent(new Event("resize"));
            if (Date.now() - start < duration) {
                requestAnimationFrame(animateResize);
            }
        };
        requestAnimationFrame(animateResize);

        return () => {
            isCancelled = true;
        };
    }, [isSidebarHidden]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedChart) {
                    setSelectedChart(null);
                } else if (isUploadModalOpen) {
                    setIsUploadModalOpen(false);
                } else if (isAuthModalOpen) {
                    setIsAuthModalOpen(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedChart, isUploadModalOpen, isAuthModalOpen]);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!currentUser) {
                setSessions([]); // Очищаем список чатов, если вышли из аккаунта
                return;
            }
            try {
                // ПЕРЕДАЕМ user_id:
                const res = await fetch(
                    `http://localhost:8001/sessions?user_id=${currentUser.id}`,
                );
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
                const res = await fetch(
                    `http://localhost:8001/users/${currentUser.id}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.is_banned) {
                        setBanModalOpen(true);
                        localLogout();
                    }
                    if (data.plan_name || data.role) {
                        setCurrentUser((prev) =>
                            prev
                                ? {
                                    ...prev,
                                    plan_name: data.plan_name?.toLowerCase(),
                                    role: data.role,
                                }
                                : null,
                        );
                    }
                }
            } catch (err) {
                console.error("Ошибка получения плана", err);
            }
        };
        fetchUserPlan();
    }, [currentUser?.id]);

    useEffect(() => {
        if (currentUser?.plan_name !== "middle") return;
        const interval = setInterval(() => {
            const now = Date.now();
            setAiRequests((prev) => prev.filter((t) => now - t < 60000));
        }, 1000);
        return () => clearInterval(interval);
    }, [currentUser?.plan_name]);

    const handleSelectChat = async (id: string) => {
        if (id === activeChat || !currentUser) return;
        setActiveChat("temp_loading");
        setMessages([]);
        setLoadingPhrase("Загрузка истории чата...");
        setLoading(true);

        try {
            const res = await fetch(
                `http://localhost:8001/chat/${id}?user_id=${currentUser.id}`,
            );
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
            const res = await fetch(
                `http://localhost:8001/chat/${chatId}?user_id=${currentUser.id}`,
                { method: "DELETE" },
            );
            if (res.ok) {
                setSessions((prev) => prev.filter((s) => s.id !== chatId));
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
        setDbCreds((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        setLoadingPhrase("Загрузка и обработка файла...");
        setLoading(true);

        try {
            const formData = new FormData();

            // ---> НОВОЕ: Передаем ID пользователя на бэкенд <---
            formData.append("user_id", currentUser.id.toString());

            let uploadFilename = "";

            if (uploadTab === "file" && selectedFile) {
                uploadFilename = selectedFile.name;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const isCSV = selectedFile.name.toLowerCase().endsWith(".csv");
                    let rawData: any[] = [];
                    if (isCSV) {
                        const text = event.target?.result as string;
                        const workbook = XLSX.read(text, { type: "string" });
                        rawData = XLSX.utils.sheet_to_json(
                            workbook.Sheets[workbook.SheetNames[0]],
                            { raw: false },
                        );
                    } else {
                        const arrayBuffer = event.target?.result as ArrayBuffer;
                        const workbook = XLSX.read(arrayBuffer, { type: "array" });
                        rawData = XLSX.utils.sheet_to_json(
                            workbook.Sheets[workbook.SheetNames[0]],
                            { raw: false },
                        );
                    }
                    setLocalDataPool(rawData);
                };
                if (selectedFile.name.toLowerCase().endsWith(".csv"))
                    reader.readAsText(selectedFile, "UTF-8");
                else reader.readAsArrayBuffer(selectedFile);

                formData.append("file", selectedFile);
            } else if (uploadTab === "db") {
                uploadFilename = `PostgreSQL: ${dbCreds.database}`;
                const payload = { type: "postgresql", credentials: dbCreds };
                const blob = new Blob([JSON.stringify(payload)], {
                    type: "application/json",
                });
                const virtualFile = new File([blob], "database_credentials.json", {
                    type: "application/json",
                });

                formData.append("file", virtualFile);
            }

            const res = await fetch("http://localhost:8001/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            const data = await res.json();

            if (data.db_schema) {
                setDbSchema(data.db_schema);
            } else {
                setDbSchema(null);
            }

            setSessions((prev) => [
                ...prev,
                {
                    id: data.chat_id,
                    datasetName: data.dataset_summary,
                    filename: uploadFilename,
                },
            ]);
            setActiveChat(data.chat_id);
            setMessages([
                {
                    id: Date.now().toString(),
                    sender: "agent",
                    text: data.preprocessing_report,
                },
            ]);
        } catch (err: any) {
            setMessages([
                {
                    id: Date.now().toString(),
                    sender: "agent",
                    text: `Ошибка загрузки: ${err.message}`,
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    const handleRefreshSchema = async () => {
        if (!activeChat || activeChat === "temp_loading") return null;
        try {
            const res = await fetch("http://localhost:8001/refresh_schema", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: activeChat }),
            });
            if (!res.ok) throw new Error("Ошибка обновления схемы");

            const newSchema = await res.json();
            setDbSchema(newSchema);
            return newSchema;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const isSubmitDisabled =
        (uploadTab === "file" && !selectedFile) ||
        (uploadTab === "db" &&
            (!dbCreds.host ||
                !dbCreds.database ||
                !dbCreds.user ||
                !dbCreds.password));

    const sendMessage = async (
        overrideText?: string,
        useAiFlag: boolean = false,
        colsToRemove: string[] = [],
        sqlAction?: "approve" | "reject",
        sqlFeedback?: string,
        sqlQuery?: string,
        isRetry: boolean = false,
    ) => {
        // ИСПРАВЛЕНИЕ: Формируем текст так, чтобы отклоненный запрос остался в истории чата
        let textToSend = overrideText || input;

        if (sqlAction === "approve") {
            textToSend = "Запрос подтвержден.";
        } else if (sqlAction === "reject") {
            // Вшиваем отклоненный SQL и тег, чтобы компонент SqlValidation смог это распарсить из истории
            textToSend = `Запрос отклонен.\n\n[STATUS: reject]\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n**Причина отклонения:** ${sqlFeedback || "Не указана"}`;
        }

        if (
            (!textToSend?.trim() && !sqlAction) ||
            !activeChat ||
            activeChat === "temp_loading"
        )
            return;

        const isDbMode = !!dbSchema;
        const aiActuallyUsed = isDbMode || useAiFlag;

        if (currentUser?.plan_name === "middle" && aiActuallyUsed) {
            // Clean up old before checking
            const now = Date.now();
            const validRequests = aiRequests.filter((t) => now - t < 60000);

            if (validRequests.length >= 5) {
                const oldest = validRequests[0] || Date.now();
                const waitSecs = Math.max(
                    0,
                    Math.ceil(60 - (Date.now() - oldest) / 1000),
                );

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        sender: "agent",
                        text: `Лимит запросов превышен, подождите ${waitSecs} секунд до обновления лимита.`,
                        isWarning: true,
                    },
                ]);
                return;
            }

            setAiRequests([...validRequests, now]);
        }

        // Если это не ретрай и не скрытый SQL-экшен, рисуем пузырь юзера
        if (!sqlAction && !isRetry) {
            const userMsg: Message = {
                id: Date.now().toString(),
                sender: "user",
                text: textToSend,
            };
            setMessages((prev) => [...prev, userMsg]);
        }

        setInput("");
        setLoadingPhrase("Проверка запроса...");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: activeChat,
                    user_id: currentUser?.id,
                    message: textToSend,
                    use_ai: useAiFlag,
                    cols_to_remove: colsToRemove,
                    sql_action: sqlAction,
                    sql_feedback: sqlFeedback,
                    sql_query: sqlQuery,
                }),
            });

            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);

            const reader = res.body?.getReader();
            if (!reader)
                throw new Error("Не удалось получить поток данных от сервера");

            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Сохраняем последний неоконченный кусок в буфере
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.type === "progress") {
                            setLoadingPhrase(parsed.message);
                        } else if (parsed.type === "final") {
                            const data = parsed.data;

                            let textToDisplay = data.reply;
                            let isSqlWaiting = data.is_waiting_for_sql;
                            let isWarning = false;

                            if (data.is_waiting_for_sql && !data.sql_query) {
                                textToDisplay =
                                    "Не удалось получить ответ модели из-за высокой нагрузки. Попробуйте чуть позже";
                                isSqlWaiting = false;
                                isWarning = true;
                            } else if (data.is_waiting_for_sql && data.sql_query) {
                                textToDisplay += `\n\n\`\`\`sql\n${data.sql_query}\n\`\`\``;
                            }

                            if (
                                textToDisplay &&
                                textToDisplay.includes(
                                    "Вы заблокированы за нарушение правил безопасности",
                                )
                            ) {
                                setBanModalOpen(true);
                                localLogout();
                            }

                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: (Date.now() + 1).toString(),
                                    sender: "agent",
                                    text: textToDisplay,
                                    charts: data.charts,
                                    isSqlWaiting: isSqlWaiting,
                                    isWarning: isWarning,
                                    retryData: isWarning
                                        ? {
                                            overrideText,
                                            useAiFlag,
                                            colsToRemove,
                                            sqlAction,
                                            sqlFeedback,
                                            sqlQuery,
                                        }
                                        : undefined,
                                },
                            ]);
                        }
                    } catch (e) {
                        console.error("Ошибка парсинга строки стрима:", e, line);
                    }
                }
            }
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    sender: "agent",
                    text: `Ошибка при обработке запроса: ${err.message}`,
                    isError: true,
                    // СОХРАНЯЕМ ПАРАМЕТРЫ ПРИ ОШИБКЕ
                    retryData: {
                        overrideText,
                        useAiFlag,
                        colsToRemove,
                        sqlAction,
                        sqlFeedback,
                        sqlQuery,
                    },
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ФУНКЦИЯ ДЛЯ КНОПКИ РЕТРАЯ
    const handleRetryMessage = (msgId: string, retryData: any) => {
        // Убираем красное сообщение с ошибкой
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        // Запускаем заново с флагом isRetry = true
        sendMessage(
            retryData.overrideText,
            retryData.useAiFlag,
            retryData.colsToRemove,
            retryData.sqlAction,
            retryData.sqlFeedback,
            retryData.sqlQuery,
            true,
        );
    };


    return (
        <>
            <div className="app-root">
                <Header
                    currentUser={currentUser}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onLogout={localLogout}
                    onOpenProfile={() => { }}
                    isChatMode={true}
                    activeChatId={activeChat}
                />
                <div
                    className={`app-layout ${isSidebarHidden ? "sidebar-hidden" : ""}`}
                >
                    <LeftSidebar
                        sessions={sessions}
                        activeChat={activeChat}
                        onSelectChat={handleSelectChat}
                        onOpenUploadModal={() => setIsUploadModalOpen(true)}
                        onDeleteChat={handleDeleteChat}
                        isSidebarHidden={isSidebarHidden}
                        onToggleSidebar={() => setIsSidebarHidden((prev) => !prev)}
                        isBanned={banModalOpen}
                    />

                    <ChatArea
                        activeChat={activeChat}
                        messages={messages}
                        loading={loading}
                        loadingPhrase={loadingPhrase}
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
                        isBanned={banModalOpen}
                    />

                    <RightSidebar
                        charts={uniqueCharts}
                        onSelectChart={setSelectedChart}
                        isDatasetLoaded={!!activeChat && activeChat !== "temp_loading"}
                        isBanned={banModalOpen}
                        activeChatId={activeChat}
                    />

                    {selectedChart && (
                        <div
                            className="modal-overlay"
                            onClick={() => setSelectedChart(null)}
                        >
                            <div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
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
                        isBanned={banModalOpen}
                    />
                </div>

                {isAuthModalOpen && (
                    <AuthModal
                        onClose={() => setIsAuthModalOpen(false)}
                        onSuccess={(user) => setCurrentUser(user)}
                    />
                )}

                {banModalOpen && (
                    <div
                        className="auth-overlay"
                        style={{
                            zIndex: 10000,
                            alignItems: "flex-start", // Выравнивание сверху
                            paddingTop: "50px", // Отступ сверху
                        }}
                    >
                        <div
                            className="auth-modal"
                            style={{
                                textAlign: "center",
                                width: "600px", // ШИРИНА ОКНА (МЕНЯТЬ ЗДЕСЬ)
                                maxWidth: "90%",
                                height: "150px", // ВЫСОТА ОКНА (МЕНЯТЬ ЗДЕСЬ)
                                minHeight: "150px", // ОБЯЗАТЕЛЬНО: сбрасываем min-height: 420px из CSS
                                padding: "30px", // Внутренние отступы
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center", // Центрируем контент по вертикали
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2
                                style={{
                                    color: "#000000ff",
                                    fontSize: "20px",
                                    marginBottom: "20px",
                                }}
                            >
                                Ваш аккаунт заблокирован. Если это ошибка, напишите на почту help@dataoffice.ru
                            </h2>
                            <button
                                onClick={() => {
                                    setBanModalOpen(false);
                                    localLogout();
                                    window.location.href = "/";
                                }}
                                className="btn-auth-submit"
                                style={{ width: "150px", padding: "10px", fontSize: "14px" }}
                            >
                                Понятно
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function App() {
    const [currentUser, setCurrentUser] = useState<{
        username: string;
        id: number;
        plan_name?: string;
        role?: string;
    } | null>(() => {
        const saved = localStorage.getItem("currentUser");
        return saved ? JSON.parse(saved) : null;
    });
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [banModalOpen, setBanModalOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("currentUser");
        }
    }, [currentUser]);

    const handleLogout = async () => {
        if (!currentUser) return;
        try {
            await fetch(`http://localhost:8001/logout?user_id=${currentUser.id}`, {
                method: "POST",
            });
        } catch (err) {
            console.error("Ошибка при выходе из системы", err);
        }
        setCurrentUser(null);
    };

    return (
        <>
            <style>{GLOBAL_STYLES}</style>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Homepage
                                currentUser={currentUser}
                                onOpenAuth={() => setIsAuthModalOpen(true)}
                                onLogout={handleLogout}
                                onOpenProfile={() => { }}
                            />
                        }
                    />
                    <Route
                        path="/analyze"
                        element={
                            <MainLayout
                                currentUser={currentUser}
                                setCurrentUser={setCurrentUser}
                                isAuthModalOpen={isAuthModalOpen}
                                setIsAuthModalOpen={setIsAuthModalOpen}
                                banModalOpen={banModalOpen}
                                setBanModalOpen={setBanModalOpen}
                                handleLogout={handleLogout}
                            />
                        }
                    />
                    <Route path="/not-exist" element={<NotFound />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route
                        path="/cabinet"
                        element={
                            <CabinetPage
                                currentUser={currentUser}
                                setCurrentUser={setCurrentUser}
                                banModalOpen={banModalOpen}
                                handleLogout={handleLogout}
                            />
                        }
                    />
                </Routes>
            </Router>
            {isAuthModalOpen && (
                <AuthModal
                    onClose={() => setIsAuthModalOpen(false)}
                    onSuccess={(user) => setCurrentUser(user)}
                />
            )}
        </>
    );
}

export default App;
