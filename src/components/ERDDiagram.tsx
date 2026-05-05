import React, { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Handle,
  Position,
  MarkerType,
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
}

// --- КАСТОМНЫЙ УЗЕЛ: ТАБЛИЦА ---
// --- КАСТОМНЫЙ УЗЕЛ: ТАБЛИЦА ---
const TableNode = ({ data }: { data: DBTable }) => {
    return (
        <div className="erd-table-node">
            {/* Невидимые ручки СЛЕВА (и для входа, и для выхода) */}
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

            {/* Невидимые ручки СПРАВА (и для входа, и для выхода) */}
            <Handle type="source" position={Position.Right} id="source-right" style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Right} id="target-right" style={{ opacity: 0 }} />
        </div>
    );
};

const nodeTypes = {
    databaseTable: TableNode,
};

export const ERDDiagram: React.FC<ERDDiagramProps> = ({ tables, relations }) => {
    const [isPinned, setIsPinned] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    
    // --- АВТОМАТИЧЕСКАЯ РАССТАНОВКА (УМНЫЙ GRID) ---
    const initialNodes: Node<DBTable>[] = useMemo(() => {
        const columnsPerRow = 3; // Количество колонок для связанных таблиц
        const spacingX = 350;    // Расстояние между колонками по горизонтали
        const verticalGap = 50;  // Отступ между таблицами по вертикали

        // 1. Собираем имена всех таблиц, у которых есть связи
        const connectedTableNames = new Set<string>();
        relations.forEach(rel => {
            connectedTableNames.add(rel.sourceTable);
            connectedTableNames.add(rel.targetTable);
        });

        // 2. Разделяем таблицы на две группы
        const isolatedTables = tables.filter(t => !connectedTableNames.has(t.name));
        const connectedTables = tables.filter(t => connectedTableNames.has(t.name));

        const newNodes: Node<DBTable>[] = [];

        // 3. Расставляем ИЗОЛИРОВАННЫЕ таблицы (в отдельную колонку слева)
        let isolatedY = 0;
        isolatedTables.forEach((table) => {
            const estimatedTableHeight = 45 + (table.columns.length * 35);
            newNodes.push({
                id: table.name,
                type: 'databaseTable',
                position: { x: 0, y: isolatedY }, // Всегда x = 0
                data: table,
            });
            isolatedY += estimatedTableHeight + verticalGap;
        });

        // 4. Расставляем СВЯЗАННЫЕ таблицы (правее изолированных)
        // Если изолированные таблицы есть, сдвигаем основную сетку вправо на одну колонку
        const offsetX = isolatedTables.length > 0 ? spacingX : 0;
        const columnHeights = new Array(columnsPerRow).fill(0);

        connectedTables.forEach((table, index) => {
            const colIndex = index % columnsPerRow;
            const estimatedTableHeight = 45 + (table.columns.length * 35);

            newNodes.push({
                id: table.name,
                type: 'databaseTable',
                position: {
                    x: offsetX + (colIndex * spacingX),
                    y: columnHeights[colIndex],
                },
                data: table,
            });

            columnHeights[colIndex] += estimatedTableHeight + verticalGap;
        });

        return newNodes;
    }, [tables, relations]); // Добавили relations в зависимости useMemo

    // --- ФОРМИРОВАНИЕ СВЯЗЕЙ ---
    const initialEdges: Edge[] = useMemo(() => {
        return relations.map((rel, index) => ({
            id: `edge-${index}`,
            source: rel.sourceTable,
            target: rel.targetTable,
            type: 'straight',
            animated: false,
            style: { stroke: '#9ca3af', strokeWidth: 2 },
            markerEnd: 'sharp-arrow', // <-- Ссылаемся на наш кастомный маркер
        }));
    }, [relations]);

    // Инициализируем локальные стейты React Flow для возможности перетаскивания
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Если придут новые таблицы/связи, обновляем граф
    // Динамическое переключение сторон связей при перетаскивании таблиц
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (sourceNode && targetNode) {
                    // Проверяем, находится ли таблица-источник правее, чем таблица-цель
                    const isSourceRightOfTarget = sourceNode.position.x > targetNode.position.x;
                    
                    const newSourceHandle = isSourceRightOfTarget ? 'source-left' : 'source-right';
                    const newTargetHandle = isSourceRightOfTarget ? 'target-right' : 'target-left';

                    // Обновляем edge только если сторона изменилась
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

                <span style={{ fontSize: '13px', color: '#666', marginLeft: '4px', fontWeight: 500 }}>
                    Схема базы данных (ERD)
                </span>
            </div>

            <div className={`table-wrapper ${isHidden ? 'collapsed' : ''}`}>
                <div style={{ width: '100%', height: '400px' }}>
                    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                        <defs>
                            <marker
                                id="sharp-arrow"
                                viewBox="0 0 24 12"
                                refX="20" /* Чуть уменьшили, чтобы кончик касался границы */
                                refY="6"
                                markerWidth="10" /* Уменьшили масштаб (было 16) */
                                markerHeight="10" /* Уменьшили масштаб (было 16) */
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 24 6 L 0 12 Z" fill="#9ca3af" />
                            </marker>
                        </defs>
                    </svg>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange} // Теперь узлы можно перемещать!
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
        </div>
    );
};