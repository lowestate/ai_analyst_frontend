export const COLORS = {
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

export const GLOBAL_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { overflow: hidden; background-color: ${COLORS.gray50}; color: ${COLORS.dark}; }

    .app-root { display: flex; flex-direction: column; height: 100vh; width: 100vw; }
    .app-layout { display: flex; flex: 1; overflow: hidden; }

    /* --- ХЭДЕР (ШАПКА) --- */
    .app-header { 
        height: 40px; background: ${COLORS.white}; border-bottom: 1px solid ${COLORS.gray200}; 
        display: flex; align-items: center; justify-content: space-between; /* ВАЖНО: Разносит лого и кнопку */
        padding: 0 24px; flex-shrink: 0; z-index: 100; 
    }
    .header-logo-container { display: flex; align-items: center; gap: 8px; user-select: none; }
    .header-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: ${COLORS.gray700}; display: flex; align-items: center; line-height: 1; margin: 0; transform: translateY(-2.5px); }
    .ai-highlight { color: ${COLORS.accent}; margin-left: 1px; display: inline-block; }
    .header-logo-container svg { display: block; flex-shrink: 0; margin-left: 40px }
    .btn-login-header {
        background: ${COLORS.accent}; color: ${COLORS.white}; border: none;
        padding: 6px 16px; border-radius: 6px; font-weight: 600; font-size: 14px;
        cursor: pointer; transition: opacity 0.2s;
    }
    .btn-login-header:hover { opacity: 0.9; }

    /* --- ЛЕВАЯ КОЛОНКА --- */
    .col-left { flex: ${COLUMN_DISIVISION_PARTS.left}; background: ${COLORS.gray100}; border-right: 1px solid ${COLORS.gray200}; display: flex; flex-direction: column; padding: 18px 12px; overflow-y: hidden; }
    .btn-upload { display: block; text-align: center; background: ${COLORS.white}; border: 1.5px solid ${COLORS.dark}; color: ${COLORS.dark}; border-radius: 12px; padding: 12px; cursor: pointer; font-weight: 600; font-size: 14px; margin-bottom: 24px; transition: all 0.2s ease; box-shadow: 0 2px 0 ${COLORS.shadowLight05}; }
    .btn-upload:hover { background: ${COLORS.dark}; color: ${COLORS.white}; }
    .btn-upload:active { transform: translateY(2px); box-shadow: none; }
    .chat-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 2px; }
    .chat-list::-webkit-scrollbar { width: 6px; }
    .chat-list::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 4px; }
    .chat-item { padding: 12px 12px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; background: transparent; transition: all 0.2s ease; }
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
    .msg-bubble {
        position: relative;
        border-radius: 16px;
        padding: 16px 20px;
        word-wrap: break-word;
        font-size: 15px;
        line-height: 1.5;
    }
    .msg-row.agent { justify-content: flex-start; }
    .msg-bubble.agent { width: 73%; background: ${COLORS.white}; border: 1px solid ${COLORS.gray200}; color: ${COLORS.dark}; box-shadow: 0 4px 12px ${COLORS.shadowLight05}; border-bottom-left-radius: 4px; }
    .msg-bubble.agent.error { background: ${COLORS.errorBg}; height: 55px; border: 1px solid ${COLORS.errorBorder}; color: ${COLORS.errorBorder}; box-shadow: none; }
    .msg-bubble.warning { background: #fff8e1; border: 1px solid #ffc107; color: #b76c00; box-shadow: none; }
    .msg-row.user { justify-content: flex-end; }
    .msg-bubble.user { max-width: 60%; background: ${COLORS.gray100}; color: ${COLORS.dark}; border: 1px solid ${COLORS.accent_brighter}; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px ${COLORS.shadowLight08}; font-weight: 450; }

    /* Инпут */
    .input-container { padding: 0px 40px; display: flex; justify-content: center; background: ${COLORS.white}; border-top: 1px solid ${COLORS.gray100}; }
    .input-box { height: 45px; width: 100%; display: flex; background: ${COLORS.gray50}; border: 1.5px solid ${COLORS.gray200}; border-radius: 12px; overflow: hidden; transition: all 0.2s ease; }
    .input-box:focus-within { border-color: ${COLORS.accent}; background: ${COLORS.white}; box-shadow: 0 0 0 3px rgba(51, 153, 255, 0.15); }
    .input-box input { flex: 1; border: none; padding: 0 20px; outline: none; font-size: 15px; background: transparent; color: ${COLORS.dark}; }
    .input-box input::placeholder { color: ${COLORS.gray500}; }
    .input-box button { background: ${COLORS.transparent}; border: none; padding: 0 20px; font-size: 20px; cursor: pointer; color: ${COLORS.accent}; transition: 0.2s; }
    .input-box button:hover { transform: scale(1.1); color: #2080e0; }
    .input-box input::placeholder {
        font-style: italic;
        color: ${COLORS.gray500}; 
    }

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
    /* Возвращаем отступы для нумерованных и маркированных списков в Markdown */
    .markdown-body ol,
    .markdown-body ul {
        padding-left: 24px; /* Отодвигаем список вправо, чтобы влезли цифры/маркеры */
        margin-top: 8px;
        margin-bottom: 8px;
    }

    /* Делаем списки чуть более воздушными для удобства чтения */
    .markdown-body li {
        margin-bottom: 6px;
        line-height: 1.5;
    }

    /* Убираем отступ у последнего элемента, чтобы не ломать нижний край пузыря */
    .markdown-body li:last-child {
        margin-bottom: 0;
    }

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
    .toggle-switch.disabled { opacity: 0.5; cursor: not-allowed; }
    .toggle-switch.disabled .toggle-slider { cursor: not-allowed; }
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

    /* --- АВТОРИЗАЦИЯ (Модалка) --- */
    .auth-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
    }
    .auth-modal {
        background: ${COLORS.white}; border-radius: 16px;
        width: 33vw; height: 50vh; min-height: 420px; /* Защита от сильного сжатия по высоте */
        padding: 10px; box-sizing: border-box;
        /* ИСПРАВЛЕНО: flex-direction вместо flexDirection */
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        position: relative;
    }
    .auth-form-container { 
        display: flex; flex-direction: column; justify-content: center; 
        width: 100%; max-width: 380px; /* Чуть сузили для красоты */
    }
    .auth-title { 
        font-size: 28px; font-weight: 700; color: ${COLORS.gray900}; 
        margin-bottom: 30px; text-align: center; width: 100%;
    }
    
    /* Ошибки */
    .upload-form-group.auth-group { margin-bottom: 30px; position: relative; } /* Уменьшили отступ */
    .auth-error-text {
        position: absolute; top: 45px; left: 4px;
        color: #d93025; font-size: 12px; font-weight: 500;
        white-space: nowrap;
    }
    
    .auth-switch-text {
        text-align: center; font-size: 13px; color: ${COLORS.gray600};
        margin: 4px 0 16px 0; /* Уменьшили расстояние до кнопки */
        cursor: pointer; transition: color 0.2s;
    }
    .auth-switch-text:hover { color: ${COLORS.accent}; text-decoration: underline; }
    
    .btn-auth-submit {
        background: ${COLORS.accent}; color: ${COLORS.white}; border: none;
        padding: 12px; border-radius: 8px; font-size: 15px; font-weight: 600;
        cursor: pointer; width: 100%; transition: opacity 0.2s;
    }
    .btn-auth-submit:hover { opacity: 0.9; }
    .btn-auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-close-modal {
        position: absolute; top: 16px; right: 16px; background: none; border: none;
        cursor: pointer; color: ${COLORS.gray500};
    }
        
    /* --- АНИМАЦИЯ ТРЯСКИ И ТУЛТИП ДЛЯ AI --- */
    @keyframes shake-horizontal {
        0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
        10%, 50%, 90% { transform: translateX(-2px); }
        30%, 70%  { transform: translateX(2px); }
    }
    .shake-animation {
        animation: shake-horizontal 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    /* --- АНИМАЦИЯ ПОЯВЛЕНИЯ И ИСЧЕЗНОВЕНИЯ ТУЛТИПА --- */
    @keyframes tooltip-fade {
        0% { opacity: 0; }
        5.88% { opacity: 1; }  /* Конец появления (0.3 сек) */
        94.12% { opacity: 1; } /* Начало исчезновения (4.8 сек) */
        100% { opacity: 0; }   /* Полное исчезновение (5.1 сек) */
    }

    .ai-db-tooltip {
        position: absolute;
        bottom: 100%; 
        left: 0; /* Привязываем к левому краю, чтобы рос вправо */
        transform: translateY(-10px); /* Сдвигаем только вверх, убрали центрирование по X */
        background: #fae7e6;
        border: 1px solid #ff1100;
        color: #000000;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        
        /* ИСПРАВЛЕНИЯ ЗДЕСЬ: */
        white-space: normal; /* Разрешаем перенос текста */
        width: 240px; /* Фиксируем ширину, чтобы текст красиво перенесся */
        line-height: 1.4;
        
        pointer-events: none;
        z-index: 99999; /* Ставим поверх всех сайдбаров */
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);

        animation: tooltip-fade 5.1s linear forwards;
    }
    /* Маленький треугольник-хвостик вниз */
    .ai-db-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 20px; /* Сдвинули хвостик к левому краю */
        border-width: 5px;
        border-style: solid;
        border-color: #d93025 transparent transparent transparent;
    }

    /* --- ЛИЧНЫЙ КАБИНЕТ (USER PAGE) --- */
    .user-page-wrapper {
        flex: 1; display: flex; flex-direction: column; background: ${COLORS.white};
        overflow-y: auto; padding: 40px 24px; align-items: center; position: relative;
    }
    .btn-back-chat {
        position: absolute; top: 40px; left: 40px; background: transparent;
        border: 1px solid ${COLORS.gray200}; padding: 8px 16px; border-radius: 8px;
        font-weight: 600; color: ${COLORS.gray600}; cursor: pointer; transition: 0.2s;
        display: flex; align-items: center; gap: 8px;
    }
    .btn-back-chat:hover { background: ${COLORS.gray50}; color: ${COLORS.dark}; }
    
    .profile-header {
        text-align: center; margin-bottom: 40px; display: flex; flex-direction: column; align-items: center;
    }
    .profile-avatar {
        width: 80px; height: 80px; background: ${COLORS.accent}; color: ${COLORS.white};
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 32px; font-weight: 700; margin-bottom: 16px;
        box-shadow: 0 8px 16px rgba(51, 153, 255, 0.3);
    }
    .profile-username { font-size: 28px; font-weight: 700; color: ${COLORS.dark}; }
    
    .plans-title { font-size: 20px; font-weight: 600; margin-bottom: 34px; color: ${COLORS.gray700}; text-align: center;}
    .plans-container {
        display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; width: 100%; align-items: stretch;
    }

    /* Карточка тарифа (базовая - для неактивных) */
    .plan-card {
        flex: 1; min-width: 300px; max-width: 400px; padding: 24px; border-radius: 20px;
        min-height: 200px; max-height: 300px;
        border: 2px solid ${COLORS.gray200}; background: ${COLORS.white};
        cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; flex-direction: column; position: relative;
        
        /* Уменьшаем неактивные карточки */
        transform: scale(0.92);
    }
    
    /* Наведение на неактивную карточку */
    .plan-card:not(.active):hover { 
        transform: scale(0.96) translateY(-4px); 
        box-shadow: 0 12px 24px ${COLORS.shadowLight08}; 
    }

    /* Текущая (активная) карточка */
    .plan-card.active { 
        cursor: default; 
        /* Увеличиваем активную карточку */
        transform: scale(1.05); 
        z-index: 10; /* Поднимаем ее над соседними карточками */
    }
    
    .plan-name { font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
    .plan-price { font-size: 18px; font-weight: 600; color: ${COLORS.gray500}; margin-bottom: 16px; }
    .plan-desc { font-size: 16px; color: ${COLORS.gray800}; line-height: 1.5; flex: 1; }
    
    .plan-badge {
        position: absolute; top: -16px; right: 24px; padding: 4px 12px;
        border-radius: 16px; font-size: 16px; font-weight: 700; color: ${COLORS.white};
    }

    /* Иерархия тарифов */
    /* FREE */
    .plan-card.tier-free { }
    .plan-card.tier-free.active { border-color: ${COLORS.gray400}; background: ${COLORS.gray50}; }
    
    /* PRO */
    .plan-card.tier-pro { border-color: ${COLORS.accent_ligher}; }
    .plan-card.tier-pro:hover { box-shadow: 0 12px 24px rgba(51, 153, 255, 0.15); }
    .plan-card.tier-pro.active { border-color: ${COLORS.accent_brighter}; background: #f0f7ff; box-shadow: 0 0 0 2px rgba(51, 153, 255, 0.2); }
    .plan-card.tier-pro .plan-name { color: ${COLORS.accent_brighter}; }
    
    /* ULTRA - Премиальный, но в стиле приложения */
    .plan-card.tier-ultra { 
        background: ${COLORS.white}; 
        border-color: ${COLORS.dark}; /* Строгая темная обводка */
        color: ${COLORS.dark}; 
        box-shadow: 0 4px 12px ${COLORS.shadowLight05};
    }
    .plan-card.tier-ultra .plan-name { 
        color: ${COLORS.dark}; /* Темный акцентный заголовок */
    }
    .plan-card.tier-ultra .plan-price { 
        color: ${COLORS.accent_brighter}; /* Цену выделяем самым ярким синим из палитры */
        font-weight: 700;
    }
    .plan-card.tier-ultra .plan-desc { 
        color: ${COLORS.gray700}; 
    }
    .plan-card.tier-ultra.active { 
        border-color: ${COLORS.dark}; 
        background: ${COLORS.gray50}; 
        /* Двойная обводка-тень для активного состояния */
        box-shadow: 0 0 0 1px ${COLORS.dark}, 0 12px 24px ${COLORS.shadowLight08}; 
    }
    .plan-card.tier-ultra:hover { 
        box-shadow: 0 16px 32px ${COLORS.shadowMedium10}; 
        /* Убрали отсюда transform, чтобы он не перебивал логику scale при наведении */
    }

    /* Мелкие правки для кликабельного имени в хэдере */
    .header-username { cursor: pointer; transition: color 0.2s; padding: 4px 8px; border-radius: 6px; }
    .header-username:hover { color: ${COLORS.accent} !important; }

    .msg-bubble-inline {
        display: flex;
        align-items: center; /* Центрируем по вертикали */
        gap: 10px; /* Расстояние между текстом и кнопкой */
    }

    /* Убираем стандартные отступы у текста, чтобы он не ломал выравнивание */
    .msg-bubble-inline p {
        margin: 0;
        line-height: 1.4;
    }
`;