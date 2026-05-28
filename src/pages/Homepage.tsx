import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { samAvatar, bobAvatar, margaretAvatar } from "../assets/avatars";
import { StatCard } from "../components/StatCard";
import { SpecialistCard } from "../components/SpecialistCard";
import { Header } from "./Header";

interface HomepageProps {
    currentUser: { username: string; id: number; role?: string } | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenProfile: () => void;
}

export function Homepage({ currentUser, onOpenAuth, onLogout, onOpenProfile }: HomepageProps) {
    const navigate = useNavigate();
    const [tickerOffset, setTickerOffset] = useState(0);
    const [coolerState, setCoolerState] = useState<
        "empty" | "pouring" | "full"
    >("empty");
    const [activeChartTab, setActiveChartTab] = useState<"streams" | "queries">(
        "streams",
    );
    const [pulseDot, setPulseDot] = useState(true);

    // Auto-scroll ticker simulation for secondary backup
    useEffect(() => {
        const interval = setInterval(() => {
            setTickerOffset((prev) => (prev - 1) % 1000);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // Pulse effect simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseDot((prev) => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Force body and html overflow to auto when Homepage mounts and restore it on unmount
    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.setProperty("overflow", "auto", "important");
        document.documentElement.style.setProperty(
            "overflow",
            "auto",
            "important",
        );

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, []);

    const handleCoolerClick = () => {
        if (coolerState !== "empty") return;
        setCoolerState("pouring");
        setTimeout(() => {
            setCoolerState("full");
        }, 1500);
    };

    const resetCooler = () => {
        if (coolerState === "full") {
            setCoolerState("empty");
        }
    };

    // Static stats dataset for the line chart (streams) - compressed Y axis to fit container safely
    const linePoints =
        "M 10 65 C 40 65, 40 35, 70 35 C 100 35, 100 75, 130 75 C 160 75, 160 25, 190 25 C 220 25, 220 70, 250 70 C 280 70, 280 30, 310 30 C 340 30, 340 50, 370 50 L 370 95 L 10 95 Z";
    const linePath =
        "M 10 65 C 40 65, 40 35, 70 35 C 100 35, 100 75, 130 75 C 160 75, 160 25, 190 25 C 220 25, 220 70, 250 70 C 280 70, 280 30, 310 30 C 340 30, 340 50, 370 50";

    return (
        <div className="homepage-root">
            {/* HEADER SECTION */}
            <Header
                currentUser={currentUser}
                onOpenAuth={onOpenAuth}
                onLogout={onLogout}
                onOpenProfile={() => navigate("/analyze", { state: { view: "profile" } })}
                isChatMode={false}
            />

            {/* LIVE TICKER */}
            <div
                style={{
                    borderTop: "1px solid var(--border-color)",
                    backgroundColor: "rgba(241, 243, 245, 0.4)",
                    overflow: "hidden",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <div
                    className="animate-ticker font-mono"
                    style={{
                        fontSize: "11px",
                        color: "var(--muted-fg)",
                        whiteSpace: "nowrap",
                        display: "flex",
                        gap: "32px",
                        paddingLeft: "16px",
                    }}
                >
                    <div style={{ display: "flex", gap: "32px" }}>
                        <span>◈ DATAOFFICE LIVE</span>
                        <span>QUERIES TODAY: 14,287 ▲ 3.2%</span>
                        <span>MARGARET ONLINE</span>
                        <span>BOB · ANALYZING Q3</span>
                        <span>SAM · TRAINING MODEL #41</span>
                        <span>UPTIME 99.98%</span>
                    </div>
                    <div style={{ display: "flex", gap: "32px" }}>
                        <span>◈ DATAOFFICE LIVE</span>
                        <span>QUERIES TODAY: 14,287 ▲ 3.2%</span>
                        <span>MARGARET ONLINE</span>
                        <span>BOB · ANALYZING Q3</span>
                        <span>SAM · TRAINING MODEL #41</span>
                        <span>UPTIME 99.98%</span>
                    </div>
                </div>
            </div>

            {/* HERO SECTION */}
            <section
                style={{
                    position: "relative",
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "48px 24px 80px 24px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(12, 1fr)",
                        gap: "32px",
                        alignItems: "start",
                    }}
                >
                    {/* Main Info */}
                    <div style={{ gridColumn: "span 7" }}>
                        <div
                            className="label-tag"
                            style={{ marginBottom: "24px" }}
                        >
                            <span
                                className="animate-pulse"
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--primary-color)",
                                    display: "inline-block",
                                }}
                            ></span>
                            DEPARTMENT OF DATA · EST. 2026
                        </div>

                        <h1
                            style={{
                                fontSize: "72px",
                                fontWeight: 800,
                                color: "var(--fg-color)",
                                lineHeight: 1.05,
                                letterSpacing: "-0.03em",
                                margin: 0,
                            }}
                        >
                            Ваш офис для
                            <br />
                            работы с данными
                            <span
                                style={{
                                    position: "relative",
                                    display: "inline-block",
                                    fontSize: "72px",
                                    fontWeight: 800,
                                    color: "var(--fg-color)",
                                    lineHeight: "1.05",
                                }}
                            >
                                <svg
                                    style={{
                                        position: "absolute",
                                        bottom: "-16px",
                                        left: 0,
                                        width: "100%",
                                        height: "16px",
                                    }}
                                    viewBox="0 0 400 12"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M2,8 Q100,2 200,7 T398,5"
                                        stroke="var(--accent-color)"
                                        strokeWidth="3"
                                        fill="none"
                                        className="animate-draw"
                                    ></path>
                                </svg>
                            </span>
                        </h1>

                        <p
                            style={{
                                marginTop: "28px",
                                fontSize: "18px",
                                lineHeight: 1.6,
                                color: "var(--muted-fg)",
                                maxWidth: "512px",
                            }}
                        >
                            Три модуля. Три специалиста. Один тихий офис, где
                            данные превращаются в решения — без бумажной
                            волокиты и лишних таблиц.
                        </p>

                        <div
                            style={{
                                marginTop: "32px",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "12px",
                            }}
                        >
                            <a
                                href="#team"
                                style={{
                                    backgroundColor: "var(--primary-color)",
                                    color: "var(--primary-fg)",
                                    padding: "12px 24px",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                    transition: "background-color 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontFamily: "var(--font-mono)"
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                Сотрудники
                            </a>
                            <a
                                href="#modules"
                                style={{
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--card-bg)",
                                    color: "var(--fg-color)",
                                    padding: "12px 24px",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                    transition: "background-color 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontFamily: "var(--font-mono)"
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                    <polyline points="2 17 12 22 22 17"></polyline>
                                    <polyline points="2 12 12 17 22 12"></polyline>
                                </svg>
                                Возможности
                            </a>
                        </div>

                        {/* STATISTIC CARDS */}
                        <div
                            style={{
                                marginTop: "48px",
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "16px",
                                width: "100%",
                                maxWidth: "640px",
                            }}
                        >
                            <StatCard value="1.4M" label="ЗАПРОСОВ / МЕС" />
                            <StatCard value="98.7%" label="ТОЧНОСТЬ МОДЕЛЕЙ" />
                            <StatCard value="<2s" label="СРЕДНИЙ ОТВЕТ" />
                        </div>
                    </div>

                    {/* Right Side Dashboard Preview & Water Cooler */}
                    <div
                        style={{
                            gridColumn: "span 5",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "32px",
                        }}
                    >
                        {/* Dashboard Card Mockup from screenshot */}
                        <div
                            className="animate-float"
                            style={{
                                width: "115%",
                                background: "#f8fafd",
                                border: "1px solid var(--border-color)",
                                borderRadius: "16px",
                                padding: "18px",
                                marginTop: "50px",
                                marginLeft: "70px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                                boxSizing: "border-box",
                                boxShadow: "0 10px 30px rgba(51, 153, 255, 0.08)",
                                position: "relative",
                            }}
                        >
                            {/* Card Header (three dots + dashboard.dataoffice) */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "2px 4px 4px 4px",
                                    boxSizing: "border-box",
                                }}
                            >
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff605c" }}></span>
                                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#40a0ff" }}></span>
                                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#6a8dcd" }}></span>
                                </div>
                                <span
                                    className="font-mono"
                                    style={{
                                        fontSize: "12px",
                                        color: "#718096",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    dashboard.dataoffice
                                </span>
                            </div>

                            {/* Main Q3 Revenue Panel */}
                            <div
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                    boxSizing: "border-box",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#718096",
                                        }}
                                    >
                                        Q3 REVENUE
                                    </span>
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#1a68bf",
                                        }}
                                    >
                                        +24.8%
                                    </span>
                                </div>

                                {/* Line Chart SVG */}
                                <div
                                    style={{
                                        height: "140px",
                                        position: "relative",
                                        overflow: "hidden",
                                        width: "100%",
                                    }}
                                >
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 500 140"
                                        preserveAspectRatio="none"
                                        style={{ display: "block" }}
                                    >
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#1a68bf" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#1a68bf" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid lines */}
                                        <line x1="0" y1="35" x2="500" y2="35" stroke="#edf2f7" strokeDasharray="4 4" strokeWidth="1.5" />
                                        <line x1="0" y1="70" x2="500" y2="70" stroke="#edf2f7" strokeDasharray="4 4" strokeWidth="1.5" />
                                        <line x1="0" y1="105" x2="500" y2="105" stroke="#edf2f7" strokeDasharray="4 4" strokeWidth="1.5" />

                                        {/* Gradient area */}
                                        <path
                                            d="M 20 140 L 20 110 L 80 90 L 140 100 L 200 75 L 260 85 L 320 60 L 380 68 L 440 38 L 480 20 L 480 140 Z"
                                            fill="url(#chartGradient)"
                                        />

                                        {/* Line path */}
                                        <path
                                            d="M 20 110 L 80 90 L 140 100 L 200 75 L 260 85 L 320 60 L 380 68 L 440 38 L 480 20"
                                            fill="none"
                                            stroke="#1a68bf"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Dots */}
                                        <circle cx="20" cy="110" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="80" cy="90" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="140" cy="100" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="200" cy="75" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="260" cy="85" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="320" cy="60" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="380" cy="68" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="440" cy="38" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                        <circle cx="480" cy="20" r="4" fill="#ffffff" stroke="#1a68bf" strokeWidth="2.5" />
                                    </svg>
                                </div>
                            </div>

                            {/* Bottom row grid (SEGMENTS & MODEL ACC.) */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "16px",
                                    boxSizing: "border-box",
                                }}
                            >
                                {/* SEGMENTS Panel */}
                                <div
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: "#718096",
                                        }}
                                    >
                                        SEGMENTS
                                    </span>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-end",
                                            justifyContent: "space-between",
                                            height: "70px",
                                            padding: "0 4px",
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        {/* Heights: 30%, 55%, 35%, 65%, 50%, 85%, 70% */}
                                        <div style={{ width: "10%", height: "30%", background: "#1d5ea8" }}></div>
                                        <div style={{ width: "10%", height: "55%", background: "#3399FF" }}></div>
                                        <div style={{ width: "10%", height: "35%", background: "#1d5ea8" }}></div>
                                        <div style={{ width: "10%", height: "65%", background: "#3399FF" }}></div>
                                        <div style={{ width: "10%", height: "50%", background: "#1d5ea8" }}></div>
                                        <div style={{ width: "10%", height: "85%", background: "#3399FF" }}></div>
                                        <div style={{ width: "10%", height: "70%", background: "#1d5ea8" }}></div>
                                    </div>
                                </div>

                                {/* MODEL ACC. Panel */}
                                <div
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: "#718096",
                                        }}
                                    >
                                        MODEL ACC.
                                    </span>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            flexGrow: 1,
                                            gap: "2px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: "var(--font-display), sans-serif",
                                                fontWeight: 800,
                                                fontSize: "32px",
                                                color: "#101827",
                                                lineHeight: 1,
                                                transform: 'scale(1.7)',
                                                marginLeft: '57px'
                                            }}
                                        >
                                            0.987
                                        </span>
                                        <span
                                            className="font-mono"
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: "#1a68bf",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                marginTop: "4px",
                                            }}
                                        >
                                            ▲ 0.012
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Absolute Positioned Sticker (Заметка от Боба) popping out right and bottom */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "-35px",
                                    right: "-30px",
                                    width: "190px",
                                    background: "#fff4b8",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                    boxShadow: "5px 10px 20px rgba(0, 0, 0, 0.15)",
                                    padding: "14px",
                                    transform: "rotate(-2.5deg)",
                                    zIndex: 10,
                                    boxSizing: "border-box",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    className="font-mono"
                                    style={{
                                        fontSize: "10px",
                                        color: "#7f8c8d",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    Заметка от Боба:
                                </div>
                                <div
                                    style={{
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#2c3e50",
                                        lineHeight: 1.35,
                                        marginTop: "6px",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    «Цифры за Q3 выглядят отлично — нужно повторить»
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* TEAM ROOM DIRECTORY SECTION */}
            < section id="team">
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "0 24px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            marginBottom: "48px",
                        }}
                    >
                        <div style={{ textAlign: "left", maxWidth: "700px" }}>
                            <div
                                className="label-tag"
                                style={{ marginBottom: "16px" }}
                            >
                                DEPARTMENT DIRECTORY · 03 STAFF
                            </div>
                            <h2
                                style={{
                                    fontSize: "42px",
                                    fontWeight: "bold",
                                    margin: "0 0 16px 0",
                                    color: "var(--fg-color)",
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                Знакомьтесь, команда
                            </h2>
                            <p
                                style={{
                                    fontSize: "16px",
                                    color: "var(--muted-fg)",
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}
                            >
                                Три модуля — три специалиста. Каждый отвечает за свой кабинет и свой тип задач.
                            </p>
                        </div>
                        <div
                            style={{
                                border: "1px solid var(--border-color)",
                                padding: "12px 18px",
                                borderRadius: "6px",
                                backgroundColor: "var(--card-bg)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "4px",
                                boxShadow: "var(--shadow-paper)",
                                minWidth: "160px",
                                marginBottom: "4px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "9px",
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--muted-fg)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                OFFICE FLOOR - 03
                            </span>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: "bold",
                                    color: "var(--fg-color)",
                                    textTransform: "uppercase",
                                }}
                            >
                                ROOMS 301–303
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "24px",
                        }}
                    >
                        <SpecialistCard
                            moduleNum="01"
                            moduleTitle="INTELLIGENT SEARCH"
                            avatar={margaretAvatar}
                            avatarName="МАРГАРЕТ"
                            employeeName="Маргарет"
                            employeeRole="АРХИВАРИУС ДАННЫХ"
                            description="Маргарет — старший библиотекарь офиса. Сорок лет среди отчётов и каталогов: задайте вопрос словами — она найдёт нужные данные."
                            bullets={[
                                "Семантический поиск по всем хранилищам через LLM",
                                "Понимает запросы на естественном языке",
                                "Связывает таблицы и источники без SQL"
                            ]}
                            employeeId="EMP_ID #1024"
                            roomNum="КАБИНЕТ 101"
                            onClick={() => navigate("/not-exist?user=margaret")}
                        />

                        <SpecialistCard
                            moduleNum="02"
                            moduleTitle="ANALYTICS AGENT"
                            avatar={bobAvatar}
                            avatarName="БОБ"
                            employeeName="Боб"
                            employeeRole="АНАЛИТИК ДАННЫХ"
                            description="Боб всегда в пиджаке и всегда с цифрами. Строит финансовые модели, считает unit-экономику и объясняет «почему» за каждым графиком."
                            bullets={[
                                "Автоматический анализ P&L, когорт и воронок",
                                "Финансовое моделирование и сценарии",
                                "Объясняющие отчёты с обоснованиями"
                            ]}
                            employeeId="EMP_ID #1025"
                            isActive={true}
                            roomNum="КАБИНЕТ 301"
                            onClick={() => navigate("/analyze")}
                        />

                        <SpecialistCard
                            moduleNum="03"
                            moduleTitle="AUTOML"
                            avatar={samAvatar}
                            avatarName="СЭМ"
                            employeeName="Сэм"
                            employeeRole="ML - ИНЖЕНЕР"
                            description="Сэм сидит в углу в клетчатой рубашке и тренирует модели. Загрузите датасет — он подберёт алгоритм, обучит и задеплоит за вас."
                            bullets={[
                                "Автоматический подбор моделей и фичей",
                                "Кросс-валидация и метрики из коробки",
                                "Готовый API для предсказаний в один клик"
                            ]}
                            employeeId="EMP_ID #1026"
                            roomNum="КАБИНЕТ 202"
                            onClick={() => navigate("/not-exist?user=sam")}
                        />
                    </div>
                </div>
            </section >

            {/* PROCESS WORKFLOW MODULES SECTION */}
            < section
                id="modules"
                style={{
                    padding: "60px 0",
                    borderBottom: "1px solid var(--border-color)",
                }}
            >
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "0 24px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 1fr)",
                            gap: "32px",
                            alignItems: "center",
                            marginBottom: "56px",
                        }}
                    >
                        <div style={{ gridColumn: "span 6" }}>
                            <div
                                className="label-tag"
                                style={{ marginBottom: "16px" }}
                            >
                                PROCESS · 04 STEPS
                            </div>
                            <h2
                                style={{
                                    fontSize: "36px",
                                    fontWeight: 800,
                                    margin: 0,
                                    color: "var(--fg-color)",
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                ЧЕТЫРЕ МОДУЛЯ — ОТ ЗАПРОСА ДО РЕШЕНИЯ
                            </h2>
                        </div>
                        <div style={{ gridColumn: "span 6" }}>
                            <p
                                style={{
                                    fontSize: "16px",
                                    color: "var(--muted-fg)",
                                    margin: 0,
                                    lineHeight: 1.6,
                                }}
                            >
                                Наш рабочий процесс полностью автоматизирован.
                                Вы взаимодействуете с модулями на человеческом
                                языке, система самостоятельно выполняет
                                развертывание расчетов и обучение моделей.
                            </p>
                        </div>
                    </div>

                    <div
                        id="workflow"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "24px",
                        }}
                    >
                        {/* Step 1 */}
                        <div
                            className="paper-card"
                            style={{ padding: "24px", borderRadius: "0px" }}
                        >
                            <div
                                className="font-pixel"
                                style={{
                                    fontSize: "24px",
                                    color: "var(--accent-color)",
                                    marginBottom: "16px",
                                }}
                            >
                                01
                            </div>
                            <h4
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    margin: "0 0 10px 0",
                                    color: "var(--fg-color)",
                                }}
                            >
                                Запрос
                            </h4>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "var(--muted-fg)",
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}
                            >
                                Вы формулируете вопросы к базе данных на обычном
                                человеческом языке — без знания SQL.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div
                            className="paper-card"
                            style={{ padding: "24px", borderRadius: "0px" }}
                        >
                            <div
                                className="font-pixel"
                                style={{
                                    fontSize: "24px",
                                    color: "var(--accent-color)",
                                    marginBottom: "16px",
                                }}
                            >
                                02
                            </div>
                            <h4
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    margin: "0 0 10px 0",
                                    color: "var(--fg-color)",
                                }}
                            >
                                Анализ
                            </h4>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "var(--muted-fg)",
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}
                            >
                                Автоматически рассчитываются финансовые метрики,
                                строятся линейные тренды и зависимости.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div
                            className="paper-card"
                            style={{ padding: "24px", borderRadius: "0px" }}
                        >
                            <div
                                className="font-pixel"
                                style={{
                                    fontSize: "24px",
                                    color: "var(--accent-color)",
                                    marginBottom: "16px",
                                }}
                            >
                                03
                            </div>
                            <h4
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    margin: "0 0 10px 0",
                                    color: "var(--fg-color)",
                                }}
                            >
                                Прогноз
                            </h4>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "var(--muted-fg)",
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}
                            >
                                AutoML запускает сценарии обучения моделей и
                                выдает вероятностный расчет трендов.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div
                            className="paper-card"
                            style={{ padding: "24px", borderRadius: "0px" }}
                        >
                            <div
                                className="font-pixel"
                                style={{
                                    fontSize: "24px",
                                    color: "var(--accent-color)",
                                    marginBottom: "16px",
                                }}
                            >
                                04
                            </div>
                            <h4
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    margin: "0 0 10px 0",
                                    color: "var(--fg-color)",
                                }}
                            >
                                Решение
                            </h4>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "var(--muted-fg)",
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}
                            >
                                Интерфейс предлагает готовые рекомендации и
                                выводы для оперативного управления.
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {/* FOOTER SECTION */}
            < footer
                id="contact"
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderTop: "1px solid var(--border-color)",
                    padding: "30px 0 0 0",
                }}
            >
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "0 24px 48px 24px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 1fr)",
                            gap: "32px",
                        }}
                    >
                        <div style={{ gridColumn: "span 5" }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    letterSpacing: "-0.02em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    color: "var(--fg-color)",
                                    marginBottom: "16px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        backgroundColor: "var(--fg-color)",
                                        color: "var(--bg-color)",
                                        display: "grid",
                                        placeItems: "center",
                                        fontSize: "8px",
                                    }}
                                >
                                    DO
                                </div>
                                dataoffice
                            </div>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "var(--muted-fg)",
                                    lineHeight: 1.6,
                                    maxWidth: "280px",
                                }}
                            >
                                Персональная среда автоматизированного анализа
                                данных для корпоративных клиентов.
                            </p>
                        </div>

                        <div style={{ gridColumn: "span 4" }}>
                            <div
                                className="font-mono"
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    color: "var(--muted-fg)",
                                    letterSpacing: "0.05em",
                                    marginBottom: "16px",
                                }}
                            >
                                КООРДИНАТЫ ОФИСА
                            </div>
                            <ul
                                className="font-mono"
                                style={{
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0,
                                    fontSize: "13px",
                                    lineHeight: 2,
                                    color: "var(--fg-color)",
                                }}
                            >
                                <li>hello@dataoffice.io</li>
                                <li>+7 (495) 000-00-42</li>
                                <li>Москва, ул. Аналитическая, 7</li>
                            </ul>
                        </div>

                        <div style={{ gridColumn: "span 3" }}>
                            <div
                                className="font-mono"
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    color: "var(--muted-fg)",
                                    letterSpacing: "0.05em",
                                    marginBottom: "16px",
                                }}
                            >
                                РЕГЛАМЕНТ
                            </div>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--fg-color)",
                                    margin: 0,
                                    lineHeight: 1.6,
                                }}
                            >
                                Прием звонков осуществляется круглосуточно.
                                Доступ к терминалам Sam доступен авторизованным
                                пользователям.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Legal Tag Footer Bar */}
                <div
                    style={{
                        borderTop: "1px solid var(--border-color)",
                        backgroundColor: "rgba(241, 243, 245, 0.4)",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "1280px",
                            margin: "0 auto",
                            padding: "0 24px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "10px",
                                color: "var(--muted-fg)",
                            }}
                        >
                            © 2026 DATAOFFICE LLC
                        </span>
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "10px",
                                color: "var(--muted-fg)",
                            }}
                        >
                            FILED · CONFIDENTIAL · INTERNAL USE
                        </span>
                    </div>
                </div>
            </footer >
        </div >
    );
}
