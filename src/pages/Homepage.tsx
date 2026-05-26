import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { samAvatar, bobAvatar, margaretAvatar } from "../assets/avatars";
import { StatCard } from "../components/StatCard";
import { SpecialistCard } from "../components/SpecialistCard";

export function Homepage() {
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
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 40,
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: "rgba(253, 252, 247, 0.85)",
                    backdropFilter: "blur(8px)",
                }}
            >
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "0 24px",
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <a
                        href="#"
                        className="font-pixel"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: "var(--fg-color)",
                                color: "var(--bg-color)",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "10px",
                                fontFamily: "var(--font-pixel)",
                            }}
                        >
                            DO
                        </div>
                        <div style={{ lineHeight: 1.1 }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    letterSpacing: "-0.02em",
                                    color: "var(--fg-color)",
                                }}
                            >
                                dataoffice
                            </div>
                            <div
                                className="font-mono"
                                style={{
                                    fontSize: "9px",
                                    color: "var(--muted-fg)",
                                    textTransform: "uppercase",
                                }}
                            >
                                v.2.4 · build 2026
                            </div>
                        </div>
                    </a>

                    <nav
                        className="font-mono"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "28px",
                            fontSize: "13px",
                            fontWeight: 500,
                        }}
                    >
                        <a
                            href="#team"
                            style={{
                                textDecoration: "none",
                                color: "var(--fg-color)",
                            }}
                        >
                            Команда
                        </a>
                        <a
                            href="#modules"
                            style={{
                                textDecoration: "none",
                                color: "var(--fg-color)",
                            }}
                        >
                            Модули
                        </a>
                        <a
                            href="#workflow"
                            style={{
                                textDecoration: "none",
                                color: "var(--fg-color)",
                            }}
                        >
                            Процесс
                        </a>
                        <a
                            href="#contact"
                            style={{
                                textDecoration: "none",
                                color: "var(--fg-color)",
                            }}
                        >
                            Контакты
                        </a>
                    </nav>

                    <a
                        href="#contact"
                        className="font-mono"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "var(--fg-color)",
                            color: "var(--bg-color)",
                            padding: "8px 16px",
                            fontSize: "13px",
                            textDecoration: "none",
                            fontWeight: 500,
                            transition: "background-color 0.2s",
                        }}
                    >
                        Записаться <span className="animate-blink">█</span>
                    </a>
                </div>

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
            </header>

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
                                href="#modules"
                                style={{
                                    backgroundColor: "var(--primary-color)",
                                    color: "var(--primary-fg)",
                                    padding: "12px 24px",
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    transition: "background-color 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                Открыть модули <span>→</span>
                            </a>
                            <a
                                href="#team"
                                style={{
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--card-bg)",
                                    color: "var(--fg-color)",
                                    padding: "12px 24px",
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                Познакомиться с командой
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
                        {/* Dashboard Card */}
                        <div
                            className="paper-card animate-float"
                            style={{
                                width: "100%",
                                padding: "24px",
                                borderRadius: "0px",
                            }}
                        >
                            {/* Card Header */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "16px",
                                    borderBottom:
                                        "1px solid var(--border-color)",
                                    paddingBottom: "12px",
                                }}
                            >
                                <div
                                    className="font-mono"
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ◇ DATA STREAMS
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                        onClick={() =>
                                            setActiveChartTab("streams")
                                        }
                                        className="font-mono"
                                        style={{
                                            fontSize: "9px",
                                            padding: "2px 6px",
                                            border: "1px solid var(--border-color)",
                                            background:
                                                activeChartTab === "streams"
                                                    ? "var(--fg-color)"
                                                    : "var(--card-bg)",
                                            color:
                                                activeChartTab === "streams"
                                                    ? "var(--bg-color)"
                                                    : "var(--fg-color)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        STREAMS
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveChartTab("queries")
                                        }
                                        className="font-mono"
                                        style={{
                                            fontSize: "9px",
                                            padding: "2px 6px",
                                            border: "1px solid var(--border-color)",
                                            background:
                                                activeChartTab === "queries"
                                                    ? "var(--fg-color)"
                                                    : "var(--card-bg)",
                                            color:
                                                activeChartTab === "queries"
                                                    ? "var(--bg-color)"
                                                    : "var(--fg-color)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        QUERIES
                                    </button>
                                </div>
                            </div>

                            {/* Chart body */}
                            <div
                                style={{
                                    height: "140px",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {activeChartTab === "streams" ? (
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 380 100"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d={linePoints}
                                            fill="rgba(112, 72, 232, 0.08)"
                                        />
                                        <path
                                            d={linePath}
                                            fill="none"
                                            stroke="var(--primary-color)"
                                            strokeWidth="2.5"
                                        />
                                        {/* Glowing endpoint dots */}
                                        <circle
                                            cx="370"
                                            cy="50"
                                            r="4"
                                            fill="var(--primary-color)"
                                        />
                                    </svg>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "end",
                                            justifyContent: "space-between",
                                            height: "100%",
                                            paddingTop: "20px",
                                        }}
                                    >
                                        {[
                                            65, 45, 85, 30, 95, 75, 55, 80, 40,
                                            90,
                                        ].map((h, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: "8%",
                                                    height: `${h}%`,
                                                    backgroundColor:
                                                        "var(--accent-color)",
                                                    transformOrigin: "bottom",
                                                    animation:
                                                        "bar-grow 0.5s ease-out forwards",
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Card Footer Info */}
                            <div
                                style={{
                                    marginTop: "16px",
                                    borderTop: "1px solid var(--border-color)",
                                    paddingTop: "12px",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    textAlign: "center",
                                }}
                            >
                                <div>
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: "9px",
                                            color: "var(--muted-fg)",
                                        }}
                                    >
                                        CPU LOAD
                                    </div>
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            marginTop: "2px",
                                        }}
                                    >
                                        14.2%
                                    </div>
                                </div>
                                <div
                                    style={{
                                        borderLeft:
                                            "1px solid var(--border-color)",
                                        borderRight:
                                            "1px solid var(--border-color)",
                                    }}
                                >
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: "9px",
                                            color: "var(--muted-fg)",
                                        }}
                                    >
                                        ACTIVE USER
                                    </div>
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            marginTop: "2px",
                                        }}
                                    >
                                        BOB
                                    </div>
                                </div>
                                <div>
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: "9px",
                                            color: "var(--muted-fg)",
                                        }}
                                    >
                                        STATUS
                                    </div>
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            color: "var(--primary-color)",
                                            marginTop: "2px",
                                        }}
                                    >
                                        ONLINE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM ROOM DIRECTORY SECTION */}
            <section
                id="team"
                style={{
                    borderTop: "1px solid var(--border-color)",
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: "rgba(241, 243, 245, 0.3)",
                    padding: "80px 0",
                }}
            >
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "0 24px",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <div
                            className="label-tag"
                            style={{ marginBottom: "16px" }}
                        >
                            ШТАТНОЕ РАСПИСАНИЕ
                        </div>
                        <h2
                            className="font-pixel"
                            style={{
                                fontSize: "20px",
                                margin: 0,
                            }}
                        >
                            НАШИ КАБИНЕТЫ
                        </h2>
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
                            employeeRole="СТАРШИЙ БИБЛИОТЕКАРЬ ДАННЫХ"
                            description="Маргарет — старший библиотекарь офиса. Сорок лет среди отчётов и каталогов: задайте вопрос словами — она найдёт нужные данные."
                            bullets={[
                                "Семантический поиск по всем хранилищам через LLM",
                                "Понимает запросы на естественном языке",
                                "Связывает таблицы и источники без SQL"
                            ]}
                            employeeId="EMP_ID #1024"
                            onClick={() => navigate("/not-exist?user=margaret")}
                        />

                        <SpecialistCard
                            moduleNum="02"
                            moduleTitle="ANALYTICS AGENT"
                            avatar={bobAvatar}
                            avatarName="БОБ"
                            employeeName="Боб"
                            employeeRole="ФИНАНСОВЫЙ АНАЛИТИК - АГЕНТ"
                            description="Боб всегда в пиджаке и всегда с цифрами. Строит финансовые модели, считает unit-экономику и объясняет «почему» за каждым графиком."
                            bullets={[
                                "Автоматический анализ P&L, когорт и воронок",
                                "Финансовое моделирование и сценарии",
                                "Объясняющие отчёты с обоснованиями"
                            ]}
                            employeeId="EMP_ID #1025"
                            isActive={true}
                            onClick={() => navigate("/analyze")}
                        />

                        <SpecialistCard
                            moduleNum="03"
                            moduleTitle="AUTOML"
                            avatar={samAvatar}
                            avatarName="СЭМ"
                            employeeName="Сэм"
                            employeeRole="ML - ИНЖЕНЕР • AUTOML"
                            description="Сэм сидит в углу в клетчатой рубашке и тренирует модели. Загрузите датасет — он подберёт алгоритм, обучит и задеплоит за вас."
                            bullets={[
                                "Автоматический подбор моделей и фичей",
                                "Кросс-валидация и метрики из коробки",
                                "Готовый API для предсказаний в один клик"
                            ]}
                            employeeId="EMP_ID #1026"
                            onClick={() => navigate("/not-exist?user=sam")}
                        />
                    </div>
                </div>
            </section>

            {/* PROCESS WORKFLOW MODULES SECTION */}
            <section
                id="modules"
                style={{
                    padding: "80px 0",
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
                                ТЕХНОЛОГИЧЕСКИЙ ПРОЦЕСС
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
            </section>

            {/* FOOTER SECTION */}
            <footer
                id="contact"
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderTop: "1px solid var(--border-color)",
                    padding: "64px 0 0 0",
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
            </footer>
        </div>
    );
}
