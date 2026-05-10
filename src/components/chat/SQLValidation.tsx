import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COLORS } from '../../globasStyles'

const formatSql = (sql: string) => {
    if (!sql) return '';

    // Нормализация пробелов
    let str = sql.replace(/\s+/g, ' ').trim();

    // Ключевые слова, которые всегда начинаются с новой строки
    const rootKws = ['FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT'];
    
    // Приводим ключи к верхнему регистру для точного совпадения
    rootKws.forEach(kw => {
        str = str.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw.toUpperCase());
    });
    str = str.replace(/\bSELECT\b/gi, 'SELECT');

    let result = '';
    let indent = 0;
    const TAB = '        '; // 4 пробела (табуляция увеличена в 2 раза)
    let inSelectClause = false;
    let parenLevel = 0;
    let selectParenLevels: number[] = []; 

    let i = 0;
    while (i < str.length) {
        // 1. Обработка SELECT
        if (str.startsWith('SELECT', i)) {
            if (indent === 0) {
                // Главный SELECT (начало запроса)
                result += 'SELECT\n';
                indent++;
                result += TAB.repeat(indent);
            } else {
                // Вложенный SELECT (в подзапросе)
                indent++; 
                if (i > 0 && !result.endsWith('\n') && !result.endsWith('\n' + TAB.repeat(indent))) {
                    result += '\n' + TAB.repeat(indent);
                }
                result += 'SELECT ';
                selectParenLevels.push(parenLevel); // Запоминаем уровень вложенности скобок
            }
            i += 6;
            if (str[i] === ' ') i++;
            inSelectClause = true;
            continue;
        }

        // 2. Обработка корневых ключевых слов (FROM, JOIN, WHERE...)
        let matchedRoot = false;
        for (const kw of rootKws) {
            if (str.startsWith(kw, i)) {
                // Главный FROM сбрасывает отступ от главного SELECT
                if (kw === 'FROM' && indent > 0 && parenLevel === 0) {
                    indent--;
                    inSelectClause = false;
                }

                // Аккуратно добавляем перенос строки и текущий отступ
                result = result.replace(/[ \t]+$/, ''); // Убираем висячие пробелы
                if (!result.endsWith('\n')) {
                    result += '\n';
                }
                result += TAB.repeat(indent) + kw + ' ';
                
                i += kw.length;
                if (str[i] === ' ') i++;
                matchedRoot = true;
                break;
            }
        }
        if (matchedRoot) continue;

        // 3. Обработка запятых
        if (str[i] === ',') {
            if (inSelectClause) {
                // Внутри SELECT делаем перенос с отступом
                result += ',\n' + TAB.repeat(indent);
            } else {
                // В GROUP BY или внутри IN (...) оставляем на одной строке
                result += ', ';
            }
            i++;
            if (str[i] === ' ') i++;
            continue;
        }

        // 4. Отслеживание скобок (для корректной работы вложенных SELECT)
        if (str[i] === '(') {
            result += '(';
            parenLevel++;
            i++;
            continue;
        }

        if (str[i] === ')') {
            // Если мы закрыли скобку, в которой открывали вложенный SELECT
            if (selectParenLevels.length > 0 && selectParenLevels[selectParenLevels.length - 1] === parenLevel) {
                selectParenLevels.pop();
                indent--; // Возвращаем отступ назад
            }
            parenLevel--;
            result += ')';
            i++;
            continue;
        }

        result += str[i];
        i++;
    }

    // Финальная очистка случайных двойных пробелов перед переносами
    return result.replace(/ +\n/g, '\n').trim();
};

export const SqlValidationBlock = ({ text, onAction }: { text: string, onAction: (action: 'approve' | 'reject', feedback?: string, editedQuery?: string) => void }) => {
    const sqlMatch = text.match(/```sql\n([\s\S]*?)\n```/i);
    const originalQuery = sqlMatch ? sqlMatch[1] : '';
    
    // ПРИМЕНЯЕМ ФОРМАТИРОВАНИЕ ПРИ ИНИЦИАЛИЗАЦИИ
    const [query, setQuery] = useState(formatSql(originalQuery));
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
    
    useEffect(() => {
        if (status === 'pending') {
            setQuery(formatSql(originalQuery));
        }
    }, [originalQuery]);

    // Состояния для взаимодействия
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const beforeSqlMatch = text.match(/([\s\S]*?)```sql/i);
    const beforeSql = beforeSqlMatch ? beforeSqlMatch[1] : text.split('```sql')[0] || '';

    const afterSqlMatch = text.match(/```sql\n[\s\S]*?\n```([\s\S]*)/i);
    const afterSql = afterSqlMatch ? afterSqlMatch[1] : '';

    const highlightSql = (sql: string) => {
        const keywords = /(\b(?:SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|LIMIT|AND|OR|AS|LEFT|RIGHT|INNER|OUTER|HAVING|COUNT|SUM|AVG|MIN|MAX|DESC|ASC|IN|NOT|IS|NULL|CAST|COALESCE)\b)/gi;
        const parts = sql.split(keywords);
        const keywordColor = COLORS.accent || '#4a90e2'; 

        return parts.map((part, i) => {
            if (i % 2 === 1) { 
                return <span key={i} style={{ color: keywordColor, fontWeight: 600 }}>{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleApprove = () => {
        setStatus('approved');
        setIsEditing(false);
        // Заменяем переносы строк на пробелы обратно перед отправкой на бэк, если база так лучше съедает (опционально)
        // Но PostgreSQL отлично ест запросы с переносами, так что отправляем как есть!
        onAction('approve', undefined, query);
    };

    const handleRejectClick = () => {
        setIsRejecting(true);
    };

    const submitReject = () => {
        if (!rejectReason.trim()) return;
        setStatus('rejected');
        setIsRejecting(false);
        setIsEditing(false);
        onAction('reject', rejectReason, query);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(query);
        setIsCopied(true);
        setIsPulsing(true); // Включаем черный цвет
        
        // Буквально через 50мс выключаем, чтобы запустить линейное затухание
        setTimeout(() => setIsPulsing(false), 50); 
        
        setTimeout(() => setIsCopied(false), 2000); // Текст подсказки висит 2 секунды
    };

    // --- Стилизация под классический блок кода ---
    let wrapperStyle: React.CSSProperties = {
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8ee',
        margin: '12px 0',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif'
    };

    let headerStyle: React.CSSProperties = {
        background: '#f0f4f8',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8ee'
    };

    let bodyStyle: React.CSSProperties = {
        background: '#f8f9fa',
        padding: '16px',
        position: 'relative',
        margin: 0
    };

    // Меняем цвета в зависимости от статуса
    if (status === 'approved') {
        wrapperStyle.border = '1px solid #11d511';
        headerStyle.background = '#e6f4ea';
        headerStyle.borderBottom = '1px solid #cce8d6';
        bodyStyle.background = '#f0f9f4';
    } else if (status === 'rejected') {
        wrapperStyle.border = '1px solid #ff0000';
        headerStyle.background = '#fce8e6';
        headerStyle.borderBottom = '1px solid #fad2cf';
        bodyStyle.background = '#fef6f5';
    }

    const iconStyle = {
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px', borderRadius: '4px', transition: 'background 0.2s',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{beforeSql}</ReactMarkdown>
            </div>

            <div style={wrapperStyle}>
                
                <div style={headerStyle}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#5f6368' }}>SQL</span>
                    
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                            onClick={handleCopy} 
                            title={isCopied ? "Скопировано!" : "Копировать"} 
                            style={{
                                ...iconStyle,
                                color: isPulsing ? '#000000' : '#5f6368', // Теперь цвет зависит от импульса
                                transition: isPulsing ? 'none' : 'background 0.2s, color 0.3s linear'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>

                        {status === 'pending' && !isRejecting && (
                            <>
                                <button 
                                    onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Отменить редактирование" : "Изменить код"} 
                                    style={{...iconStyle, background: isEditing ? 'rgba(0,0,0,0.08)' : 'none'}}
                                    onMouseEnter={e => !isEditing && (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
                                    onMouseLeave={e => !isEditing && (e.currentTarget.style.background = 'none')}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                
                                <div style={{ width: '1px', height: '14px', background: '#d1d5db', margin: '0 4px' }}></div>
                                
                                <button 
                                    onClick={handleApprove} title="Подтвердить и выполнить" 
                                    style={{...iconStyle, color: '#11d511'}}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(17,213,17,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                
                                <button 
                                    onClick={handleRejectClick} title="Отклонить и исправить" 
                                    style={{...iconStyle, color: '#ff0000'}}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                
                <div style={bodyStyle}>
                    
                    {isRejecting && status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #dce4ec' }}>
                            <input 
                                autoFocus type="text" value={rejectReason} 
                                onChange={e => setRejectReason(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && submitReject()}
                                placeholder="Напиши, что нужно исправить в запросе..." 
                                style={{ flexGrow: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #dce4ec', fontSize: '13px', outline: 'none' }} 
                            />
                            <button onClick={submitReject} style={{ background: COLORS.accent || '#4a90e2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                                Отправить
                            </button>
                            <button onClick={() => setIsRejecting(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '20px' }}>&times;</button>
                        </div>
                    )}

                    
                    {isEditing && status === 'pending' ? (
                        <textarea 
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            style={{ 
                                width: '100%', minHeight: '120px', background: '#ffffff', 
                                border: '1px solid #dce4ec', borderRadius: '6px', 
                                color: '#000', padding: '12px', 
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', 
                                fontSize: '13px', outline: 'none', resize: 'vertical',
                                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                            }} 
                        />
                    ) : (
                        <div style={{ 
                            color: '#24292e', 
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', 
                            fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5',
                            overflowX: 'auto'
                        }}>
                            {highlightSql(query)}
                        </div>
                    )}
                </div>
            </div>

            {afterSql.trim() && (
                <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{afterSql}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};