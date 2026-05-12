import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    Handle,
    Position,
    Edge,
    Node,
    useNodesState,
    useEdgesState
} from '@xyflow/react';
// @ts-ignore
import '@xyflow/react/dist/style.css';

// --- ТИПИЗАЦИЯ СХЕМЫ ---
export interface DBColumn {
    name: string;
    type: string;
    isPk?: boolean;
    isFk?: boolean;
}

export interface DBTable extends Record<string, unknown> {
    name: string;
    columns: DBColumn[];
}

export interface DBRelation {
    sourceTable: string;
    targetTable: string;
}

interface ERDDiagramProps {
    tables: DBTable[];
    relations: DBRelation[];
    onRefresh?: () => Promise<{ tables: DBTable[], relations: DBRelation[] } | null>; 
}

// --- КАСТОМНЫЙ УЗЕЛ: ТАБЛИЦА ---
const TableNode = ({ data }: { data: DBTable }) => {
    return (
        <div className="erd-table-node">
            <Handle type="target" position={Position.Left} id="target-left" style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Left} id="source-left" style={{ opacity: 0 }} />
            
            <div className="erd-table-header">
                {data.name}
            </div>
            
            <div className="erd-table-body">
                {data.columns.map((col) => (
                    <div key={col.name} className="erd-table-row">
                        <span className="erd-col-name">
                            {col.isPk && <span className="erd-badge pk">PK</span>}
                            {col.isFk && <span className="erd-badge fk">FK</span>}
                            {col.name}
                        </span>
                        <span className="erd-col-type">{col.type}</span>
                    </div>
                ))}
            </div>

            <Handle type="source" position={Position.Right} id="source-right" style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Right} id="target-right" style={{ opacity: 0 }} />
        </div>
    );
};

const nodeTypes = {
    databaseTable: TableNode,
};

export const ERDDiagram: React.FC<ERDDiagramProps> = ({ tables, relations, onRefresh }) => {
    const [isPinned, setIsPinned] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    
    // Стейты для обновления и Pop-up
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isPopupExiting, setIsPopupExiting] = useState(false);
    const [popupContent, setPopupContent] = useState<React.ReactNode>(null);
    
    // Рефы для управления таймерами (используем ReturnType<typeof setTimeout> для TS)
    const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Функция, которая запускает анимацию закрытия
    const triggerClosePopup = () => {
        setIsPopupExiting(true);
        // Ждем 300мс пока проиграет анимация выезда влево, затем удаляем элемент
        exitTimerRef.current = setTimeout(() => {
            setShowPopup(false);
            setIsPopupExiting(false);
        }, 300);
    };

    // Логика обновления схемы
    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        
        // Очищаем старые таймеры и сбрасываем стейты при новом запуске
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        setIsPopupExiting(false);
        setShowPopup(false);
        
        const newSchema = await onRefresh();
        setIsRefreshing(false);
        
        if (!newSchema) return;

        const oldCols = new Set(tables.flatMap(t => t.columns.map(c => `${t.name}.${c.name}`)));
        const newColsArr = newSchema.tables.flatMap(t => t.columns.map(c => `${t.name}.${c.name}`));
        const newColsSet = new Set(newColsArr);

        const added = newColsArr.filter(c => !oldCols.has(c));
        const removed = Array.from(oldCols).filter(c => !newColsSet.has(c));
        
        // Считаем общее количество изменений
        const totalChanges = added.length + removed.length;

        if (totalChanges === 0) {
            setPopupContent(<div style={{ fontWeight: 500, color: '#333' }}>Изменений в схеме БД нет</div>);
        } else {
            setPopupContent(
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>Результат обновления:</div>
                    
                    {added.length > 0 && (
                        <div style={{ color: '#333' }}>
                            <span style={{ color: '#11d511', fontWeight: 600 }}>+ Добавлены: </span>
                            {added.join(', ')}
                        </div>
                    )}
                    
                    {removed.length > 0 && (
                        <div style={{ color: '#333' }}>
                            <span style={{ color: '#ff0000', fontWeight: 600 }}>- Удалены: </span>
                            {removed.join(', ')}
                        </div>
                    )}
                </div>
            );
        }
        
        setShowPopup(true);

        // --- ДИНАМИЧЕСКИЙ ТАЙМЕР ---
        // Если изменений нет = 3 сек. Иначе = (кол-во изменений * 3 сек)
        const displayTimeMs = totalChanges === 0 ? 3000 : totalChanges * 3000;
        
        popupTimerRef.current = setTimeout(() => triggerClosePopup(), displayTimeMs); 
    };

    // Функция ручного закрытия поп-апа (крестиком)
    const handleClosePopup = () => {
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        triggerClosePopup();
    };

    // --- АВТОМАТИЧЕСКАЯ РАССТАНОВКА (УМНЫЙ GRID) ---
    const initialNodes: Node<DBTable>[] = useMemo(() => {
        const columnsPerRow = 3; 
        const spacingX = 350;    
        const verticalGap = 50;  

        const connectedTableNames = new Set<string>();
        relations.forEach(rel => {
            connectedTableNames.add(rel.sourceTable);
            connectedTableNames.add(rel.targetTable);
        });

        const isolatedTables = tables.filter(t => !connectedTableNames.has(t.name));
        const connectedTables = tables.filter(t => connectedTableNames.has(t.name));

        const newNodes: Node<DBTable>[] = [];

        let isolatedY = 0;
        isolatedTables.forEach((table) => {
            const estimatedTableHeight = 45 + (table.columns.length * 35);
            newNodes.push({
                id: table.name,
                type: 'databaseTable',
                position: { x: 0, y: isolatedY }, 
                data: table,
            });
            isolatedY += estimatedTableHeight + verticalGap;
        });

        const offsetX = isolatedTables.length > 0 ? spacingX : 0;
        const columnHeights = new Array(columnsPerRow).fill(0);

        connectedTables.forEach((table, index) => {
            const colIndex = index % columnsPerRow;
            const estimatedTableHeight = 45 + (table.columns.length * 35);

            newNodes.push({
                id: table.name,
                type: 'databaseTable',
                position: { x: offsetX + (colIndex * spacingX), y: columnHeights[colIndex] },
                data: table,
            });

            columnHeights[colIndex] += estimatedTableHeight + verticalGap;
        });

        return newNodes;
    }, [tables, relations]);

    // --- ФОРМИРОВАНИЕ СВЯЗЕЙ ---
    const initialEdges: Edge[] = useMemo(() => {
        return relations.map((rel, index) => ({
            id: `edge-${index}`,
            source: rel.sourceTable,
            target: rel.targetTable,
            type: 'straight',
            animated: false,
            style: { stroke: '#9ca3af', strokeWidth: 2 },
            markerEnd: 'sharp-arrow', 
        }));
    }, [relations]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (sourceNode && targetNode) {
                    const isSourceRightOfTarget = sourceNode.position.x > targetNode.position.x;
                    const newSourceHandle = isSourceRightOfTarget ? 'source-left' : 'source-right';
                    const newTargetHandle = isSourceRightOfTarget ? 'target-right' : 'target-left';

                    if (edge.sourceHandle !== newSourceHandle || edge.targetHandle !== newTargetHandle) {
                        return {
                            ...edge,
                            sourceHandle: newSourceHandle,
                            targetHandle: newTargetHandle,
                        };
                    }
                }
                return edge;
            })
        );
    }, [nodes, setEdges]);

    return (
        <div className={`sample-container ${isPinned ? 'pinned' : ''} ${isHidden ? 'hidden-state' : ''}`} style={{ marginTop: '12px' }}>
            <div className="sample-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                    onClick={() => setIsPinned(!isPinned)} 
                    className={`sample-btn ${isPinned ? 'active' : ''}`}
                    title={isPinned ? 'Открепить' : 'Закрепить сверху'}
                    style={{ padding: '4px 6px', display: 'flex', alignItems: 'center' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="17" x2="12" y2="22"></line>
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.24V6a3 3 0 0 0-3-3h-0a3 3 0 0 0-3 3v5.24a2 2 0 0 1-1.11 1.31l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                    </svg>
                </button>

                <button 
                    onClick={() => setIsHidden(!isHidden)} 
                    className="sample-btn"
                    title={isHidden ? 'Развернуть' : 'Свернуть'}
                    style={{ padding: '4px 6px', display: 'flex', alignItems: 'center' }}
                >
                    <svg 
                        style={{ transform: isHidden ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} 
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </button>

                {!isHidden && (
                    <button 
                        onClick={handleRefresh} 
                        className="sample-btn" 
                        title="Обновить схему"
                        disabled={isRefreshing}
                        style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', opacity: isRefreshing ? 0.5 : 1, cursor: isRefreshing ? 'wait' : 'pointer' }}
                    >
                        <svg className={isRefreshing ? "spin-animation" : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                )}

                <span style={{ fontSize: '13px', color: '#666', marginLeft: '4px', fontWeight: 500 }}>
                    Схема базы данных (ERD)
                </span>
            </div>

            <div className={`table-wrapper ${isHidden ? 'collapsed' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                {/* POP-UP ОБНОВЛЕНИЯ */}
                {showPopup && (
                    <div style={{
                        position: 'absolute', top: '16px', left: '16px', 
                        background: '#ffffff', border: '1px solid #dce4ec', borderRadius: '12px',
                        padding: '16px 40px 16px 20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
                        zIndex: 1000, fontSize: '13px', 
                        minWidth: '250px', 
                        
                        // --- НОВЫЕ СТИЛИ ДЛЯ ШИРИНЫ И ПЕРЕНОСОВ ---
                        maxWidth: '33.33%', // 1/3 ширины контейнера
                        wordBreak: 'break-word', // Перенос слишком длинных названий таблиц/столбцов
                        whiteSpace: 'normal', // Разрешаем перенос текста на новые строки
                        lineHeight: '1.5', // Чуть увеличим межстрочный интервал для читаемости
                        // ------------------------------------------

                        animation: isPopupExiting ? 'slideOutLeft 0.3s ease-in forwards' : 'slideInLeft 0.3s ease-out forwards'
                    }}>
                        <button 
                            onClick={handleClosePopup}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#9ca3af', padding: '4px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1f2937'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                            title="Закрыть"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        {popupContent}
                    </div>
                )}

                <div style={{ width: '100%', height: '400px' }}>
                    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                        <defs>
                            <marker id="sharp-arrow" viewBox="0 0 24 12" refX="20" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                                <path d="M 0 0 L 24 6 L 0 12 Z" fill="#9ca3af" />
                            </marker>
                        </defs>
                    </svg>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        minZoom={0.2}
                        maxZoom={2}
                    >
                        <Background color="#e5e7eb" gap={20} size={1} />
                        <Controls showInteractive={true} style={{ marginBottom: '65px' }}/>
                    </ReactFlow>
                </div>
            </div>
            
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1s linear infinite; }
                
                /* Анимации для Pop-up */
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-120%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOutLeft {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(-120%); }
                }
            `}</style>
        </div>
    );
};