# Components

Shared React components for the BG AI Software Factory.

## Directory Structure

```
components/
├── dashboard/          # Dashboard-specific widgets
│   ├── AgentStatusPanel.tsx    — AI agent swarm status display
│   └── IntelligenceFlow.tsx    — React Flow pipeline visualization
├── layout/             # App shell components
│   ├── Sidebar.tsx             — Left navigation (6 sections, 40+ items)
│   └── RightPane.tsx           — Right telemetry panel
├── providers/          # React context providers
│   └── SessionProvider.tsx     — NextAuth session wrapper
├── tools/              # AI tool components
│   └── UniversalToolRunner.tsx — Generic AI tool runner
└── ui/                 # Shared UI primitives
    ├── Toast.tsx               — Toast notification system
    └── UpgradeGate.tsx         — Tier-based feature gating
```

## Usage

```tsx
import Sidebar from '@/components/layout/Sidebar';
import ToastContainer from '@/components/ui/Toast';
import UpgradeGate from '@/components/ui/UpgradeGate';
```
