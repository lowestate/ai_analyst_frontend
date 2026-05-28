import React, { useEffect, useState } from 'react';
import { OfficeWall } from './OfficeWall';

interface UserPageProps {
    currentUser: { username: string; id: number; plan_name?: string };
    onBack: () => void;
    onPlanChange?: (newPlan: string) => void;
    isBanned?: boolean;
}

const CHECK = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 9.5L7 13L14.5 5.5" stroke="#3399FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CROSS = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M5 5L13 13M13 5L5 13" stroke="#e05252" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const DASH = () => (
    <span style={{ color: 'var(--muted-fg)', fontSize: 18, lineHeight: 1 }}>—</span>
);

type CellValue = 'check' | 'cross' | string;

interface GradeRow {
    grade: string;
    label: string;
    isCurrentPlan?: boolean;
    badge?: { text: string; color: string };
    commands: CellValue;
    files: CellValue;
    ai: CellValue;
    limits: CellValue;
    bd: CellValue;
    dashboard: CellValue;
    price: string;
    priceLabel?: string;
}

const renderCell = (val: CellValue) => {
    if (val === 'check') return <CHECK />;
    if (val === 'cross') return <CROSS />;
    if (val === 'dash') return <DASH />;
    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-fg)' }}>{val}</span>;
};

const WHY_CARDS = [
    {
        num: '01',
        title: 'Инфраструктура',
        text: 'Старшие грейды используют GPU-инстансы для AutoML — мощное железо + 24/7 аптайм.'
    },
    {
        num: '02',
        title: 'AI-токены',
        text: 'Каждый AI-запрос — вызов внешних LLM. Senior снимает лимиты, что увеличивает расходы провайдеру.'
    },
    {
        num: '03',
        title: 'Поддержка специалиста',
        text: 'Маргарет, Боб и Сэм резервируют часы под ваши задачи. Чем выше грейд — тем больше слот.'
    }
];

export const UserPage: React.FC<UserPageProps> = ({ currentUser, onBack, onPlanChange, isBanned }) => {
    const [currentPlan, setCurrentPlan] = useState<string>('junior');
    const [isLoading, setIsLoading] = useState(true);
    const [localBanned, setLocalBanned] = useState(isBanned || false);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`http://localhost:8001/users/${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.plan_name) setCurrentPlan(data.plan_name.toLowerCase());
                    if (data.is_banned !== undefined) setLocalBanned(data.is_banned);
                }
            } catch (err) {
                console.error('Ошибка загрузки профиля', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [currentUser.id]);

    const handlePlanChange = async (targetPlan: string) => {
        if (targetPlan === currentPlan || localBanned) return;
        setUpgrading(true);
        try {
            const res = await fetch('http://localhost:8001/change_subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, target_plan: targetPlan })
            });
            if (!res.ok) throw new Error('Ошибка при смене тарифа');
            const data = await res.json();
            if (data.status === 'success') {
                setCurrentPlan(data.plan_name.toLowerCase());
                if (onPlanChange) onPlanChange(data.plan_name.toLowerCase());
            }
        } catch (err) {
            console.error(err);
            alert('Не удалось изменить подписку.');
        } finally {
            setUpgrading(false);
        }
    };

    const getNextPlan = () => {
        if (currentPlan === 'junior') return 'middle';
        if (currentPlan === 'middle') return 'senior';
        return null;
    };

    const getNextPlanLabel = () => {
        const next = getNextPlan();
        if (next === 'middle') return 'Повысить до Middle →';
        if (next === 'senior') return 'Повысить до Senior →';
        return null;
    };

    const GRADE_ROWS: GradeRow[] = [
        {
            grade: 'Junior',
            label: 'Бесплатный',
            commands: 'check',
            files: 'check',
            ai: 'cross',
            limits: 'dash',
            bd: 'cross',
            dashboard: 'check',
            price: '0₽',
            priceLabel: ''
        },
        {
            grade: 'Middle',
            label: 'Базово',
            commands: 'check',
            files: 'check',
            ai: 'check',
            limits: '3/мин',
            bd: 'cross',
            dashboard: 'check',
            price: '99₽',
            priceLabel: '/мес'
        },
        {
            grade: 'Senior',
            label: 'Расширенный',
            commands: 'check',
            files: 'check',
            ai: 'check',
            limits: 'dash',
            bd: 'check',
            dashboard: 'check',
            price: '199₽',
            priceLabel: '/мес'
        }
    ];

    /* ─── Inline styles (inside component for instant HMR updates) ─── */
    const styles: Record<string, React.CSSProperties> = {
        wrapper: {
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        contentLayer: {
            position: 'relative',
            zIndex: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 0 0 0',
            alignItems: 'center',
            overflow: 'hidden',
            minHeight: 0
        },
        loadingText: {
            margin: 'auto',
            fontFamily: 'var(--font-mono)',
            color: 'var(--muted-fg)',
            fontSize: 13
        },
        topBar: {
            display: 'none'
        },
        sessionLabel: {
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#aaa',
            letterSpacing: '0.04em'
        },
        onlineIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: 'oklch(0.55 0.16 145)',
            letterSpacing: '0.08em',
            marginLeft: '30px',
            marginTop: '2px'
        },
        onlineDot: {
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'oklch(0.6 0.2 145)',
            boxShadow: '0 0 6px oklch(0.6 0.2 145)',
            display: 'inline-block'
        },

        /* MONITOR FRAME */
        monitorOuter: {
            width: '78%',
            maxWidth: 1200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 1 0' as any,
            minHeight: 0,
            overflow: 'hidden'
        },
        monitorBezel: {
            width: '100%',
            background: '#1e1e1e',
            borderRadius: '12px 12px 0 0',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: '2px solid #111'
        },
        trafficLights: {
            display: 'flex',
            gap: 7,
            alignItems: 'center'
        },
        dot: {
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%'
        },
        monitorNeck: {
            width: 48,
            height: 28,
            background: 'linear-gradient(180deg, #2a2a2a 0%, #3a3a3a 100%)',
            flexShrink: 0
        },
        monitorBase: {
            width: 180,
            height: 14,
            background: 'linear-gradient(180deg, #2a2a2a 0%, #404040 100%)',
            borderRadius: '0 0 10px 10px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
        },

        /* MAIN CARD */
        mainCard: {
            width: '100%',
            flex: 1,
            background: 'var(--card-bg)',
            borderLeft: '6px solid #1e1e1e',
            borderRight: '6px solid #1e1e1e',
            borderBottom: '6px solid #1e1e1e',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            minHeight: 0
        },

        /* PROFILE */
        profileSection: {
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
            marginBottom: '13px'
        },
        avatarBox: {
            width: 60,
            height: 60,
            border: '2px solid var(--border-color)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--secondary-color)',
            flexShrink: 0
        },
        avatarLetter: {
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: 22,
            color: 'var(--primary-color)'
        },
        profileInfo: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
        },
        usernameLabel: {
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--muted-fg)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
        },
        username: {
            fontFamily: 'var(--font-mono)',
            fontSize: 20, // Базовый размер, который не ломается
            fontWeight: 800,
            color: 'var(--fg-color)',
            letterSpacing: '-0.01em',
            display: 'inline-block',
            transform: 'scale(1.3)',
            transformOrigin: 'left center'
        },
        usernameRow: {
            display: 'flex',
            alignItems: 'center',
            gap: 12
        },
        roleRow: {
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            color: 'var(--muted-fg)'
        },
        roleText: {
            color: 'var(--primary-color)',
            fontWeight: 600
        },
        roleLink: {
            color: 'var(--primary-color)',
            textDecoration: 'underline',
            cursor: 'pointer'
        },
        currentPlanBadge: {
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.12em',
            padding: '5px 14px',
            border: '2px solid var(--primary-color)',
            borderRadius: 4,
            color: 'var(--primary-color)',
            background: 'var(--primary-soft)',
            flexShrink: 0
        },
        banBanner: {
            margin: '0 28px 0 28px',
            marginTop: 12,
            background: 'oklch(0.98 0.03 80)',
            border: '1px solid oklch(0.85 0.12 80)',
            borderRadius: 6,
            padding: '10px 18px',
            color: 'oklch(0.4 0.1 80)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center'
        },

        /* TABLE SECTION */
        tableSection: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 0 0 0',
            minHeight: 0
        },
        tableSectionHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 28px 8px 28px',
            borderBottom: '1px solid var(--border-color)'
        },
        tableSectionTitle: {
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--muted-fg)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
        },
        effectiveDate: {
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--muted-fg)',
            letterSpacing: '0.06em'
        },
        gradeTable: {
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed'
        },
        th: {
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--muted-fg)',
            letterSpacing: '0.1em',
            textAlign: 'center',
            background: 'var(--secondary-color)',
            whiteSpace: 'nowrap'
        },
        thGrade: {
            textAlign: 'left',
            paddingLeft: 28,
            width: '9%'
        },
        thAI: {
            textAlign: 'center',
            paddingLeft: 70,
            width: '9%'
        },
        thPrice: {
            textAlign: 'center',
            paddingLeft: 10,
            width: '9%'
        },
        tr: {
            borderBottom: '1px solid var(--border-color)',
            transition: 'background 0.15s ease'
        },
        trActive: {
            background: 'var(--primary-soft)'
        },
        td: {
            padding: '12px 14px',
            textAlign: 'center',
            verticalAlign: 'middle'
        },
        tdGrade: {
            padding: '12px 14px 12px 28px',
            verticalAlign: 'middle'
        },
        tdFiles: {
            textAlign: 'center',
            paddingLeft: 60
        },
        tdAI: {
            textAlign: 'center',
            paddingLeft: 70
        },
        tdAction: {
            padding: '8px 12px',
            textAlign: 'center',
            verticalAlign: 'middle',
            width: 110
        },
        actionBtn: {
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            padding: '6px 14px',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            whiteSpace: 'nowrap' as const
        },
        gradeNameRow: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 2
        },
        gradeName: {
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: 16
        },
        gradeBadge: {
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 800,
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 3,
            letterSpacing: '0.05em'
        },
        activeBadge: {
            color: 'var(--primary-color)',
            fontSize: 12,
            marginLeft: 2
        },
        gradeLabel: {
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            color: 'var(--muted-fg)'
        },
        priceValue: {
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--fg-color)'
        },
        priceLabel: {
            fontFamily: 'var(--font-mono)',
            fontSize: 16,
            color: 'var(--muted-fg)',
            marginLeft: 2
        },

        /* WHY SECTION */
        whySection: {
            borderTop: '1px solid var(--border-color)',
            padding: '16px 28px 28px 28px'
        },
        whyTabsRow: {
            display: 'flex',
            gap: 6,
            marginBottom: 14,
            flexWrap: 'wrap'
        },
        whyTabActive: {
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '3px 10px',
            background: 'var(--primary-color)',
            color: '#fff',
            borderRadius: 3
        },
        whyTab: {
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '3px 10px',
            background: 'var(--secondary-color)',
            color: 'var(--muted-fg)',
            borderRadius: 3,
            border: '1px solid var(--border-color)'
        },
        whyCardsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16
        },
        whyCard: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 6,
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
        },
        whyCardNum: {
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--primary-color)',
            letterSpacing: '0.1em'
        },
        whyCardTitle: {
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--fg-color)'
        },
        whyCardText: {
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            color: 'var(--muted-fg)',
            lineHeight: 1.5
        },

        /* FOOTER */
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 28px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--secondary-color)',
            flexShrink: 0
        },
        footerNote: {
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--muted-fg)',
            letterSpacing: '0.05em'
        },
        upgradeBtn: {
            background: 'var(--fg-color)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '9px 22px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            letterSpacing: '0.03em',
            transition: 'opacity 0.2s, transform 0.15s',
            boxShadow: 'var(--shadow-paper)'
        },

        /* DESK SURFACE */
        deskSurface: {
            width: '100%',
            height: 20,
            flexShrink: 0,
            background: `
            repeating-linear-gradient(
                90deg,
                rgba(0,0,0,0) 0px,
                rgba(0,0,0,0) 18px,
                rgba(0,0,0,0.06) 18px,
                rgba(0,0,0,0.06) 19px,
                rgba(255,255,255,0.04) 19px,
                rgba(255,255,255,0.04) 36px
            ),
            linear-gradient(180deg, #9B7050 0%, #8B6040 30%, #7A5230 60%, #6A4525 100%)
        `,
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18), 0 6px 20px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2
        }
    };

    if (isLoading) {
        return (
            <div style={styles.wrapper}>
                <div style={styles.loadingText}>Загрузка профиля...</div>
            </div>
        );
    }

    const nextPlan = getNextPlan();
    const nextPlanLabel = getNextPlanLabel();

    return (
        <div style={styles.wrapper}>
            {/* blink animation for online dot */}
            <style>{`@keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>

            {/* OFFICE WALL BACKGROUND */}
            <OfficeWall />

            {/* CONTENT LAYER — sits above the wall */}
            <div style={styles.contentLayer}>

                {/* MONITOR OUTER WRAPPER — bezel + card + stand */}
                <div style={styles.monitorOuter}>

                    {/* MONITOR BEZEL TOP */}
                    <div style={styles.monitorBezel}>
                        {/* traffic lights */}
                        <div style={styles.trafficLights}>
                            <span style={{ ...styles.dot, background: '#ff5f57' }} />
                            <span style={{ ...styles.dot, background: '#febc2e' }} />
                            <span style={{ ...styles.dot, background: '#28c840' }} />
                        </div>
                        {/* session label center */}
                        <span style={styles.sessionLabel}>account.dataoffice / session #{currentUser.id.toString().padStart(4, '0')}</span>
                        <div style={{ width: 52 }} />{/* spacer to balance traffic lights */}
                    </div>

                    {/* MAIN CARD */}
                    <div style={styles.mainCard}>

                        {/* PROFILE SECTION */}
                        <div style={styles.profileSection}>
                            <div style={styles.avatarBox}>
                                <span style={styles.avatarLetter}>{currentUser.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div style={styles.profileInfo}>
                                <div style={styles.usernameLabel}>USERNAME</div>
                                <div style={styles.usernameRow}>
                                    <span style={styles.username}>@{currentUser.username}</span>
                                    <span style={styles.onlineIndicator}>
                                        <span style={{ ...styles.onlineDot, animation: 'blink-dot 2s ease-in-out infinite' }} />
                                        ONLINE
                                    </span>
                                </div>
                                <div style={styles.roleRow}>
                                    Должность:{' '}
                                    <span style={styles.roleText}>
                                        {currentPlan === 'junior' ? 'Junior Data Analyst' :
                                            currentPlan === 'middle' ? 'Middle Data Analyst' :
                                                'Senior Data Analyst'}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.currentPlanBadge}>
                                {currentPlan.toUpperCase()}
                            </div>
                        </div>

                        {localBanned && (
                            <div style={styles.banBanner}>
                                Ваш аккаунт заблокирован. Все действия ограничены.
                            </div>
                        )}

                        {/* GRADE LADDER TABLE */}
                        <div style={styles.tableSection}>
                            <div style={styles.tableSectionHeader}>
                                <span style={styles.tableSectionTitle}>HR · GRADE LADDER</span>
                                <span style={styles.effectiveDate}>EFFECTIVE 01.06.2026</span>
                            </div>

                            <table style={styles.gradeTable}>
                                <thead>
                                    <tr>
                                        <th style={{ ...styles.th, ...styles.thGrade }}>ГРЕЙД</th>
                                        <th style={styles.th}>КОМАНДЫ</th>
                                        <th style={styles.th}>РАБОТА С ФАЙЛАМИ</th>
                                        <th style={{ ...styles.th, ...styles.thAI }}>AI</th>
                                        <th style={styles.th}>ЛИМИТ AI</th>
                                        <th style={styles.th}>РАБОТА С БД</th>
                                        <th style={styles.th}>ДАШБОРДЫ</th>
                                        <th style={{ ...styles.th, ...styles.thPrice }}>СТОИМОСТЬ</th>
                                        <th style={{ ...styles.th, textAlign: 'center', border: 'none' }}>ЗАПРОСИТЬ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {GRADE_ROWS.map((row) => {
                                        const isActive = currentPlan === row.grade.toLowerCase();
                                        const gradeOrder = ['junior', 'middle', 'senior'];
                                        const currentIdx = gradeOrder.indexOf(currentPlan);
                                        const rowIdx = gradeOrder.indexOf(row.grade.toLowerCase());
                                        const isAbove = rowIdx > currentIdx;
                                        const isBelow = rowIdx < currentIdx;
                                        return (
                                            <tr
                                                key={row.grade}
                                                style={{
                                                    ...styles.tr,
                                                    ...(isActive ? styles.trActive : {}),
                                                    cursor: 'default'
                                                }}
                                            >
                                                <td style={styles.tdGrade}>
                                                    <div style={styles.gradeNameRow}>
                                                        <span style={{
                                                            ...styles.gradeName,
                                                            color: row.grade === 'Middle' ? 'var(--primary-color)' :
                                                                row.grade === 'Senior' ? 'var(--accent-color)' : 'var(--fg-color)'
                                                        }}>
                                                            {row.grade}
                                                        </span>
                                                        {isActive && (
                                                            <span style={styles.activeBadge}>●</span>
                                                        )}
                                                    </div>
                                                    <div style={styles.gradeLabel}>{row.label}</div>
                                                </td>
                                                <td style={styles.td}>{renderCell(row.commands)}</td>
                                                <td style={{ ...styles.td, ...styles.tdFiles }}>{renderCell(row.files)}</td>
                                                <td style={{ ...styles.td, ...styles.tdAI }}>{renderCell(row.ai)}</td>
                                                <td style={styles.td}>{renderCell(row.limits)}</td>
                                                <td style={styles.td}>{renderCell(row.bd)}</td>
                                                <td style={styles.td}>{renderCell(row.dashboard)}</td>
                                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                                    <span style={styles.priceValue}>{row.price}</span>
                                                    {row.priceLabel && (
                                                        <span style={styles.priceLabel}>{row.priceLabel}</span>
                                                    )}
                                                </td>
                                                <td style={styles.tdAction}>
                                                    {isAbove && !localBanned && (
                                                        <button
                                                            className="btn-unified"
                                                            style={{
                                                                opacity: upgrading ? 0.6 : 1,
                                                                cursor: upgrading ? 'wait' : 'pointer',
                                                                gap: '0px'
                                                            }}
                                                            disabled={upgrading}
                                                            onClick={() => handlePlanChange(row.grade.toLowerCase())}
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                                                <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"></polygon>
                                                            </svg>
                                                            Повышение
                                                        </button>
                                                    )}
                                                    {isBelow && !localBanned && (
                                                        <button
                                                            className="btn-unified"
                                                            style={{
                                                                opacity: upgrading ? 0.6 : 1,
                                                                cursor: upgrading ? 'wait' : 'pointer',
                                                                gap: '0px'
                                                            }}
                                                            disabled={upgrading}
                                                            onClick={() => handlePlanChange(row.grade.toLowerCase())}
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <line x1="8" y1="12" x2="16" y2="12"></line>
                                                            </svg>
                                                            Понижение
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* WHY UPGRADE CARDS — below the table */}
                        <div style={styles.whySection}>
                            <div style={styles.whyTabsRow}>
                                <span style={styles.whyTabActive}>ПОЧЕМУ ПОВЫШЕНИЕ ПЛАТНОЕ?</span>
                            </div>

                            <div style={styles.whyCardsGrid}>
                                {WHY_CARDS.map((card) => (
                                    <div key={card.num} style={styles.whyCard}>
                                        <div style={styles.whyCardNum}>{card.num}</div>
                                        <div style={styles.whyCardTitle}>{card.title}</div>
                                        <div style={styles.whyCardText}>{card.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>{/* /mainCard */}

                    {/* MONITOR STAND */}
                    <div style={styles.monitorNeck} />
                    <div style={styles.monitorBase} />

                </div>{/* /monitorOuter */}

                {/* WOODEN DESK SURFACE */}
                <div style={styles.deskSurface} />

            </div>{/* /contentLayer */}
        </div>
    );
};