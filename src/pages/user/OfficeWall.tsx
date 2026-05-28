import React, { useEffect, useState } from 'react';

/* ─── Live Clock ─── */
const WallClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const hDeg = (h % 12) * 30 + m * 0.5;
    const mDeg = m * 6 + s * 0.1;
    const sDeg = s * 6;

    return (
        <div style={wallStyles.clockWrapper}>
            <svg width="72" height="72" viewBox="0 0 72 72">
                {/* outer ring */}
                <circle cx="36" cy="36" r="34" fill="#f5f0e8" stroke="#c8b99a" strokeWidth="2" />
                <circle cx="36" cy="36" r="30" fill="none" stroke="#e0d5c5" strokeWidth="0.5" />
                {/* hour ticks */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x1 = 36 + 26 * Math.cos(angle);
                    const y1 = 36 + 26 * Math.sin(angle);
                    const x2 = 36 + 30 * Math.cos(angle);
                    const y2 = 36 + 30 * Math.sin(angle);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a89880" strokeWidth={i % 3 === 0 ? 2 : 1} />;
                })}
                {/* hour hand */}
                <line
                    x1="36" y1="36"
                    x2={36 + 17 * Math.cos((hDeg - 90) * Math.PI / 180)}
                    y2={36 + 17 * Math.sin((hDeg - 90) * Math.PI / 180)}
                    stroke="#3a2e22" strokeWidth="3" strokeLinecap="round"
                />
                {/* minute hand */}
                <line
                    x1="36" y1="36"
                    x2={36 + 23 * Math.cos((mDeg - 90) * Math.PI / 180)}
                    y2={36 + 23 * Math.sin((mDeg - 90) * Math.PI / 180)}
                    stroke="#3a2e22" strokeWidth="2" strokeLinecap="round"
                />
                {/* second hand */}
                <line
                    x1="36" y1="36"
                    x2={36 + 25 * Math.cos((sDeg - 90) * Math.PI / 180)}
                    y2={36 + 25 * Math.sin((sDeg - 90) * Math.PI / 180)}
                    stroke="#c0392b" strokeWidth="1" strokeLinecap="round"
                />
                <circle cx="36" cy="36" r="2.5" fill="#3a2e22" />
                <circle cx="36" cy="36" r="1.2" fill="#c0392b" />
            </svg>
        </div>
    );
};

/* ─── Mini Calendar ─── */
const WallCalendar: React.FC = () => {
    const now = new Date();
    const month = now.toLocaleString('ru-RU', { month: 'long' }).toUpperCase();
    const year = now.getFullYear();
    const today = now.getDate();

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    // Adjust for Monday-first week
    const offset = (firstDay === 0 ? 6 : firstDay - 1);

    const cells: (number | null)[] = [
        ...Array(offset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
        <div style={wallStyles.calendarWrapper}>
            <div style={wallStyles.calendarHeader}>
                <span style={wallStyles.calendarMonth}>{month}</span>
                <span style={wallStyles.calendarYear}>{year}</span>
            </div>
            <table style={wallStyles.calendarTable}>
                <thead>
                    <tr>
                        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                            <th key={d} style={wallStyles.calendarDow}>{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, wi) => (
                        <tr key={wi}>
                            {week.map((day, di) => (
                                <td key={di} style={{
                                    ...wallStyles.calendarDay,
                                    ...(day === today ? wallStyles.calendarToday : {}),
                                    ...(di >= 5 ? wallStyles.calendarWeekend : {})
                                }}>
                                    {day || ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ─── Cork Board with pinned notes ─── */
const CorkBoard: React.FC = () => (
    <div style={wallStyles.corkBoard}>
        {/* pin at top */}
        <div style={{ ...wallStyles.pin, top: -7, left: '50%', transform: 'translateX(-50%)' }} />

        {/* sticky note 1 */}
        <div style={{ ...wallStyles.sticky, background: '#fde68a', transform: 'rotate(-3deg)', top: 16, left: 12, width: 90, minHeight: 72 }}>
            <div style={wallStyles.stickyText}>* идея:<br/>AutoML для HR метрик</div>
        </div>

        {/* sticky note 2 */}
        <div style={{ ...wallStyles.sticky, background: '#fca5a5', transform: 'rotate(2deg)', top: 20, left: 116, width: 80, minHeight: 60 }}>
            <div style={wallStyles.stickyText}>дедлайн<br/>01.06 🔥</div>
        </div>

        {/* sticky note 3 */}
        <div style={{ ...wallStyles.sticky, background: '#86efac', transform: 'rotate(-1deg)', top: 105, left: 30, width: 76, minHeight: 60 }}>
            <div style={wallStyles.stickyText}>ревью<br/>PR #247<br/>✓</div>
        </div>

        {/* a "memo" card */}
        <div style={wallStyles.memoCard}>
            <div style={wallStyles.memoTitle}>TEAM 2026</div>
            <div style={wallStyles.memoSub}>офис · инфо</div>
        </div>
    </div>
);

/* ─── Tape strip ─── */
const Tape: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <div style={{ ...wallStyles.tape, ...style }} />
);

/* ─── Small desk label ─── */
const DeskLabel: React.FC<{ text: string; sub?: string; style?: React.CSSProperties }> = ({ text, sub, style }) => (
    <div style={{ ...wallStyles.deskLabel, ...style }}>
        <div style={wallStyles.deskLabelMain}>{text}</div>
        {sub && <div style={wallStyles.deskLabelSub}>{sub}</div>}
    </div>
);

/* ─── Main OfficeWall export ─── */
export const OfficeWall: React.FC = () => {
    return (
        <div style={wallStyles.wall}>
            {/* ── top-left: wooden texture strip ── */}
            <div style={wallStyles.woodStrip} />

            {/* ── Clock (right side of wall, vertically centered) ── */}
            <div style={{ ...wallStyles.absItem, top: '50%', right: '2%', transform: 'translateY(-50%)' }}>
                <WallClock />
            </div>

            {/* ── Cork board (left side) ── */}
            <div style={{ ...wallStyles.absItem, top: 100, left: 24 }}>
                <CorkBoard />
            </div>

            {/* ── Calendar (lower-right) ── */}
            <div style={{ ...wallStyles.absItem, bottom: 120, right: 20 }}>
                <WallCalendar />
            </div>

            {/* ── Tape strips scattered ── */}
            <Tape style={{ top: 96, left: '42%', transform: 'rotate(-12deg)' }} />
            <Tape style={{ top: 210, left: '55%', transform: 'rotate(5deg)', width: 36 }} />
            <Tape style={{ top: 310, right: 40, transform: 'rotate(-8deg)', width: 40 }} />

            {/* ── Sticky loose on wall ── */}
            <div style={{
                ...wallStyles.sticky,
                position: 'absolute',
                background: '#c7d2fe',
                transform: 'rotate(4deg)',
                top: 280,
                left: 30,
                width: 80,
                minHeight: 64
            }}>
                <Tape style={{ top: -10, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }} />
                <div style={wallStyles.stickyText}>РАБОЧЕЕ<br/>МЕСТО #247<br/>ЭТАЖ 03</div>
            </div>

            {/* ── Desk badge / label bottom-right ── */}
            <DeskLabel
                text="DATA OFFICE"
                sub="АНАЛИТИКА · AI"
                style={{ position: 'absolute', bottom: 36, right: 24 }}
            />

            {/* ── Small note bottom-left ── */}
            <div style={{ ...wallStyles.absItem, bottom: 40, left: 20 }}>
                <div style={{
                    ...wallStyles.sticky,
                    background: '#fde68a',
                    transform: 'rotate(-2deg)',
                    width: 88,
                    minHeight: 56,
                    position: 'relative'
                }}>
                    <Tape style={{ top: -10, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }} />
                    <div style={wallStyles.stickyText}>кофе ☕<br/>13:30</div>
                </div>
            </div>

            {/* ── Grid lines on wall (subtle graph paper effect) ── */}
        </div>
    );
};

/* ─── Styles ─── */
const wallStyles: Record<string, React.CSSProperties> = {
    wall: {
        flex: '0 0 auto',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
            linear-gradient(rgba(180,165,145,0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,165,145,0.25) 1px, transparent 1px),
            oklch(0.88 0.025 60)
        `,
        backgroundSize: '32px 32px, 32px 32px, 100% 100%',
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    absItem: {
        position: 'absolute'
    },
    woodStrip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        background: 'linear-gradient(90deg, #8B6B4A 0%, #A07850 30%, #7A5C3A 60%, #9B7050 100%)',
        opacity: 0.7
    },

    /* Clock */
    clockWrapper: {
        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))'
    },

    /* Calendar */
    calendarWrapper: {
        background: '#fff',
        borderRadius: 4,
        padding: '8px 10px',
        boxShadow: '2px 4px 10px rgba(0,0,0,0.18)',
        width: 148,
        border: '1px solid #ddd'
    },
    calendarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingBottom: 4,
        borderBottom: '1px solid #e5e5e5'
    },
    calendarMonth: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        fontWeight: 800,
        color: '#1a1a1a',
        letterSpacing: '0.08em'
    },
    calendarYear: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        color: '#888',
        fontWeight: 600
    },
    calendarTable: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    calendarDow: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 8,
        fontWeight: 700,
        color: '#aaa',
        textAlign: 'center',
        padding: '1px 0'
    },
    calendarDay: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        textAlign: 'center',
        padding: '2px 1px',
        color: '#333',
        borderRadius: 2,
        width: 18,
        height: 14
    },
    calendarToday: {
        background: 'oklch(0.45 0.14 250)',
        color: '#fff',
        borderRadius: 3,
        fontWeight: 800
    },
    calendarWeekend: {
        color: '#c0392b'
    },

    /* Cork board */
    corkBoard: {
        background: 'linear-gradient(135deg, #c8a96e 0%, #b8966a 25%, #c4a070 50%, #b89060 75%, #c2a068 100%)',
        borderRadius: 4,
        border: '4px solid #7a5c3a',
        padding: 12,
        width: 220,
        minHeight: 190,
        position: 'relative',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.12), 3px 5px 12px rgba(0,0,0,0.25)'
    },

    /* Pin */
    pin: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, #e74c3c, #c0392b)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        zIndex: 10
    },

    /* Sticky note */
    sticky: {
        borderRadius: 2,
        padding: '8px 10px',
        boxShadow: '2px 3px 6px rgba(0,0,0,0.2)',
        cursor: 'default'
    },
    stickyText: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        fontWeight: 600,
        color: '#2d2d2d',
        lineHeight: 1.5,
        whiteSpace: 'pre-line'
    },

    /* Memo card */
    memoCard: {
        position: 'absolute',
        bottom: 14,
        right: 12,
        background: 'oklch(0.45 0.14 250)',
        borderRadius: 3,
        padding: '6px 10px',
        boxShadow: '1px 2px 5px rgba(0,0,0,0.3)'
    },
    memoTitle: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '0.08em'
    },
    memoSub: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 8,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2
    },

    /* Tape */
    tape: {
        position: 'absolute',
        width: 48,
        height: 16,
        background: 'rgba(255,255,200,0.55)',
        border: '1px solid rgba(220,210,160,0.6)',
        borderRadius: 2,
        backdropFilter: 'blur(1px)'
    },

    /* Desk label */
    deskLabel: {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 3,
        padding: '6px 12px',
        boxShadow: '1px 2px 6px rgba(0,0,0,0.12)'
    },
    deskLabelMain: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        fontWeight: 800,
        color: '#1a1a1a',
        letterSpacing: '0.1em'
    },
    deskLabelSub: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 8,
        color: '#888',
        marginTop: 2,
        letterSpacing: '0.06em'
    }
};
