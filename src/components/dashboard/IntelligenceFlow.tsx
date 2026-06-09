'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { 
    id: '1', 
    position: { x: 250, y: 50 }, 
    data: { label: '1. Idea Input' },
    style: { background: '#1e3a5f', color: '#fff', border: '1px solid #4dabf7', borderRadius: '8px', padding: '10px', fontWeight: 'bold' }
  },
  { 
    id: '2', 
    position: { x: 250, y: 150 }, 
    data: { label: '2. Bhagvad Gita Intelligence Engine' },
    style: { background: '#1a4d2e', color: '#fff', border: '1px solid #51cf66', borderRadius: '8px', padding: '10px', width: 200 }
  },
  { 
    id: '3', 
    position: { x: 250, y: 250 }, 
    data: { label: '3. Architecture & Planning' },
    style: { background: '#4c2858', color: '#fff', border: '1px solid #cc5de8', borderRadius: '8px', padding: '10px', width: 200 }
  },
  { 
    id: '4', 
    position: { x: 250, y: 350 }, 
    data: { label: '4. Multi-Agent Orchestration' },
    style: { background: '#5c4716', color: '#fff', border: '1px solid #fcc419', borderRadius: '8px', padding: '10px', width: 200 }
  },
  { 
    id: '5', 
    position: { x: 250, y: 450 }, 
    data: { label: '5. OpenCode Execution Engine' },
    style: { background: '#5c2424', color: '#fff', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '10px', width: 200 }
  },
  { 
    id: '6', 
    position: { x: 250, y: 550 }, 
    data: { label: '6. Validation & Audit Engine' },
    style: { background: '#1a3b5c', color: '#fff', border: '1px solid #339af0', borderRadius: '8px', padding: '10px', width: 200 }
  },
  { 
    id: '7', 
    position: { x: 250, y: 650 }, 
    data: { label: '7. Deployment Engine' },
    style: { background: '#204033', color: '#fff', border: '1px solid #20c997', borderRadius: '8px', padding: '10px', width: 200 }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, style: { stroke: '#3b82f6' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, style: { stroke: '#3b82f6' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, style: { stroke: '#3b82f6' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, style: { stroke: '#3b82f6' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, style: { stroke: '#3b82f6' } },
  { id: 'e6-7', source: '6', target: '7', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, style: { stroke: '#3b82f6' } },
];

export default function IntelligenceFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full bg-black/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
      >
        <Controls className="bg-black/80 border border-gray-700 fill-white" />
        <MiniMap 
          nodeColor={(node) => {
            return node.style?.background as string || '#eee';
          }}
          maskColor="rgba(0,0,0,0.7)"
          className="bg-black/50 border border-[var(--color-glass-border)] rounded-lg" 
        />
        <Background color="#333" gap={16} />
      </ReactFlow>
    </div>
  );
}
