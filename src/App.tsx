import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Message, ChatSession, ChartData } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { ChatArea } from './components/ChatArea';
import { RightSidebar } from './components/RightSidebar';
import { DataCharts } from './components/Charts';
import { Dashboard } from './components/dashboard/Dashboard';
import { COLORS } from './colorPalette'
import * as XLSX from 'xlsx';

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
    .app-header { height: 40px; background: ${COLORS.white}; border-bottom: 1px solid ${COLORS.gray200}; display: flex; align-items: center; padding: 0 24px; flex-shrink: 0; z-index: 100; }
    .header-logo-container { display: flex; align-items: center; gap: 8px; user-select: none; margin-left: 40px; }
    .header-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: ${COLORS.gray700}; display: flex; align-items: center; line-height: 1; margin: 0; transform: translateY(-2.5px); }
    .ai-highlight { color: ${COLORS.accent}; margin-left: 1px; display: inline-block; }
    .header-logo-container svg { display: block; flex-shrink: 0; }

    /* --- ЛЕВАЯ КОЛОНКА --- */
    .col-left { flex: ${COLUMN_DISIVISION_PARTS.left}; background: ${COLORS.gray100}; border-right: 1px solid ${COLORS.gray200}; display: flex; flex-direction: column; padding: 18px 12px; overflow-y: hidden; }
    .btn-upload { display: block; text-align: center; background: ${COLORS.white}; border: 1.5px solid ${COLORS.dark}; color: ${COLORS.dark}; border-radius: 12px; padding: 12px; cursor: pointer; font-weight: 600; font-size: 14px; margin-bottom: 24px; transition: all 0.2s ease; box-shadow: 0 2px 0 ${COLORS.shadowLight05}; }
    .btn-upload:hover { background: ${COLORS.dark}; color: ${COLORS.white}; }
    .btn-upload:active { transform: translateY(2px); box-shadow: none; }
    .chat-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 4px; }
    .chat-list::-webkit-scrollbar { width: 6px; }
    .chat-list::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 4px; }
    .chat-item { padding: 14px 16px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; background: transparent; transition: all 0.2s ease; }
    .chat-item:hover { background: ${COLORS.gray100}; }
    .chat-item.active { background: ${COLORS.white}; border: 1px solid ${COLORS.gray200}; box-shadow: 0 2px 8px ${COLORS.shadowLight05}; }
    .chat-item .dataset-desc { font-size: 14px; font-weight: 600; color: ${COLORS.dark}; margin-bottom: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chat-item .dataset-name { font-size: 12px; color: ${COLORS.gray500}; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* --- ЦЕНТРАЛЬНАЯ КОЛОНКА --- */
    .col-center { flex: ${COLUMN_DISIVISION_PARTS.middle}; display: flex; flex-direction: column; background: ${COLORS.white}; position: relative; min-width: 0; }
    .messages-wrapper { flex: 1; display: flex; flex-direction: column; background: ${COLORS.white}; overflow-y: auto; padding: 0 40px 32px 40px; scrollbar-width: thin; scrollbar-color: ${COLORS.gray300} transparent; position: relative; }
    .messages-wrapper::-webkit-scrollbar { width: 6px; display: block; }
    .messages-wrapper::-webkit-scrollbar-thumb { background-color: ${COLORS.gray200}; border-radius: 10px; }
    .messages-wrapper::-webkit-scrollbar-thumb:hover { background-color: ${COLORS.gray300}; }

    .msg-row { display: flex; width: 100%; margin-bottom: 24px; animation: slideUp 0.3s ease forwards; opacity: 0; transform: translateY(10px); }
    .msg-bubble { position: relative; border-radius: 16px; padding: 16px 20px; word-wrap: break-word; font-size: 15px; line-height: 1.5; }
    .msg-row.agent { justify-content: flex-start; }
    .msg-bubble.agent { width: 73%; background: ${COLORS.white}; border: 1px solid ${COLORS.gray200}; color: ${COLORS.dark}; box-shadow: 0 4px 12px ${COLORS.shadowLight05}; border-bottom-left-radius: 4px; }
    .msg-bubble.agent.error { background: ${COLORS.errorBg}; border: 1px solid ${COLORS.errorBorder}; color: ${COLORS.errorBorder}; box-shadow: none; }
    .msg-row.user { justify-content: flex-end; }
    .msg-bubble.user { max-width: 60%; background: ${COLORS.gray100}; color: ${COLORS.dark}; border: 1px solid ${COLORS.accent_brighter}; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px ${COLORS.shadowLight08}; font-weight: 450; }

    /* Инпут */
    .input-container { padding: 20px 40px; display: flex; justify-content: center; background: ${COLORS.white}; border-top: 1px solid ${COLORS.gray100}; }
    .input-box { height: 45px; width: 100%; display: flex; background: ${COLORS.gray50}; border: 1.5px solid ${COLORS.gray200}; border-radius: 12px; overflow: hidden; transition: all 0.2s ease; }
    .input-box:focus-within { border-color: ${COLORS.accent}; background: ${COLORS.white}; box-shadow: 0 0 0 3px rgba(51, 153, 255, 0.15); }
    .input-box input { flex: 1; border: none; padding: 0 20px; outline: none; font-size: 15px; background: transparent; color: ${COLORS.dark}; }
    .input-box input::placeholder { color: ${COLORS.gray500}; }
    .input-box button { background: ${COLORS.transparent}; border: none; padding: 0 20px; font-size: 20px; cursor: pointer; color: ${COLORS.accent}; transition: 0.2s; }
    .input-box button:hover { transform: scale(1.1); color: #2080e0; }

    /* Таблица Семпла */
    .sample-container { width: 100%; background: ${COLORS.white}; border: 1px solid ${COLORS.gray200}; border-radius: 12px; margin-bottom: 24px; margin-top: 24px; z-index: 10; transition: all 0.3s ease; }
    .sample-container.pinned { position: sticky; top: 0; z-index: 50; box-shadow: 0 4px 12px ${COLORS.shadowLight08}; border-top: none; border-radius: 0; }
    .sample-container.hidden-state { opacity: 0.8; }
    .sample-controls { display: flex; gap: 10px; height: 40px; padding: 12px 16px; border-bottom: 1px solid ${COLORS.gray200}; background: ${COLORS.gray50}; }
    .sample-btn { padding: 6px 12px; border: 1px solid ${COLORS.gray300}; background: ${COLORS.white}; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: 0.2s; color: ${COLORS.dark}; }
    .sample-btn:hover { background: ${COLORS.gray100}; }
    .sample-btn.active { background: ${COLORS.dark}; color: ${COLORS.white}; border-color: ${COLORS.dark}; }
    .table-wrapper { overflow-x: auto; overflow-y: hidden; transition: max-height 0.4s ease; max-height: 350px; background: ${COLORS.white}; display: block; }
    .table-wrapper::-webkit-scrollbar-track { background: ${COLORS.transparent}; margin: 0 10px; }
    .table-wrapper::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 6px; border: 2px solid ${COLORS.white}; }
    .table-wrapper::-webkit-scrollbar-thumb:hover { background: ${COLORS.gray400}; }
    .table-wrapper.collapsed { max-height: 0; overflow: hidden; }
    
    .sample-table { width: 100%; border-collapse: collapse; background: ${COLORS.white}; }
    .sample-table th, .sample-table td { border-bottom: 1px solid ${COLORS.gray200}; padding: 6px 12px; text-align: left; font-size: 13px; white-space: nowrap; }
    .sample-table th { background: ${COLORS.gray50}; font-weight: 600; color: ${COLORS.accent_brighter}; position: sticky; top: 0; }
    .sample-table tr:hover td { background: ${COLORS.gray50}; }

    /* --- ПРАВАЯ КОЛОНКА --- */
    .col-right { flex: ${COLUMN_DISIVISION_PARTS.right}; background: ${COLORS.gray50}; border-left: 1px solid ${COLORS.gray200}; overflow-y: auto; display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 20px; min-width: 0; }
    .col-right::-webkit-scrollbar { width: 6px; }
    .col-right::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 4px; }
    .chart-preview-box { width: 85%; aspect-ratio: 4/3; background: ${COLORS.white}; border: 1px solid ${COLORS.gray200}; border-radius: 12px; box-shadow: 0 2px 8px ${COLORS.shadowLight05}; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; color: ${COLORS.gray600}; font-size: 13px; font-weight: 500; text-align: center; }
    .chart-preview-box:hover { transform: translateY(-4px); box-shadow: 0 8px 16px ${COLORS.shadowLight08}; border-color: ${COLORS.accent}; color: ${COLORS.accent}; }

    /* --- МОДАЛЬНОЕ ОКНО И ФОРМА ЗАГРУЗКИ --- */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: ${COLORS.overlay50}; backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; animation: fadeIn 0.2s forwards; }
    .modal-content { background: ${COLORS.white}; padding: 20px; border-radius: 20px; width: 90vw; max-width: 1400px; max-height: 90vh; overflow: auto; transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: 0 20px 40px ${COLORS.shadowDark30}; position: relative; }
    
    .upload-modal { background: ${COLORS.white}; padding: 32px; border-radius: 20px; width: 500px; max-width: 90vw; box-shadow: 0 20px 40px ${COLORS.shadowDark30}; transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative; }
    .upload-tabs { display: flex; gap: 24px; border-bottom: 2px solid ${COLORS.gray200}; margin-bottom: 24px; }
    .upload-tab { padding: 8px 0; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 600; color: ${COLORS.gray500}; font-size: 15px; transition: 0.2s; }
    .upload-tab:hover { color: ${COLORS.dark}; }
    .upload-tab.active { border-bottom-color: ${COLORS.accent}; color: ${COLORS.accent}; }
    .upload-form-group { margin-bottom: 16px; }
    .upload-input { width: 100%; padding: 12px 16px; border: 1.5px solid ${COLORS.gray200}; border-radius: 12px; font-size: 14px; background: ${COLORS.gray50}; outline: none; transition: border-color 0.2s; color: ${COLORS.dark}; }
    .upload-input:focus { border-color: ${COLORS.accent}; background: ${COLORS.white}; }
    .file-drop-area { border: 2px dashed ${COLORS.gray300}; border-radius: 12px; padding: 40px 20px; text-align: center; cursor: pointer; background: ${COLORS.gray50}; transition: 0.2s; }
    .file-drop-area:hover { border-color: ${COLORS.accent}; background: ${COLORS.white}; }
    .file-drop-text { color: ${COLORS.gray600}; font-size: 14px; font-weight: 500; }
    .btn-submit-container { display: flex; justify-content: center; margin-top: 32px; }
    .btn-submit { background: ${COLORS.dark}; color: ${COLORS.white}; padding: 14px 40px; border-radius: 12px; font-weight: 600; font-size: 15px; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px ${COLORS.shadowLight05}; }
    .btn-submit:hover { background: ${COLORS.accent}; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(51, 153, 255, 0.3); }
    .btn-submit:disabled { background: ${COLORS.gray300}; cursor: not-allowed; transform: none; box-shadow: none; color: ${COLORS.gray500}; }

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
    .custom-slider { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 4px; outline: none; cursor: pointer; }
    .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #328fec; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
    .custom-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #328fec; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }

    /* --- iOS Toggle для AI --- */
    .toggle-switch { position: relative; display: inline-block; width: 40px; height: 25px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e4e4e7; transition: .3s; border-radius: 24px; }
    .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3.5px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .toggle-switch input:checked + .toggle-slider { background-color: #328fec; }
    .toggle-switch input:checked + .toggle-slider:before { transform: translateX(16px); }
    .ai-toggle-container { display: flex; align-items: center; gap: 8px; margin-left: 8px; align-self: flex-start; cursor: pointer; }
    .ai-toggle-label { font-size: 14px; font-weight: 600; color: #52525b; user-select: none; margin-bottom: 3px; }

    /* --- ИНПУТ С ПАРОЛЕМ И ГЛАЗИКОМ --- */
    .password-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
    .password-wrapper .upload-input { padding-right: 40px; }
    .eye-btn { 
        position: absolute; right: 12px; background: none; border: none; cursor: pointer; 
        color: ${COLORS.gray500}; display: flex; align-items: center; justify-content: center; 
        padding: 4px; transition: color 0.2s ease;
    }
    .eye-btn:hover { color: ${COLORS.dark}; }
    .eye-slash { 
        stroke-dasharray: 30; stroke-dashoffset: 0; 
        transition: stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    .eye-btn.open .eye-slash { stroke-dashoffset: 30; } /* Анимация: перечеркивание "уезжает" */

    /* --- КНОПКА ТЕСТА ПОДКЛЮЧЕНИЯ --- */
    .test-conn-btn {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600;
        cursor: pointer; transition: all 0.2s ease; border: 1.5px solid;
        margin-top: 16px;
    }
    
    /* Состояние: Дефолт */
    .test-conn-btn.idle { background: ${COLORS.gray50}; color: ${COLORS.dark}; border-color: ${COLORS.gray200}; }
    .test-conn-btn.idle:hover { background: ${COLORS.gray100}; border-color: ${COLORS.gray300}; }
    .test-conn-btn.loading { opacity: 0.7; cursor: wait; }

    /* Состояние: Успех */
    .test-conn-btn.success { background: #e6f4ea; color: #137333; border-color: #1e8e3e; cursor: default; }
    .test-conn-status-ok { font-weight: 700; font-size: 14px; }

    /* Состояние: Ошибка */
    .test-conn-btn.error { background: #fce8e6; color: #c5221f; border-color: #d93025; cursor: default; }
    .error-icon-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
    .error-icon { cursor: help; color: #d93025; }

    /* --- ТУЛТИП С ОШИБКОЙ --- */
    .error-tooltip {
        position: absolute; right: 0; bottom: calc(100% + 12px);
        width: 500px; max-height: 400px; background: ${COLORS.white};
        border: 1px solid #d93025; border-radius: 12px;
        box-shadow: 0 10px 30px rgba(217, 48, 37, 0.15);
        padding: 16px; z-index: 100;
        display: flex; flex-direction: column; 
        opacity: 0; visibility: hidden; transform: translateY(10px);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: text;
    }
    .error-icon-wrapper:hover .error-tooltip { 
        opacity: 1; visibility: visible; transform: translateY(0); 
    }
    .tooltip-header { 
        display: flex; justify-content: space-between; align-items: center; 
        margin-bottom: 12px; font-weight: 600; color: ${COLORS.dark}; 
        padding-bottom: 8px; border-bottom: 1px solid ${COLORS.gray200};
    }
    .copy-btn { 
        background: ${COLORS.gray50}; border: 1px solid ${COLORS.gray200}; 
        border-radius: 6px; padding: 6px; cursor: pointer; color: ${COLORS.gray600}; 
        display: flex; align-items: center; transition: 0.2s; 
    }
    .copy-btn:hover { background: ${COLORS.white}; color: ${COLORS.accent}; border-color: ${COLORS.accent}; }
    .copy-btn:active { transform: scale(0.95); }
    .tooltip-body { 
        overflow-y: auto; font-family: ui-monospace, monospace; font-size: 12px; 
        line-height: 1.5; color: #c5221f; white-space: pre-wrap; padding-right: 4px; 
        text-align: left; word-break: break-all;
    }
    .tooltip-body::-webkit-scrollbar { width: 6px; }
    .tooltip-body::-webkit-scrollbar-thumb { background: #f5b0ab; border-radius: 4px; }

    /* --- ERD ДИАГРАММА --- */
    .erd-container { 
        width: 100%; height: 500px; 
        background: ${COLORS.white}; 
        border: 1px solid ${COLORS.gray200}; 
        border-radius: 12px; 
        overflow: hidden; 
        margin: 24px 0;
        position: relative;
    }
    .erd-table-node { 
        background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
        min-width: 260px; /* Увеличено с 240px */
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; 
    }
    .erd-table-header { 
        background: #328fec; color: #ffffff; 
        padding: 12px 16px; /* Увеличено для красоты */
        font-weight: 600; 
        font-size: 16px; /* Увеличено с 14px */
        border-top-left-radius: 7px; border-top-right-radius: 7px; 
        text-align: center; letter-spacing: 0.5px;
    }
    .erd-table-row { 
        display: flex; justify-content: space-between; align-items: center; 
        padding: 8px 16px; /* Увеличено с 6px 14px */
        border-bottom: 1px solid #f3f4f6; 
        font-size: 14px; /* Увеличено с 12px */
    }
    .erd-table-row:last-child { border-bottom: none; }
    .erd-col-name { display: flex; align-items: center; gap: 8px; color: ${COLORS.dark}; font-weight: 500; }
    .erd-col-type { color: ${COLORS.gray500}; }
        .erd-badge { 
        font-size: 11px; /* Увеличено с 10px */
        font-weight: 700; padding: 3px 6px; border-radius: 4px; line-height: 1; display: inline-block; 
    }
    .erd-badge.pk { background: #fef08a; color: #854d0e; border: 1px solid #fde047; }
    .erd-badge.fk { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
`;

// --- КОМПОНЕНТ ФОРМЫ КРЕДОВ БД ---
const DbCredentialsForm = ({ credentials, onChange }: { credentials: any, onChange: (e: any) => void }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleTestConnection = async () => {
        if (!credentials.host || !credentials.database || !credentials.user) return;
        
        setTestState('loading');
        try {
            const res = await fetch('http://localhost:8000/test_connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            
            const data = await res.json();
            if (data.status === 'success') {
                setTestState('success');
            } else {
                setTestState('error');
                setErrorMsg(data.message || 'Неизвестная ошибка БД');
            }
        } catch (err: any) {
            setTestState('error');
            setErrorMsg(err.message);
        }
    };

    const copyError = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(errorMsg);
    };

    return (
        <div>
            <div className="upload-form-group">
                <input className="upload-input" type="text" name="host" placeholder="Host (например, localhost или URL)" value={credentials.host} onChange={onChange} />
            </div>
            <div className="upload-form-group">
                <input className="upload-input" type="number" name="port" placeholder="Port (по умолчанию 5432)" value={credentials.port} onChange={onChange} />
            </div>
            <div className="upload-form-group">
                <input className="upload-input" type="text" name="database" placeholder="Database Name" value={credentials.database} onChange={onChange} />
            </div>
            <div className="upload-form-group">
                <input className="upload-input" type="text" name="user" placeholder="Username" value={credentials.user} onChange={onChange} />
            </div>
            
            <div className="upload-form-group password-wrapper">
                <input 
                    className="upload-input" 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Password" 
                    value={credentials.password} 
                    onChange={onChange} 
                />
                <button 
                    type="button" 
                    className={`eye-btn ${showPassword ? 'open' : ''}`} 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Овал глаза */}
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        {/* Зрачок */}
                        <circle cx="12" cy="12" r="3" />
                        {/* Анимированная линия перечеркивания */}
                        <line x1="3" y1="3" x2="21" y2="21" className="eye-slash" />
                    </svg>
                </button>
            </div>

            {/* Кнопка Проверить подключение */}
            <button 
                type="button"
                className={`test-conn-btn ${testState}`}
                onClick={handleTestConnection}
                disabled={testState === 'loading' || !credentials.host || !credentials.user}
            >
                <span>{testState === 'loading' ? 'Проверка...' : 'Проверить подключение'}</span>
                
                {testState === 'success' && (
                    <span className="test-conn-status-ok">ОК</span>
                )}
                
                {testState === 'error' && (
                    <div className="error-icon-wrapper">
                        <svg className="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        
                        <div className="error-tooltip" onClick={e => e.stopPropagation()}>
                            <div className="tooltip-header">
                                <span>Ошибка подключения</span>
                                <button className="copy-btn" onClick={copyError} title="Скопировать лог">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>
                            </div>
                            <div className="tooltip-body">
                                {errorMsg}
                            </div>
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
};

function MainLayout() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
    const [localDataPool, setLocalDataPool] = useState<any[]>([]);
    const [dbSchema, setDbSchema] = useState<any | null>(null);

    // --- СОСТОЯНИЯ МОДАЛЬНОГО ОКНА ЗАГРУЗКИ ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadTab, setUploadTab] = useState<'file' | 'db'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dbCreds, setDbCreds] = useState({ host: '', port: '5432', database: '', user: '', password: '' });

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

    // Единый метод для отправки на бэк (и файла, и БД) по кнопке "Загрузить"
    const handleDataSubmit = async () => {
        setIsUploadModalOpen(false);
        setActiveChat("temp_loading");
        setMessages([]);
        setLoading(true);

        try {
            const formData = new FormData();
            let uploadFilename = "";

            if (uploadTab === 'file' && selectedFile) {
                // 1. Логика для локального файла
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
                // 2. Логика для БД: формируем виртуальный JSON-файл
                uploadFilename = `PostgreSQL: ${dbCreds.database}`;
                const payload = { type: 'postgresql', credentials: dbCreds };
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                const virtualFile = new File([blob], 'database_credentials.json', { type: 'application/json' });
                
                formData.append('file', virtualFile);
            }

            // DRY: Вызов API общий для обоих случаев
            const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            const data = await res.json();
            if (data.db_schema) {
                setDbSchema(data.db_schema);
            } else {
                setDbSchema(null); // Сбрасываем, если это обычный файл
            }
            
            setSessions(prev => [...prev, { id: data.chat_id, datasetName: data.dataset_summary, filename: uploadFilename }]);
            setActiveChat(data.chat_id);
            setMessages([{ id: Date.now().toString(), sender: 'agent', text: data.preprocessing_report }]);

        } catch (err: any) {
            setMessages([{ id: Date.now().toString(), sender: 'agent', text: `Ошибка загрузки: ${err.message}`, isError: true }]);
        } finally {
            setLoading(false);
            setSelectedFile(null); // Сброс
        }
    };

    const handleDbCredsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDbCreds(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isSubmitDisabled = 
        (uploadTab === 'file' && !selectedFile) || 
        (uploadTab === 'db' && (!dbCreds.host || !dbCreds.database || !dbCreds.user || !dbCreds.password));

    const sendMessage = async (overrideText?: string, useAiFlag: boolean = false, colsToRemove: string[] = []) => {
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
                cols_to_remove: colsToRemove
            })
        });

            if (!res.ok) throw new Error(`HTTP Ошибка: ${res.status}`);
            const data = await res.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
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
                <header className="app-header">
                    <div className="header-logo-container">
                        <svg width="34" height="26" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                            <rect x="2" y="2" width="36" height="26" rx="6" fill="#ffffff" />
                            <path d="M 2 15 H 20 V 2 H 8 A 6 6 0 0 0 2 8 V 15 Z" fill={COLORS.accent_ligher} />
                            <path d="M 20 15 H 38 V 8 A 6 6 0 0 0 32 2 H 20 V 15 Z" fill={COLORS.accent_ligher} />
                            <rect x="2" y="2" width="36" height="26" rx="6" stroke="#343434" strokeWidth="3" fill="none" />
                            <line x1="2" y1="15" x2="38" y2="15" stroke="#343434" strokeWidth="3"/>
                            <line x1="20" y1="2" x2="20" y2="28" stroke="#343434" strokeWidth="3"/>
                        </svg>
                        <span className="header-title">t<span className="ai-highlight">ai</span>ble</span>
                    </div>
                </header>

                <div className="app-layout">
                    {/* ВАЖНО: В компоненте LeftSidebar тебе нужно заменить старый <input type="file" onChange={onFileUpload} /> 
                        на обычную кнопку <button onClick={onOpenUploadModal}>, чтобы открывать модалку */}
                    <LeftSidebar
                        sessions={sessions}
                        activeChat={activeChat}
                        onSelectChat={setActiveChat}
                        onOpenUploadModal={() => setIsUploadModalOpen(true)} 
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
                    />

                    <RightSidebar
                        charts={uniqueCharts}
                        onSelectChart={setSelectedChart}
                        isDatasetLoaded={!!activeChat && activeChat !== "temp_loading"} 
                    />

                    {/* Модалка превью графика */}
                    {selectedChart && (
                        <div className="modal-overlay" onClick={() => setSelectedChart(null)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <DataCharts charts={[selectedChart]} preview={false} />
                            </div>
                        </div>
                    )}

                    {/* НОВОЕ: Модалка загрузки данных (Файл / БД) */}
                    {isUploadModalOpen && (
                        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
                            <div className="upload-modal" onClick={e => e.stopPropagation()}>
                                
                                <div className="upload-tabs">
                                    <div className={`upload-tab ${uploadTab === 'file' ? 'active' : ''}`} onClick={() => setUploadTab('file')}>
                                        Загрузить файл
                                    </div>
                                    <div className={`upload-tab ${uploadTab === 'db' ? 'active' : ''}`} onClick={() => setUploadTab('db')}>
                                        База данных (PostgreSQL)
                                    </div>
                                </div>

                                {uploadTab === 'file' ? (
                                    <div className="file-drop-area" onClick={() => document.getElementById('hidden-file-input')?.click()}>
                                        <input 
                                            id="hidden-file-input" 
                                            type="file" 
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                                            style={{ display: 'none' }} 
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                                            }} 
                                        />
                                        <span className="file-drop-text">
                                            {selectedFile ? `Выбран файл: ${selectedFile.name}` : 'Нажмите, чтобы выбрать CSV или Excel файл'}
                                        </span>
                                    </div>
                                ) : (
                                    <DbCredentialsForm credentials={dbCreds} onChange={handleDbCredsChange} />
                                )}

                                <div className="btn-submit-container">
                                    <button 
                                        className="btn-submit" 
                                        onClick={handleDataSubmit} 
                                        disabled={isSubmitDisabled}
                                    >
                                        Загрузить
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                    )}
                </div>
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