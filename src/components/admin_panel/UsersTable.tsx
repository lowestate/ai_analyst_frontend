import React, { useEffect, useState, useRef } from 'react';
import { COLORS } from '../../globasStyles';

export interface User {
    user_id: number;
    username: string;
    plan_id: number;
    is_active: boolean;
    role: string;
    is_banned: boolean;
    strikes: number;
}

export interface Plan {
    plan_id: number;
    plan_name: string;
}

export const USER_COLUMNS = [
    { key: 'user_id', label: 'ID юзера' },
    { key: 'username', label: 'Имя пользователя' },
    { key: 'plan_id', label: 'Тарифный план' },
    { key: 'is_active', label: 'Статус' },
    { key: 'role', label: 'Роль' },
    { key: 'is_banned', label: 'Забанен' },
    { key: 'strikes', label: 'Кол-во нарушений' }
];

interface BanDropdownProps {
    userId: number;
    isBanned: boolean;
    strikes: number;
    disabled: boolean;
    onToggle: (userId: number, newValue: boolean) => void;
}

const BanDropdown: React.FC<BanDropdownProps> = ({ userId, isBanned, strikes, disabled, onToggle }) => {
    const [open, setOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUp(spaceBelow < 120);
        }
        setOpen(prev => !prev);
    };

    const options = [
        { value: false, label: 'Не забанен', color: '#15803d', bg: '#f0fdf4' },
        { value: true, label: 'Забанен', color: '#b91c1c', bg: '#fef2f2' },
    ];
    const current = options.find(o => o.value === isBanned) ?? options[0];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative' }}>
                <button
                    ref={btnRef}
                    disabled={disabled}
                    onClick={handleOpen}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: `1.5px solid ${isBanned ? '#f87171' : '#d1d5db'}`,
                        background: current.bg,
                        color: current.color,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.7 : 1,
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                        outline: 'none'
                    }}
                >
                    {current.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {open && (
                    <>
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                            onClick={() => setOpen(false)}
                        />
                        <div style={{
                            position: 'absolute',
                            ...(dropUp ? { bottom: '110%' } : { top: '110%' }),
                            left: 0,
                            zIndex: 1000,
                            background: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            minWidth: '130px'
                        }}>
                            {options.map(opt => (
                                <div
                                    key={String(opt.value)}
                                    onClick={() => { onToggle(userId, opt.value); setOpen(false); }}
                                    style={{
                                        padding: '8px 14px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: opt.color,
                                        background: isBanned === opt.value ? opt.bg : '#ffffff',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = opt.bg)}
                                    onMouseLeave={e => (e.currentTarget.style.background = isBanned === opt.value ? opt.bg : '#ffffff')}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export interface UsersTableProps {
    currentUser: any;
    showToast: (message: string, type: 'success' | 'error') => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ currentUser, showToast }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersLoading, setUsersLoading] = useState(true);

    const [usersPage, setUsersPage] = useState(1);
    const limit = 10;

    const [usersSortCol, setUsersSortCol] = useState<string>('user_id');
    const [usersSortOrder, setUsersSortOrder] = useState<'ASC' | 'DESC'>('ASC');

    const [usersFilterCol, setUsersFilterCol] = useState<string | null>(null);
    const [usersFilterVal, setUsersFilterVal] = useState<string>('');
    const [usersActiveFilterInputs, setUsersActiveFilterInputs] = useState<{ [key: string]: boolean }>({});
    const [usersFilterInputs, setUsersFilterInputs] = useState<{ [key: string]: string }>({});
    const [usersCollapsedCols, setUsersCollapsedCols] = useState<{ [key: string]: boolean }>({});

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
        fetchUsers();
    }, [usersPage, usersSortCol, usersSortOrder, usersFilterCol, usersFilterVal]);

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole, plan_id: newPlanId, is_active: newIsActive })
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

    const handleUserBanToggle = async (targetUserId: number, newIsBanned: boolean) => {
        try {
            const res = await fetch(`http://localhost:8001/admin/users/${targetUserId}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_banned: newIsBanned })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Не удалось изменить статус бана');
            }
            setUsers(prev =>
                prev.map(u => u.user_id === targetUserId
                    ? { ...u, is_banned: newIsBanned, strikes: newIsBanned ? u.strikes : 0 }
                    : u
                )
            );
            const msg = newIsBanned ? 'Пользователь забанен' : 'Пользователь разбанен, страйки сброшены';
            showToast(msg, newIsBanned ? 'error' : 'success');
        } catch (err: any) {
            showToast(err.message || 'Ошибка изменения статуса бана', 'error');
        }
    };

    const totalUsersPages = Math.ceil(usersTotal / limit) || 1;

    return (
        <>
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
                                    <td style={getUserCellStyle('is_banned', { padding: '8px 16px', fontSize: '13px' })}>
                                        <BanDropdown
                                            userId={u.user_id}
                                            isBanned={u.is_banned ?? false}
                                            strikes={u.strikes ?? 0}
                                            disabled={currentUser?.id === u.user_id}
                                            onToggle={handleUserBanToggle}
                                        />
                                    </td>
                                    <td style={getUserCellStyle('strikes', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray600, fontFamily: 'monospace' })} title={String(u.user_id)}>
                                        {u.strikes}
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
    );
};
