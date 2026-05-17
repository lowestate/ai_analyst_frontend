import React, { useState } from 'react';

export const DbCredentialsForm = ({ credentials, onChange }: { credentials: any, onChange: (e: any) => void }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleTestConnection = async () => {
        if (!credentials.host || !credentials.database || !credentials.user) return;

        setTestState('loading');
        try {
            const res = await fetch('http://localhost:8001/test_connection', {
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