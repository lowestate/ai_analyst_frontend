export const COLORS = {
    // Базовые
    white: 'var(--card-bg)',
    black: 'var(--ink-color)',
    transparent: 'transparent',

    // Фирменные цвета Taible/dataoffice
    dark: 'var(--fg-color)',
    accent: 'var(--primary-color)',
    accent_brighter: 'var(--primary-color)',
    accent_ligher: 'var(--primary-soft)',

    // Серые оттенки в стиле ретро
    gray50: 'var(--bg-color)',
    gray100: 'var(--secondary-color)',
    gray150: 'var(--muted-color)',
    gray200: 'var(--border-color)',
    gray300: 'var(--border-color)',
    gray400: 'var(--muted-fg)',
    gray500: 'var(--muted-fg)',
    gray600: 'var(--muted-fg)',
    gray700: 'var(--fg-color)',
    gray800: 'var(--fg-color)',
    gray900: 'var(--fg-color)',

    // Статусы
    errorBg: 'oklch(0.96 0.02 20)',
    errorBorder: 'oklch(0.65 0.14 20)',

    // Тени и наложения (RGBA)
    shadowLight05: 'rgba(112, 72, 232, 0.04)',
    shadowLight08: 'rgba(112, 72, 232, 0.06)',
    shadowMedium10: 'rgba(112, 72, 232, 0.1)',
    shadowDark30: 'rgba(0,0,0,0.15)',
    overlay50: 'rgba(0,0,0,0.4)'
};

export const GLOBAL_STYLES = `
    :root {
        --col-left-flex: 5;
        --col-center-flex: 25;
        --col-right-flex: 5;
        
        --radius: 8px; /* rounded retro card corners */
        --bg-color: oklch(0.985 0.005 240);
        --fg-color: oklch(0.22 0.04 250);
        --card-bg: oklch(1 0 0);
        --card-fg: oklch(0.22 0.04 250);
        --primary-color: oklch(0.45 0.14 250);
        --primary-fg: oklch(0.985 0.005 240);
        --primary-soft: oklch(0.92 0.04 250);
        --secondary-color: oklch(0.96 0.01 240);
        --secondary-fg: oklch(0.3 0.05 250);
        --muted-color: oklch(0.95 0.008 240);
        --muted-fg: oklch(0.5 0.03 250);
        --accent-color: oklch(0.62 0.16 245);
        --accent-fg: oklch(0.99 0 0);
        --border-color: oklch(0.9 0.015 245);
        --input-color: oklch(0.9 0.015 245);
        --ring-color: oklch(0.55 0.14 250);
        
        --grid-line-color: oklch(0.88 0.02 245 / 0.6);
        --paper-bg: oklch(0.99 0.006 240);
        --ink-color: oklch(0.2 0.04 250);
        
        --shadow-paper: 0 1px 0 oklch(0.9 0.02 245), 0 10px 30px -12px oklch(0.4 0.1 250 / 0.18);
        --shadow-sticky: 4px 6px 0 oklch(0.6 0.12 245 / 0.18);
        
        --font-display: "Inter", ui-sans-serif, system-ui, sans-serif;
        --font-mono: "JetBrains Mono", ui-monospace, monospace;
        --font-pixel: "Press Start 2P", monospace;
    }
    .app-layout.sidebar-hidden {
        --col-left-flex: 3;
        --col-center-flex: 54;
        --col-right-flex: 12;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-display); }
    body { overflow: hidden; background-color: var(--bg-color); color: var(--fg-color); }

    .font-pixel {
        font-family: var(--font-pixel), monospace;
        display: inline-block;
        transform: scaleY(1.3);
        transform-origin: center left;
    }

    .app-root { display: flex; flex-direction: column; height: 100vh; width: 100vw; }
    .app-layout { display: flex; flex: 1; overflow: hidden; }

    /* --- ХЭДЕР (ШАПКА) --- */
    .app-header { 
        height: 56px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); 
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 24px; flex-shrink: 0; z-index: 100; 
    }
    .header-logo-container { display: flex; align-items: center; gap: 8px; user-select: none; }
    .header-title { font-family: var(--font-pixel); font-size: 11px; font-weight: bold; color: var(--fg-color); display: flex; align-items: center; line-height: 1; margin: 0; }
    .ai-highlight { color: var(--primary-color); margin-left: 4px; display: inline-block; }
    .header-logo-container svg { display: block; flex-shrink: 0 }
    .btn-login-header {
        background: var(--primary-color); color: var(--primary-fg); border: 1px solid var(--primary-color);
        padding: 8px 18px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600; font-size: 11px;
        cursor: pointer; transition: all 0.2s ease;
    }
    .btn-login-header:hover { opacity: 0.9; transform: translateY(-1px); }

    /* --- ЛЕВАЯ КОЛОНКА --- */
    .col-left { flex: var(--col-left-flex); background: var(--bg-color); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 18px 12px; overflow-y: hidden; transition: flex 0.3s ease, padding 0.3s ease; }
    .sidebar-hidden .col-left { padding: 18px 2px; }
    
    .sidebar-toggle-btn { background: transparent; border: none; cursor: pointer; color: var(--fg-color); display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 4px; transition: background 0.2s; flex-shrink: 0; }
    .sidebar-hidden .sidebar-toggle-btn { padding: 0; width: 24px; height: 24px; }
    .sidebar-toggle-btn:hover { background: var(--secondary-color); }
    
    .btn-upload { display: flex; align-items: center; justify-content: center; height: 36px; background: var(--card-bg); border: 1px solid var(--border-color); color: var(--fg-color); border-radius: var(--radius); padding: 12px; cursor: pointer; font-family: var(--font-mono); font-weight: 600; font-size: 12px; transition: all 0.2s ease; box-shadow: var(--shadow-paper); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; }
    .sidebar-hidden .btn-upload { padding: 0; width: 24px; height: 24px; font-size: 14px; flex: none; border-radius: 4px; }
    .btn-upload:hover { background: var(--primary-color); color: var(--primary-fg); border-color: var(--primary-color); }
    .btn-upload:active { transform: translateY(1px); box-shadow: none; }
    
    .sidebar-hidden .chat-list { opacity: 0; pointer-events: none; height: 0; margin: 0; padding: 0; }
    .chat-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 2px; transition: opacity 0.2s ease; opacity: 1; }
    .chat-list::-webkit-scrollbar { width: 4px; }
    .chat-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
    .chat-item { padding: 12px; border-radius: var(--radius); cursor: pointer; border: 1px solid transparent; background: transparent; transition: all 0.2s ease; }
    .chat-item:hover { background: var(--secondary-color); }
    .chat-item.active { background: var(--card-bg); border: 1px solid var(--border-color); box-shadow: var(--shadow-paper); }
    .chat-item .dataset-desc { font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--fg-color); margin-bottom: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chat-item .dataset-name { font-family: var(--font-mono); font-size: 10px; color: var(--muted-fg); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* --- ЦЕНТРАЛЬНАЯ КОЛОНКА --- */
    .col-center { flex: var(--col-center-flex); display: flex; flex-direction: column; background: var(--card-bg); position: relative; min-width: 0; transition: flex 0.3s ease; }
    .messages-wrapper { 
        flex: 1; display: flex; flex-direction: column; 
        background: var(--paper-bg); 
        background-image: linear-gradient(var(--grid-line-color) 1px, transparent 1px),
                          linear-gradient(90deg, var(--grid-line-color) 1px, transparent 1px);
        background-size: 32px 32px;
        background-position: -1px -1px;
        overflow-y: auto; padding: 24px 40px 32px 40px; 
        scrollbar-width: thin; scrollbar-color: var(--border-color) transparent; position: relative; 
    }
    .messages-wrapper::-webkit-scrollbar { width: 6px; display: block; }
    .messages-wrapper::-webkit-scrollbar-thumb { background-color: var(--border-color); border-radius: 10px; }
    .messages-wrapper::-webkit-scrollbar-thumb:hover { background-color: var(--muted-fg); }

    .msg-row { display: flex; width: 100%; margin-bottom: 24px; animation: slideUp 0.3s ease forwards; opacity: 0; transform: translateY(10px); }
    .msg-bubble {
        position: relative;
        border-radius: var(--radius);
        padding: 16px 20px;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.6;
    }
    .msg-row.agent { justify-content: flex-start; }
    .msg-bubble.agent { width: 73%; background: var(--card-bg); border: 1px solid var(--border-color); color: var(--fg-color); box-shadow: var(--shadow-paper); border-bottom-left-radius: 0; }
    .msg-bubble.agent.error { background: var(--errorBg); border: 1px solid var(--errorBorder); color: var(--errorBorder); box-shadow: none; font-family: var(--font-mono); }
    .msg-bubble.warning { background: oklch(0.97 0.06 80); border: 1px solid oklch(0.85 0.12 80); color: oklch(0.4 0.1 80); box-shadow: none; }
    .msg-row.user { justify-content: flex-end; }
    .msg-bubble.user { max-width: 60%; background: var(--secondary-color); color: var(--fg-color); border: 1px solid var(--border-color); border-bottom-right-radius: 0; box-shadow: var(--shadow-paper); font-weight: 500; }

    /* Инпут */
    .input-container { padding: 0 20px; display: flex; justify-content: center; background: var(--card-bg); border-top: 1px solid var(--border-color); }
    .input-box { height: 48px; width: 100%; display: flex; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; transition: all 0.2s ease; }
    .input-box:focus-within { border-color: var(--primary-color); background: var(--card-bg); box-shadow: 0 0 0 3px var(--primary-soft); }
    .input-box input { flex: 1; border: none; padding: 0 20px; outline: none; font-size: 14px; background: transparent; color: var(--fg-color); }
    .input-box input::placeholder { color: var(--muted-fg); font-style: italic; }
    .input-box button { background: var(--transparent); border: none; padding: 0 20px; font-size: 16px; cursor: pointer; color: var(--primary-color); transition: 0.2s; }
    .input-box button:hover { transform: scale(1.05); color: var(--primary-color); }

    /* Таблица Семпла */
    .sample-container { width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); margin-bottom: 24px; margin-top: 24px; z-index: 10; transition: all 0.3s ease; box-shadow: var(--shadow-paper); }
    .sample-container.pinned { position: sticky; top: 0; z-index: 50; box-shadow: var(--shadow-paper); border-top: none; border-radius: 0; }
    .sample-container.hidden-state { opacity: 0.8; }
    .sample-controls { display: flex; gap: 10px; height: 40px; padding: 6px 16px; border-bottom: 1px solid var(--border-color); background: var(--secondary-color); align-items: center; }
    .sample-btn { padding: 6px 12px; border: 1px solid var(--border-color); background: var(--card-bg); border-radius: 4px; cursor: pointer; font-family: var(--font-mono); font-size: 11px; font-weight: 500; transition: 0.2s; color: var(--fg-color); }
    .sample-btn:hover { background: var(--secondary-color); }
    .sample-btn.active { background: var(--primary-color); color: var(--primary-fg); border-color: var(--primary-color); }
    .table-wrapper { overflow-x: auto; overflow-y: hidden; transition: max-height 0.4s ease; max-height: 350px; background: var(--card-bg); display: block; }
    .table-wrapper::-webkit-scrollbar-track { background: var(--transparent); margin: 0 10px; }
    .table-wrapper::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; border: 2px solid var(--card-bg); }
    .table-wrapper::-webkit-scrollbar-thumb:hover { background: var(--muted-fg); }
    .table-wrapper.collapsed { max-height: 0; overflow: hidden; }
    
    .sample-table { width: 100%; border-collapse: collapse; background: var(--card-bg); }
    .sample-table th, .sample-table td { border-bottom: 1px solid var(--border-color); padding: 8px 12px; text-align: left; font-size: 12px; white-space: nowrap; }
    .sample-table th { background: var(--secondary-color); font-family: var(--font-mono); font-weight: 600; color: var(--primary-color); position: sticky; top: 0; }
    .sample-table tr:hover td { background: var(--secondary-color); }

    /* --- ПРАВАЯ КОЛОНКА --- */
    .col-right { flex: var(--col-right-flex); background: var(--bg-color); border-left: 1px solid var(--border-color); overflow-y: auto; display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 20px; min-width: 0; transition: flex 0.3s ease; }
    .col-right::-webkit-scrollbar { width: 4px; }
    .col-right::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
    .chart-preview-box { width: 85%; aspect-ratio: 4/3; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); box-shadow: var(--shadow-paper); cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; color: var(--fg-color); font-family: var(--font-mono); font-size: 11px; font-weight: 500; text-align: center; }
    .chart-preview-box:hover { transform: translateY(-2px); box-shadow: var(--shadow-sticky); border-color: var(--primary-color); color: var(--primary-color); }

    /* --- МОДАЛЬНОЕ ОКНО И ФОРМА ЗАГРУЗКИ --- */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--overlay50); backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; animation: fadeIn 0.2s forwards; }
    .modal-content { background: var(--card-bg); padding: 24px; border-radius: var(--radius); border: 1px solid var(--border-color); width: 90vw; max-width: 1400px; max-height: 90vh; overflow: auto; transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: var(--shadow-paper); position: relative; }
    
    .upload-modal { background: var(--card-bg); padding: 32px; border-radius: var(--radius); border: 1px solid var(--border-color); width: 500px; max-width: 90vw; box-shadow: var(--shadow-paper); transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative; }
    .upload-tabs { display: flex; gap: 24px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px; }
    .upload-tab { padding: 8px 0; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-family: var(--font-mono); font-weight: 600; color: var(--muted-fg); font-size: 13px; transition: 0.2s; }
    .upload-tab:hover { color: var(--fg-color); }
    .upload-tab.active { border-bottom-color: var(--primary-color); color: var(--primary-color); }
    .upload-form-group { margin-bottom: 16px; }
    .upload-input { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 13px; background: var(--bg-color); outline: none; transition: border-color 0.2s; color: var(--fg-color); }
    .upload-input:focus { border-color: var(--primary-color); background: var(--card-bg); }
    .file-drop-area { border: 2px dashed var(--border-color); border-radius: var(--radius); padding: 40px 20px; text-align: center; cursor: pointer; background: var(--bg-color); transition: 0.2s; }
    .file-drop-area:hover { border-color: var(--primary-color); background: var(--card-bg); }
    .file-drop-text { color: var(--fg-color); font-size: 13px; font-weight: 500; font-family: var(--font-mono); }
    .btn-submit-container { display: flex; justify-content: center; margin-top: 32px; }
    .btn-submit { background: var(--primary-color); color: var(--primary-fg); padding: 12px 40px; border-radius: var(--radius); font-family: var(--font-mono); font-weight: 600; font-size: 13px; border: 1px solid var(--primary-color); cursor: pointer; transition: 0.2s; box-shadow: var(--shadow-paper); }
    .btn-submit:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-submit:disabled { background: var(--border-color); border-color: var(--border-color); cursor: not-allowed; transform: none; box-shadow: none; color: var(--muted-fg); }

    /* --- АНИМАЦИИ --- */
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes scaleUp { to { transform: scale(1); } }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

    /* Markdown стили внутри сообщений */
    .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 13px; display: block; overflow-x: auto; max-width: 100%; border-radius: var(--radius); box-shadow: 0 0 0 1px var(--border-color); }
    .markdown-body th, .markdown-body td { border-bottom: 1px solid var(--border-color); padding: 10px 14px; }
    .markdown-body th { background-color: var(--secondary-color); text-align: left; font-family: var(--font-mono); font-weight: 600; color: var(--fg-color); }
    .markdown-body tr:last-child td { border-bottom: none; }
    .markdown-body p { margin-bottom: 12px; }
    .markdown-body p:last-child { margin-bottom: 0; }
    .markdown-body h3 { margin-bottom: 12px; margin-top: 20px; font-family: var(--font-mono); font-size: 13px; font-weight: bold; color: var(--fg-color); text-transform: uppercase; letter-spacing: 0.05em; }
    .markdown-body ul { margin-left: 24px; margin-bottom: 12px; }
    .markdown-body table::-webkit-scrollbar { height: 6px; }
    .markdown-body table::-webkit-scrollbar-track { background: var(--transparent); margin: 0 4px; }
    .markdown-body table::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
    .markdown-body ol, .markdown-body ul { padding-left: 24px; margin-top: 8px; margin-bottom: 8px; }
    .markdown-body li { margin-bottom: 6px; line-height: 1.5; }
    .markdown-body li:last-child { margin-bottom: 0; }

    /* --- iOS Toggle для AI --- */
    .toggle-switch { position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .3s; border-radius: 20px; }
    .toggle-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.15); }
    .toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color); }
    .toggle-switch.disabled { opacity: 0.5; cursor: not-allowed; }
    .toggle-switch.disabled .toggle-slider { cursor: not-allowed; }
    .toggle-switch input:checked + .toggle-slider:before { transform: translateX(14px); }
    .ai-toggle-container { display: flex; align-items: center; gap: 8px; margin-left: 8px; align-self: flex-start; cursor: pointer; }
    .ai-toggle-label { font-size: 12px; font-family: var(--font-mono); font-weight: 600; color: var(--fg-color); user-select: none; margin-bottom: 2px; }

    /* --- ИНПУТ С ПАРОЛЕМ И ГЛАЗИКОМ --- */
    .password-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
    .password-wrapper .upload-input { padding-right: 40px; }
    .eye-btn { position: absolute; right: 12px; background: none; border: none; cursor: pointer; color: var(--muted-fg); display: flex; align-items: center; justify-content: center; padding: 4px; transition: color 0.2s ease; }
    .eye-btn:hover { color: var(--fg-color); }
    .eye-slash { stroke-dasharray: 30; stroke-dashoffset: 0; transition: stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .eye-btn.open .eye-slash { stroke-dashoffset: 30; }

    /* --- КНОПКА ТЕСТА ПОДКЛЮЧЕНИЯ --- */
    .test-conn-btn {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: 12px 16px; border-radius: var(--radius); font-size: 13px; font-family: var(--font-mono); font-weight: 600;
        cursor: pointer; transition: all 0.2s ease; border: 1px solid;
        margin-top: 16px;
    }
    .test-conn-btn.idle { background: var(--bg-color); color: var(--fg-color); border-color: var(--border-color); }
    .test-conn-btn.idle:hover { background: var(--secondary-color); border-color: var(--border-color); }
    .test-conn-btn.loading { opacity: 0.7; cursor: wait; }
    .test-conn-btn.success { background: oklch(0.96 0.04 140); color: oklch(0.4 0.1 140); border-color: oklch(0.85 0.12 140); cursor: default; }
    .test-conn-btn.error { background: oklch(0.96 0.04 20); color: oklch(0.4 0.1 20); border-color: oklch(0.85 0.12 20); cursor: default; }

    /* --- ТУЛТИП С ОШИБКОЙ --- */
    .error-tooltip {
        position: absolute; right: 0; bottom: calc(100% + 12px);
        width: 500px; max-height: 400px; background: var(--card-bg);
        border: 1px solid oklch(0.6 0.15 20); border-radius: var(--radius);
        box-shadow: var(--shadow-paper);
        padding: 16px; z-index: 100;
        display: flex; flex-direction: column; 
        opacity: 0; visibility: hidden; transform: translateY(10px);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: text;
    }
    .error-icon-wrapper:hover .error-tooltip { opacity: 1; visibility: visible; transform: translateY(0); }
    .tooltip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: var(--fg-color); padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
    .copy-btn { background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; cursor: pointer; color: var(--fg-color); display: flex; align-items: center; transition: 0.2s; }
    .copy-btn:hover { background: var(--secondary-color); color: var(--primary-color); border-color: var(--primary-color); }
    .tooltip-body { overflow-y: auto; font-family: var(--font-mono); font-size: 11px; line-height: 1.5; color: oklch(0.5 0.15 20); white-space: pre-wrap; padding-right: 4px; text-align: left; word-break: break-all; }

    /* --- ERD ДИАГРАММА --- */
    .erd-container { width: 100%; height: 500px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; margin: 24px 0; position: relative; }
    .erd-table-node { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); box-shadow: var(--shadow-paper); min-width: 260px; font-family: var(--font-mono); }
    .erd-table-header { background: var(--primary-color); color: var(--primary-fg); padding: 12px 16px; font-weight: 600; font-size: 13px; border-top-left-radius: calc(var(--radius) - 1px); border-top-right-radius: calc(var(--radius) - 1px); text-align: center; letter-spacing: 0.05em; }
    .erd-table-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-bottom: 1px solid var(--border-color); font-size: 12px; }
    .erd-table-row:last-child { border-bottom: none; }
    .erd-col-name { display: flex; align-items: center; gap: 8px; color: var(--fg-color); font-weight: 500; }
    .erd-col-type { color: var(--muted-fg); }
    .erd-badge { font-size: 10px; font-weight: 700; padding: 3px 6px; border-radius: 4px; line-height: 1; display: inline-block; }
    .erd-badge.pk { background: oklch(0.95 0.08 95); color: oklch(0.3 0.08 95); border: 1px solid oklch(0.9 0.08 95); }
    .erd-badge.fk { background: var(--primary-soft); color: var(--primary-color); border: 1px solid var(--border-color); }

    /* --- АВТОРИЗАЦИЯ (Модалка) --- */
    .auth-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .auth-modal { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); width: 400px; max-width: 90vw; padding: 32px; box-shadow: var(--shadow-paper); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    .auth-form-container { display: flex; flex-direction: column; justify-content: center; width: 100%; }
    .auth-title { font-family: var(--font-pixel); font-size: 12px; font-weight: 700; color: var(--fg-color); margin-bottom: 30px; text-align: center; width: 100%; display: inline-block; transform: scaleY(1.3); transform-origin: center center; }
    .upload-form-group.auth-group { margin-bottom: 30px; position: relative; }
    .auth-error-text { position: absolute; top: 45px; left: 4px; color: oklch(0.5 0.15 20); font-size: 11px; font-weight: 500; font-family: var(--font-mono); }
    .auth-switch-text { text-align: center; font-size: 12px; font-family: var(--font-mono); color: var(--muted-fg); margin: 20px 0 16px 0; cursor: pointer; transition: color 0.2s; }
    .auth-switch-text:hover { color: var(--primary-color); text-decoration: underline; }
    .btn-auth-submit { background: var(--primary-color); color: var(--primary-fg); border: 1px solid var(--primary-color); padding: 12px; border-radius: var(--radius); font-family: var(--font-mono); font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; transition: opacity 0.2s; }
    .btn-auth-submit:hover { opacity: 0.9; }
    .btn-close-modal { position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; color: var(--muted-fg); }

    .ai-db-tooltip {
        position: absolute; bottom: 100%; left: 0; transform: translateY(-10px);
        background: oklch(0.96 0.04 20); border: 1px solid oklch(0.85 0.12 20); color: oklch(0.3 0.1 20);
        padding: 8px 12px; border-radius: 6px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;
        white-space: normal; width: 240px; line-height: 1.4; pointer-events: none; z-index: 99999; box-shadow: var(--shadow-paper);
        animation: tooltip-fade 5.1s linear forwards;
    }
    .ai-db-tooltip::after {
        content: ''; position: absolute; top: 100%; left: 20px;
        border-width: 5px; border-style: solid; border-color: oklch(0.85 0.12 20) transparent transparent transparent;
    }

    /* --- ЛИЧНЫЙ КАБИНЕТ (USER PAGE) --- */
    .user-page-wrapper { flex: 1; display: flex; flex-direction: column; background: var(--bg-color); overflow-y: auto; padding: 40px 24px; align-items: center; position: relative; }
    .btn-back-chat { position: absolute; top: 40px; left: 40px; background: var(--card-bg); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--fg-color); cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-paper); }
    .btn-back-chat:hover { background: var(--secondary-color); }
    
    .profile-header { text-align: center; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; }
    .profile-avatar { width: 80px; height: 80px; background: var(--primary-color); color: var(--primary-fg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin-bottom: 16px; box-shadow: var(--shadow-paper); }
    .profile-username { font-size: 24px; font-weight: 800; color: var(--fg-color); }
    
    .plans-title { font-size: 16px; font-family: var(--font-pixel); font-weight: 600; margin-bottom: 34px; color: var(--fg-color); text-align: center; display: inline-block; transform: scaleY(1.3); transform-origin: center center; }
    .plans-container { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; width: 100%; align-items: stretch; }

    .plan-card {
        flex: 1; min-width: 300px; max-width: 400px; padding: 24px; border-radius: var(--radius); min-height: 200px; max-height: 300px;
        border: 1px solid var(--border-color); background: var(--card-bg); cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; flex-direction: column; position: relative; transform: scale(0.95); box-shadow: var(--shadow-paper);
    }
    .plan-card:not(.active):hover { transform: scale(0.98) translateY(-2px); box-shadow: var(--shadow-sticky); }
    .plan-card.active { cursor: default; transform: scale(1.02); z-index: 10; border-color: var(--primary-color); box-shadow: var(--shadow-sticky); }
    
    .plan-name { font-family: var(--font-pixel); font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; color: var(--fg-color); display: inline-block; transform: scaleY(1.3); transform-origin: center left; }
    .plan-price { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--muted-fg); margin-bottom: 16px; }
    .plan-desc { font-size: 13px; color: var(--fg-color); line-height: 1.5; flex: 1; }
    .plan-badge { position: absolute; top: -12px; right: 24px; padding: 4px 12px; border-radius: 12px; font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--primary-fg); background: var(--primary-color); }

    .plan-card.tier-free.active { border-color: var(--border-color); background: var(--secondary-color); }
    .plan-card.tier-pro .plan-name { color: var(--primary-color); }
    .plan-card.tier-pro.active { background: var(--secondary-color); }
    
    .plan-card.tier-ultra { border-color: var(--accent-color); }
    .plan-card.tier-ultra .plan-name { color: var(--accent-color); }
    .plan-card.tier-ultra.active { background: var(--secondary-color); }

    .header-username { font-family: var(--font-mono); cursor: pointer; transition: color 0.2s; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 13px; }
    .header-username:hover { color: var(--primary-color) !important; background: var(--secondary-color); }

    .msg-bubble-inline { display: flex; align-items: center; gap: 10px; }
    .msg-bubble-inline p { margin: 0; line-height: 1.4; }
`;