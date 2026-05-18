import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../globasStyles';

interface LLMRequest {
    request_id: string;
    user_id: number;
    chat_id: string;
    input_text: string;
    input_tokens: number;
    output_tokens: number;
    request_status: number;
    model_name: string;
    created_at: string;
    duration_ms: number;
    initiator: string;
    error_message: string;
}

interface User {
    user_id: number;
    username: string;
    plan_id: number;
    is_active: boolean;
    role: string;
}

interface Plan {
    plan_id: number;
    plan_name: string;
}

const REQUEST_COLUMNS = [
    { key: 'request_id', label: 'ID запроса' },
    { key: 'user_id', label: 'ID юзера' },
    { key: 'chat_id', label: 'ID чата' },
    { key: 'input_text', label: 'Запрос' },
    { key: 'input_tokens', label: 'Вх. токены' },
    { key: 'output_tokens', label: 'Исх. токены' },
    { key: 'request_status', label: 'Статус' },
    { key: 'model_name', label: 'Модель' },
    { key: 'created_at', label: 'Создан' },
    { key: 'duration_ms', label: 'Длительность' },
    { key: 'initiator', label: 'Инициатор' },
    { key: 'error_message', label: 'Ошибка' }
];

const USER_COLUMNS = [
    { key: 'user_id', label: 'ID юзера' },
    { key: 'username', label: 'Имя пользователя' },
    { key: 'plan_id', label: 'Тарифный план' },
    { key: 'is_active', label: 'Статус' },
    { key: 'role', label: 'Роль' }
];

const formatDuration = (ms: number): string => {
    if (ms === undefined || ms === null) return '-';
    if (ms < 1000) {
        return `${ms} мс`;
    }
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    if (minutes > 0) {
        return `${minutes} мин. ${seconds} сек.`;
    } else {
        if (milliseconds > 0) {
            return `${seconds} сек. ${milliseconds} мс`;
        }
        return `${seconds} сек.`;
    }
};

export const AdminPanel: React.FC = () => {
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    // Вкладки
    const [activeTab, setActiveTab] = useState<'llm_requests' | 'users'>('llm_requests');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Данные планов
    const [plans, setPlans] = useState<Plan[]>([]);

    // Состояния для запросов LLM
    const [requests, setRequests] = useState<LLMRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const limit = 10;

    const [sortCol, setSortCol] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const [filterCol, setFilterCol] = useState<string | null>(null);
    const [filterVal, setFilterVal] = useState<string>('');
    const [activeFilterInputs, setActiveFilterInputs] = useState<{ [key: string]: boolean }>({});
    const [filterInputs, setFilterInputs] = useState<{ [key: string]: string }>({});
    const [collapsedCols, setCollapsedCols] = useState<{ [key: string]: boolean }>({});

    // Состояния для пользователей
    const [users, setUsers] = useState<User[]>([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersLoading, setUsersLoading] = useState(true);

    const [usersPage, setUsersPage] = useState(1);

    const [usersSortCol, setUsersSortCol] = useState<string>('user_id');
    const [usersSortOrder, setUsersSortOrder] = useState<'ASC' | 'DESC'>('ASC');

    const [usersFilterCol, setUsersFilterCol] = useState<string | null>(null);
    const [usersFilterVal, setUsersFilterVal] = useState<string>('');
    const [usersActiveFilterInputs, setUsersActiveFilterInputs] = useState<{ [key: string]: boolean }>({});
    const [usersFilterInputs, setUsersFilterInputs] = useState<{ [key: string]: string }>({});
    const [usersCollapsedCols, setUsersCollapsedCols] = useState<{ [key: string]: boolean }>({});

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Загрузка планов при монтировании
    const fetchPlans = async () => {
        try {
            const res = await fetch('http://localhost:8001/admin/plans');
            if (res.ok) {
                const data = await res.json();
                setPlans(data || []);
            }
        } catch (err) {
            console.error('Не удалось загрузить тарифные планы', err);
        }
    };

    // Загрузка логов запросов LLM
    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (page - 1) * limit;
            let url = `http://localhost:8001/admin/llm_requests?limit=${limit}&offset=${offset}&sort_col=${sortCol}&sort_order=${sortOrder}`;
            if (filterCol && filterVal) {
                url += `&filter_col=${filterCol}&filter_val=${encodeURIComponent(filterVal)}`;
            }

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Не удалось загрузить логи llm_requests');
            }
            const data = await res.json();
            setRequests(data.data || []);
            setTotal(data.total || 0);
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при загрузке');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка пользователей
    const fetchUsers = async () => {
        usersLoading || setUsersLoading(true);
        try {
            const offset = (usersPage - 1) * limit;
            let url = `http://localhost:8001/admin/users?limit=${limit}&offset=${offset}&sort_col=${usersSortCol}&sort_order=${usersSortOrder}`;
            if (usersFilterCol && usersFilterVal) {
                url += `&filter_col=${usersFilterCol}&filter_val=${encodeURIComponent(usersFilterVal)}`;
            }

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Не удалось загрузить список пользователей');
            }
            const data = await res.json();
            setUsers(data.data || []);
            setUsersTotal(data.total || 0);
        } catch (err: any) {
            showToast(err.message || 'Ошибка загрузки пользователей', 'error');
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        if (activeTab === 'llm_requests') {
            fetchRequests();
        }
    }, [page, sortCol, sortOrder, filterCol, filterVal, activeTab]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [usersPage, usersSortCol, usersSortOrder, usersFilterCol, usersFilterVal, activeTab]);

    // Обработчики для LLM-запросов
    const handleSort = (colKey: string) => {
        if (sortCol === colKey) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortCol(colKey);
            setSortOrder('DESC');
        }
        setPage(1);
    };

    const toggleFilterInput = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveFilterInputs(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const toggleCollapse = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedCols(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const handleFilterChange = (colKey: string, val: string) => {
        setFilterInputs(prev => ({
            ...prev,
            [colKey]: val
        }));
    };

    const applyFilter = (colKey: string) => {
        const val = filterInputs[colKey] || '';
        if (val.trim() === '') {
            setFilterCol(null);
            setFilterVal('');
        } else {
            setFilterCol(colKey);
            setFilterVal(val);
        }
        setPage(1);
    };

    const clearFilter = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFilterInputs(prev => ({
            ...prev,
            [colKey]: ''
        }));
        if (filterCol === colKey) {
            setFilterCol(null);
            setFilterVal('');
        }
        setActiveFilterInputs(prev => ({
            ...prev,
            [colKey]: false
        }));
        setPage(1);
    };

    const getCellStyle = (colKey: string, customStyles: React.CSSProperties = {}): React.CSSProperties => {
        const isCollapsed = collapsedCols[colKey];
        if (isCollapsed) {
            return {
                ...customStyles,
                maxWidth: '0px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            };
        }
        return customStyles;
    };

    // Обработчики для Пользователей
    const handleUserSort = (colKey: string) => {
        if (usersSortCol === colKey) {
            setUsersSortOrder(usersSortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setUsersSortCol(colKey);
            setUsersSortOrder('ASC');
        }
        setUsersPage(1);
    };

    const toggleUserFilterInput = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setUsersActiveFilterInputs(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const toggleUserCollapse = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setUsersCollapsedCols(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const handleUserFilterChange = (colKey: string, val: string) => {
        setUsersFilterInputs(prev => ({
            ...prev,
            [colKey]: val
        }));
    };

    const applyUserFilter = (colKey: string) => {
        const val = usersFilterInputs[colKey] || '';
        if (val.trim() === '') {
            setUsersFilterCol(null);
            setUsersFilterVal('');
        } else {
            setUsersFilterCol(colKey);
            setUsersFilterVal(val);
        }
        setUsersPage(1);
    };

    const clearUserFilter = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setUsersFilterInputs(prev => ({
            ...prev,
            [colKey]: ''
        }));
        if (usersFilterCol === colKey) {
            setUsersFilterCol(null);
            setUsersFilterVal('');
        }
        setUsersActiveFilterInputs(prev => ({
            ...prev,
            [colKey]: false
        }));
        setUsersPage(1);
    };

    const getUserCellStyle = (colKey: string, customStyles: React.CSSProperties = {}): React.CSSProperties => {
        const isCollapsed = usersCollapsedCols[colKey];
        if (isCollapsed) {
            return {
                ...customStyles,
                maxWidth: '0px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            };
        }
        return customStyles;
    };

    const handleUserUpdate = async (targetUserId: number, newRole: string, newPlanId: number, newIsActive: boolean) => {
        try {
            const res = await fetch(`http://localhost:8001/admin/users/${targetUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: newRole,
                    plan_id: newPlanId,
                    is_active: newIsActive
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Не удалось обновить пользователя');
            }

            setUsers(prev =>
                prev.map(u => (u.user_id === targetUserId ? { ...u, role: newRole, plan_id: newPlanId, is_active: newIsActive } : u))
            );
            showToast('Данные пользователя успешно обновлены!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Ошибка обновления данных', 'error');
        }
    };


    const totalPages = Math.ceil(total / limit) || 1;
    const totalUsersPages = Math.ceil(usersTotal / limit) || 1;

    return (
        <div className="user-page-wrapper" style={{ padding: '40px 16px', maxWidth: '100vw', overflowX: 'hidden' }}>
            {/* Всплывающий Тост-уведомление */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        background: toast.type === 'success' ? '#e6f4ea' : '#fce8e6',
                        border: `1px solid ${toast.type === 'success' ? '#137333' : '#c5221f'}`,
                        color: toast.type === 'success' ? '#137333' : '#c5221f',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        fontWeight: 600,
                        fontSize: '14px',
                        animation: 'slideIn 0.3s ease-out'
                    }}
                >
                    {toast.message}
                </div>
            )}

            <Link
                to="/"
                className="btn-back-chat"
                style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Вернуться в чат
            </Link>

            <div className="profile-header" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.gray900, marginBottom: '8px' }}>
                    Админ-панель
                </h1>
                <p style={{ fontSize: '15px', color: COLORS.gray500 }}>
                    Управление пользователями и мониторинг системных логов чата
                </p>
            </div>

            {error && activeTab === 'llm_requests' && (
                <div style={{
                    background: COLORS.errorBg,
                    border: `1px solid ${COLORS.errorBorder}`,
                    color: '#c5221f',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    maxWidth: '1400px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {error}
                </div>
            )}

            {/* Вкладки в стиле Google Chrome */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                background: '#e2e8f0', 
                padding: '8px 16px 0 16px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderBottom: `1px solid ${COLORS.gray200}`,
                gap: '4px',
                maxWidth: '1400px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Вкладка 1: Логи запросов */}
                <div
                    onClick={() => setActiveTab('llm_requests')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === 'llm_requests' ? 600 : 500,
                        color: activeTab === 'llm_requests' ? COLORS.gray900 : COLORS.gray600,
                        background: activeTab === 'llm_requests' ? COLORS.white : 'transparent',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        border: activeTab === 'llm_requests' ? `1px solid ${COLORS.gray200}` : 'none',
                        borderBottom: activeTab === 'llm_requests' ? `1px solid ${COLORS.white}` : 'none',
                        marginBottom: '-1px',
                        position: 'relative',
                        zIndex: activeTab === 'llm_requests' ? 2 : 1,
                        transition: 'background-color 0.2s',
                        userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (activeTab !== 'llm_requests') {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== 'llm_requests') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Логи LLM запросов
                </div>

                {/* Вкладка 2: Пользователи */}
                <div
                    onClick={() => setActiveTab('users')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === 'users' ? 600 : 500,
                        color: activeTab === 'users' ? COLORS.gray900 : COLORS.gray600,
                        background: activeTab === 'users' ? COLORS.white : 'transparent',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        border: activeTab === 'users' ? `1px solid ${COLORS.gray200}` : 'none',
                        borderBottom: activeTab === 'users' ? `1px solid ${COLORS.white}` : 'none',
                        marginBottom: '-1px',
                        position: 'relative',
                        zIndex: activeTab === 'users' ? 2 : 1,
                        transition: 'background-color 0.2s',
                        userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (activeTab !== 'users') {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== 'users') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Пользователи
                </div>
            </div>

            {/* Контейнер содержимого */}
            <div style={{
                background: COLORS.white,
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                border: `1px solid ${COLORS.gray200}`,
                borderTop: 'none', 
                boxShadow: `0 4px 12px ${COLORS.shadowLight05}`,
                width: '100%',
                maxWidth: '1400px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
            }}>
                {activeTab === 'llm_requests' ? (
                    <>
                        {/* Таблица LLM-запросов */}
                        <div className="table-wrapper" style={{ overflowX: 'auto', maxHeight: '60vh', WebkitOverflowScrolling: 'touch' }}>
                            <table className="sample-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {REQUEST_COLUMNS.map(col => {
                                            const isSorted = sortCol === col.key;
                                            const isFiltered = filterCol === col.key && filterVal !== '';
                                            const showInput = activeFilterInputs[col.key];
                                            const isCollapsed = collapsedCols[col.key];

                                            return (
                                                <th 
                                                    key={col.key} 
                                                    style={{ 
                                                        padding: '12px 16px', 
                                                        userSelect: 'none', 
                                                        position: 'relative',
                                                        whiteSpace: 'nowrap',
                                                        width: isCollapsed ? '1px' : undefined
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                            <span
                                                                onClick={() => handleSort(col.key)}
                                                                style={{ cursor: 'pointer', flex: 1, fontWeight: 600 }}
                                                            >
                                                                {col.label}
                                                            </span>

                                                            {/* Иконки схлопывания, сортировки и фильтра */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span
                                                                    onClick={(e) => toggleCollapse(col.key, e)}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: isCollapsed ? COLORS.accent : COLORS.gray400,
                                                                        display: 'inline-flex',
                                                                        padding: '2px',
                                                                        borderRadius: '4px',
                                                                        transition: 'background-color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    title={isCollapsed ? "Развернуть столбец" : "Свернуть столбец"}
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                        {isCollapsed ? (
                                                                            <>
                                                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                                                <polyline points="9 21 3 21 3 15"></polyline>
                                                                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                                                                <line x1="3" y1="21" x2="10" y2="14"></line>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <polyline points="4 14 10 14 10 20"></polyline>
                                                                                <polyline points="20 10 14 10 14 4"></polyline>
                                                                                <line x1="14" y1="10" x2="21" y2="3"></line>
                                                                                <line x1="10" y1="14" x2="3" y2="21"></line>
                                                                            </>
                                                                        )}
                                                                    </svg>
                                                                </span>

                                                                <span
                                                                    onClick={() => handleSort(col.key)}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: isSorted ? COLORS.accent : COLORS.gray400,
                                                                        fontSize: '11px',
                                                                        display: 'inline-flex'
                                                                    }}
                                                                    title="Сортировать"
                                                                >
                                                                    {isSorted ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                                                                </span>

                                                                <span
                                                                    onClick={(e) => toggleFilterInput(col.key, e)}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: isFiltered ? COLORS.accent_brighter : COLORS.gray400,
                                                                        display: 'inline-flex'
                                                                    }}
                                                                    title="Фильтровать"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={isFiltered ? COLORS.accent : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {showInput && (
                                                            <div
                                                                onClick={e => e.stopPropagation()}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    marginTop: '6px'
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={filterInputs[col.key] || ''}
                                                                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && applyFilter(col.key)}
                                                                    placeholder="Поиск..."
                                                                    style={{
                                                                        width: '100px',
                                                                        padding: '4px 8px',
                                                                        fontSize: '12px',
                                                                        border: `1.5px solid ${COLORS.gray200}`,
                                                                        borderRadius: '6px',
                                                                        outline: 'none',
                                                                        fontFamily: 'inherit'
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => applyFilter(col.key)}
                                                                    style={{
                                                                        padding: '4px 6px',
                                                                        background: COLORS.dark,
                                                                        color: COLORS.white,
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '10px',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    ОК
                                                                </button>
                                                                <button
                                                                    onClick={(e) => clearFilter(col.key, e)}
                                                                    style={{
                                                                        padding: '4px 6px',
                                                                        background: '#f1f5f9',
                                                                        color: '#334155',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '10px',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    Х
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={REQUEST_COLUMNS.length} style={{ textAlign: 'center', padding: '40px' }}>
                                                <div className="loading-text">Загрузка логов...</div>
                                            </td>
                                        </tr>
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={REQUEST_COLUMNS.length} style={{ textAlign: 'center', padding: '40px', color: COLORS.gray500 }}>
                                                Записи не найдены
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.request_id}>
                                                <td style={getCellStyle('request_id', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray600, fontFamily: 'monospace' })} title={req.request_id}>
                                                    {req.request_id}
                                                </td>
                                                <td style={getCellStyle('user_id', { padding: '12px 16px', fontSize: '13px' })} title={String(req.user_id)}>
                                                    {req.user_id}
                                                </td>
                                                <td style={getCellStyle('chat_id', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray600, fontFamily: 'monospace' })} title={req.chat_id || ''}>
                                                    {req.chat_id || '-'}
                                                </td>
                                                <td style={getCellStyle('input_text', {
                                                    padding: '12px 16px',
                                                    fontSize: '13px',
                                                    maxWidth: '250px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                })} title={req.input_text}>
                                                    {req.input_text}
                                                </td>
                                                <td style={getCellStyle('input_tokens', { padding: '12px 16px', fontSize: '13px', textAlign: 'right' })} title={String(req.input_tokens || 0)}>
                                                    {req.input_tokens || 0}
                                                </td>
                                                <td style={getCellStyle('output_tokens', { padding: '12px 16px', fontSize: '13px', textAlign: 'right' })} title={String(req.output_tokens || 0)}>
                                                    {req.output_tokens || 0}
                                                </td>
                                                <td style={getCellStyle('request_status', { padding: '12px 16px', fontSize: '13px', textAlign: 'center' })} title={String(req.request_status)}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        background: req.request_status === 200 ? '#e6f4ea' : '#fce8e6',
                                                        color: req.request_status === 200 ? '#137333' : '#c5221f'
                                                    }}>
                                                        {req.request_status}
                                                    </span>
                                                </td>
                                                <td style={getCellStyle('model_name', { padding: '12px 16px', fontSize: '13px' })} title={req.model_name || ''}>
                                                    {req.model_name || '-'}
                                                </td>
                                                <td style={getCellStyle('created_at', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray500 })} title={req.created_at ? new Date(req.created_at).toLocaleString('ru-RU') : ''}>
                                                    {req.created_at ? new Date(req.created_at).toLocaleString('ru-RU') : '-'}
                                                </td>
                                                <td style={getCellStyle('duration_ms', { padding: '12px 16px', fontSize: '13px', textAlign: 'right' })} title={String(req.duration_ms)}>
                                                    {formatDuration(req.duration_ms)}
                                                </td>
                                                <td style={getCellStyle('initiator', { padding: '12px 16px', fontSize: '13px' })} title={req.initiator}>
                                                    {req.initiator}
                                                </td>
                                                <td style={getCellStyle('error_message', {
                                                    padding: '12px 16px',
                                                    fontSize: '13px',
                                                    maxWidth: '200px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    color: '#c5221f'
                                                })} title={req.error_message || ''}>
                                                    {req.error_message || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Пагинация LLM-запросов */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 24px',
                            borderTop: `1px solid ${COLORS.gray200}`,
                            background: COLORS.gray50
                        }}>
                            <span style={{ fontSize: '14px', color: COLORS.gray600 }}>
                                Показано с {total === 0 ? 0 : (page - 1) * limit + 1} по {Math.min(page * limit, total)} из {total} записей
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: page === 1 ? 0.5 : 1
                                    }}
                                >
                                    «
                                </button>
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: page === 1 ? 0.5 : 1
                                    }}
                                >
                                    Назад
                                </button>

                                <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.gray700, padding: '0 8px' }}>
                                    Страница {page} из {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={page === totalPages}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: page === totalPages ? 0.5 : 1
                                    }}
                                >
                                    Вперед
                                </button>
                                <button
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: page === totalPages ? 0.5 : 1
                                    }}
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Таблица Пользователей */}
                        <div className="table-wrapper" style={{ overflowX: 'auto', maxHeight: '60vh', WebkitOverflowScrolling: 'touch' }}>
                            <table className="sample-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {USER_COLUMNS.map(col => {
                                            const isSorted = usersSortCol === col.key;
                                            const isFiltered = usersFilterCol === col.key && usersFilterVal !== '';
                                            const showInput = usersActiveFilterInputs[col.key];
                                            const isCollapsed = usersCollapsedCols[col.key];

                                            return (
                                                <th 
                                                    key={col.key} 
                                                    style={{ 
                                                        padding: '12px 16px', 
                                                        userSelect: 'none', 
                                                        position: 'relative',
                                                        whiteSpace: 'nowrap',
                                                        width: isCollapsed ? '1px' : undefined
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                            <span
                                                                onClick={() => handleUserSort(col.key)}
                                                                style={{ cursor: 'pointer', flex: 1, fontWeight: 600 }}
                                                            >
                                                                {col.label}
                                                            </span>

                                                            {/* Иконки схлопывания, сортировки и фильтра */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span
                                                                    onClick={(e) => toggleUserCollapse(col.key, e)}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: isCollapsed ? COLORS.accent : COLORS.gray400,
                                                                        display: 'inline-flex',
                                                                        padding: '2px',
                                                                        borderRadius: '4px',
                                                                        transition: 'background-color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    title={isCollapsed ? "Развернуть столбец" : "Свернуть столбец"}
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                        {isCollapsed ? (
                                                                            <>
                                                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                                                <polyline points="9 21 3 21 3 15"></polyline>
                                                                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                                                                <line x1="3" y1="21" x2="10" y2="14"></line>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <polyline points="4 14 10 14 10 20"></polyline>
                                                                                <polyline points="20 10 14 10 14 4"></polyline>
                                                                                <line x1="14" y1="10" x2="21" y2="3"></line>
                                                                                <line x1="10" y1="14" x2="3" y2="21"></line>
                                                                            </>
                                                                        )}
                                                                    </svg>
                                                                </span>

                                                                <span
                                                                    onClick={() => handleUserSort(col.key)}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: isSorted ? COLORS.accent : COLORS.gray400,
                                                                        fontSize: '11px',
                                                                        display: 'inline-flex'
                                                                    }}
                                                                    title="Сортировать"
                                                                >
                                                                    {isSorted ? (usersSortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                                                                </span>

                                                                <span
                                                                    onClick={(e) => toggleUserFilterInput(col.key, e)}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: isFiltered ? COLORS.accent_brighter : COLORS.gray400,
                                                                        display: 'inline-flex'
                                                                    }}
                                                                    title="Фильтровать"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={isFiltered ? COLORS.accent : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {showInput && (
                                                            <div
                                                                onClick={e => e.stopPropagation()}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    marginTop: '6px'
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={usersFilterInputs[col.key] || ''}
                                                                    onChange={(e) => handleUserFilterChange(col.key, e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && applyUserFilter(col.key)}
                                                                    placeholder="Поиск..."
                                                                    style={{
                                                                        width: '100px',
                                                                        padding: '4px 8px',
                                                                        fontSize: '12px',
                                                                        border: `1.5px solid ${COLORS.gray200}`,
                                                                        borderRadius: '6px',
                                                                        outline: 'none',
                                                                        fontFamily: 'inherit'
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => applyUserFilter(col.key)}
                                                                    style={{
                                                                        padding: '4px 6px',
                                                                        background: COLORS.dark,
                                                                        color: COLORS.white,
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '10px',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    ОК
                                                                </button>
                                                                <button
                                                                    onClick={(e) => clearUserFilter(col.key, e)}
                                                                    style={{
                                                                        padding: '4px 6px',
                                                                        background: '#f1f5f9',
                                                                        color: '#334155',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '10px',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    Х
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersLoading ? (
                                        <tr>
                                            <td colSpan={USER_COLUMNS.length} style={{ textAlign: 'center', padding: '40px' }}>
                                                <div className="loading-text">Загрузка пользователей...</div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={USER_COLUMNS.length} style={{ textAlign: 'center', padding: '40px', color: COLORS.gray500 }}>
                                                Пользователи не найдены
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.user_id}>
                                                <td style={getUserCellStyle('user_id', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray600, fontFamily: 'monospace' })} title={String(u.user_id)}>
                                                    {u.user_id}
                                                </td>
                                                <td style={getUserCellStyle('username', { padding: '12px 16px', fontSize: '13px', fontWeight: 500 })} title={u.username}>
                                                    {u.username}
                                                </td>
                                                <td style={getUserCellStyle('plan_id', { padding: '8px 16px', fontSize: '13px' })}>
                                                    <select
                                                        value={u.plan_id}
                                                        onChange={(e) => handleUserUpdate(u.user_id, u.role, parseInt(e.target.value), u.is_active)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '13px',
                                                            borderRadius: '6px',
                                                            border: `1.5px solid ${COLORS.gray200}`,
                                                            background: COLORS.white,
                                                            outline: 'none',
                                                            cursor: 'pointer',
                                                            width: '100%',
                                                            fontFamily: 'inherit'
                                                        }}
                                                    >
                                                        {plans.length > 0 ? (
                                                            plans.map(p => (
                                                                <option key={p.plan_id} value={p.plan_id}>
                                                                    {p.plan_id} - {p.plan_name}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <option value={1}>1 - free</option>
                                                                <option value={2}>2 - pro</option>
                                                                <option value={3}>3 - ultra</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </td>
                                                <td style={getUserCellStyle('is_active', { padding: '8px 16px', fontSize: '13px' })}>
                                                    <select
                                                        disabled={currentUser?.id === u.user_id}
                                                        value={String(u.is_active)}
                                                        onChange={(e) => handleUserUpdate(u.user_id, u.role, u.plan_id, e.target.value === 'true')}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '13px',
                                                            borderRadius: '6px',
                                                            border: `1.5px solid ${COLORS.gray200}`,
                                                            background: COLORS.white,
                                                            outline: 'none',
                                                            cursor: currentUser?.id === u.user_id ? 'not-allowed' : 'pointer',
                                                            width: '100%',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 600,
                                                            opacity: currentUser?.id === u.user_id ? 0.7 : 1,
                                                            color: u.is_active ? '#137333' : '#c5221f',
                                                            backgroundColor: u.is_active ? '#e6f4ea' : '#fce8e6'
                                                        }}
                                                    >
                                                        <option value="true" style={{ color: '#137333', backgroundColor: '#e6f4ea' }}>Активен</option>
                                                        <option value="false" style={{ color: '#c5221f', backgroundColor: '#fce8e6' }}>Удален</option>
                                                    </select>
                                                </td>
                                                <td style={getUserCellStyle('role', { padding: '8px 16px', fontSize: '13px' })}>
                                                    <select
                                                        disabled={currentUser?.id === u.user_id}
                                                        value={u.role || 'user'}
                                                        onChange={(e) => handleUserUpdate(u.user_id, e.target.value, u.plan_id, u.is_active)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '13px',
                                                            borderRadius: '6px',
                                                            border: `1.5px solid ${COLORS.gray200}`,
                                                            background: COLORS.white,
                                                            outline: 'none',
                                                            cursor: currentUser?.id === u.user_id ? 'not-allowed' : 'pointer',
                                                            width: '100%',
                                                            fontFamily: 'inherit',
                                                            opacity: currentUser?.id === u.user_id ? 0.7 : 1,
                                                            fontWeight: u.role === 'admin' ? 600 : 'normal',
                                                            color: u.role === 'admin' ? COLORS.accent : COLORS.gray700
                                                        }}
                                                    >
                                                        <option value="user">user</option>
                                                        <option value="admin">admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Пагинация Пользователей */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 24px',
                            borderTop: `1px solid ${COLORS.gray200}`,
                            background: COLORS.gray50
                        }}>
                            <span style={{ fontSize: '14px', color: COLORS.gray600 }}>
                                Показано с {usersTotal === 0 ? 0 : (usersPage - 1) * limit + 1} по {Math.min(usersPage * limit, usersTotal)} из {usersTotal} пользователей
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => setUsersPage(1)}
                                    disabled={usersPage === 1}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: usersPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    «
                                </button>
                                <button
                                    onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                                    disabled={usersPage === 1}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: usersPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    Назад
                                </button>

                                <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.gray700, padding: '0 8px' }}>
                                    Страница {usersPage} из {totalUsersPages}
                                </span>

                                <button
                                    onClick={() => setUsersPage(prev => Math.min(prev + 1, totalUsersPages))}
                                    disabled={usersPage === totalUsersPages}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: usersPage === totalUsersPages ? 0.5 : 1
                                    }}
                                >
                                    Вперед
                                </button>
                                <button
                                    onClick={() => setUsersPage(totalUsersPages)}
                                    disabled={usersPage === totalUsersPages}
                                    style={{
                                        padding: '6px 12px',
                                        background: COLORS.white,
                                        border: `1px solid ${COLORS.gray300}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        opacity: usersPage === totalUsersPages ? 0.5 : 1
                                    }}
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
