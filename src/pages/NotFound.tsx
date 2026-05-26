import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Homepage.css";
import { samAvatar, bobAvatar, margaretAvatar } from "../assets/avatars";
import { PaperCard } from "../components/PaperCard";
import { RetroStamp } from "../components/RetroStamp";

export function NotFound() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = searchParams.get("user");

    // Force body and html overflow to auto when NotFound mounts and restore it on unmount
    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.setProperty("overflow", "auto", "important");
        document.documentElement.style.setProperty("overflow", "auto", "important");

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, []);

    let avatarUrl = "";
    let employeeName = "Сотрудник";
    let employeeRole = "Специалист";
    let currentStatus = "Занят";
    let statusMessage =
        "Кабинет временно пустует. Сотрудник находится на выездном совещании или перерыве.";
    let SpecialistId = "ID: Unknown";

    if (user === "margaret") {
        avatarUrl = margaretAvatar;
        employeeName = "Маргарет";
        employeeRole = "Архивариус · Интеллектуальный поиск";
        currentStatus = "ИНВЕНТАРИЗАЦИЯ ДОКУМЕНТОВ";
        statusMessage =
            "В данный момент Маргарет занимается каталогизацией старых реестров данных за 1998–2024 гг. Интеллектуальный поиск временно недоступен. Пожалуйста, зайдите в кабинет позже.";
        SpecialistId = "ID: 01_MARGARET";
    } else if (user === "bob") {
        avatarUrl = bobAvatar;
        employeeName = "Боб";
        employeeRole = "Аналитик · Финансовый анализ";
        currentStatus = "АНАЛИЗ ОТЧЕТНОСТИ Q3";
        statusMessage =
            "Боб сводит квартальные отчеты о расходах департамента. Свободных вычислительных мощностей для дополнительных финансовых расчетов сейчас нет. Пожалуйста, зайдите в кабинет позже.";
        SpecialistId = "ID: 02_BOB";
    } else if (user === "sam") {
        avatarUrl = samAvatar;
        employeeName = "Сэм";
        employeeRole = "ML-инженер · AutoML";
        currentStatus = "ОБУЧЕНИЕ МОДЕЛИ (EPOCH 42/100)";
        statusMessage =
            "Сэм запустил обучение тяжелой языковой модели и сейчас все графические ускорители загружены на 100%. Дополнительные ресурсы будут доступны после завершения эпох. Пожалуйста, зайдите в кабинет позже.";
        SpecialistId = "ID: 03_SAM";
    }

    return (
        <div
            className="homepage-root"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                padding: "24px",
            }}
        >
            <PaperCard
                className="animate-float"
                style={{
                    maxWidth: "720px",
                    width: "100%",
                    padding: "40px",
                    position: "relative",
                }}
            >
                {/* Retro Stamp */}
                <div
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        zIndex: 10,
                    }}
                >
                    <RetroStamp
                        text="ЗАНЯТО"
                        color="var(--accent-color)"
                        borderColor="var(--accent-color)"
                        rotation={-6}
                    />
                </div>

                {/* Top Info Layout Row */}
                <div
                    style={{
                        display: "flex",
                        gap: "32px",
                        alignItems: "flex-start",
                        textAlign: "left",
                        marginBottom: "32px",
                        paddingRight: "20px", // Leave space for ZANYATO stamp in top right
                    }}
                >
                    {/* Large Avatar container on the Left */}
                    {avatarUrl && (
                        <div
                            style={{
                                width: "250px",
                                height: "250px",
                                border: "1px solid var(--border-color)",
                                padding: "8px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src={avatarUrl}
                                alt={employeeName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                    )}

                    {/* Right Info Section */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            paddingTop: "38px",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "38px",
                                fontWeight: 800,
                                margin: 0,
                                color: "var(--ink-color)",
                                letterSpacing: "-0.02em",
                                lineHeight: "1.1",
                            }}
                        >
                            {employeeName}
                        </h2>
                        <div
                            className="font-mono"
                            style={{
                                fontSize: "13px",
                                color: "var(--muted-fg)",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                            }}
                        >
                            {SpecialistId}
                        </div>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                backgroundColor: "oklch(0.22 0.04 250)",
                                color: "#4ade80",
                                fontSize: "14px",
                                fontFamily: "var(--font-mono)",
                                fontWeight: "bold",
                                letterSpacing: "0.02em",
                                marginTop: "28px",
                                alignSelf: "flex-start",
                                borderRadius: "4px",
                                border: "1px solid rgba(74, 222, 128, 0.15)",
                            }}
                        >
                            {employeeRole}
                        </div>
                    </div>
                </div>

                {/* Retro Busy Terminal Screen */}
                <div
                    style={{
                        backgroundColor: "oklch(0.22 0.04 250)", // solid retro dark console
                        color: "#4ade80", // retro phosphor green
                        fontFamily: "var(--font-mono)",
                        padding: "24px",
                        borderRadius: "8px",
                        textAlign: "left",
                        fontSize: "13px",
                        border: "1px solid rgba(74, 222, 128, 0.15)",
                        boxShadow: "inset 0 4px 12px rgba(0,0,0,0.6)",
                        marginBottom: "32px",
                        lineHeight: 1.6,
                    }}
                >
                    <div
                        style={{
                            borderBottom: "1px solid rgba(74, 222, 128, 0.2)",
                            paddingBottom: "12px",
                            marginBottom: "16px",
                            fontWeight: "bold",
                            fontSize: "14px",
                            color: "#4ade80",
                        }}
                    >
                        STATUS WINDOW: {currentStatus}
                    </div>
                    <div style={{ marginBottom: "16px", color: "#86efac" }}>
                        &gt; MESSAGE: {statusMessage}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#4ade80",
                            fontWeight: "bold",
                        }}
                    >
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#4ade80",
                                display: "inline-block",
                                boxShadow: "0 0 8px #4ade80",
                            }}
                            className="animate-pulse"
                        ></span>
                        <span>SYSTEM WAITING FOR THREAD FREE...</span>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="font-mono"
                    style={{
                        width: "100%",
                        border: "none",
                        backgroundColor: "oklch(0.22 0.04 250)",
                        color: "#ffffff",
                        padding: "16px 0",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "14px",
                        letterSpacing: "0.05em",
                        transition: "background-color 0.2s",
                        borderRadius: "4px",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "oklch(0.32 0.04 250)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "oklch(0.22 0.04 250)")
                    }
                >
                    ВЕРНУТЬСЯ В ПРИЕМНУЮ
                </button>
            </PaperCard>
        </div>
    );
}
