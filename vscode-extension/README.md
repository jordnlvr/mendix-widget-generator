# 🤖 Mendix Widget Agent

> **AI-powered Mendix Pluggable Widget generator with natural language interface**

[![VS Code](https://img.shields.io/badge/VS%20Code-Chat%20Participant-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)
[![Mendix](https://img.shields.io/badge/Mendix-10.x%20|%2011.x-0CABF7?logo=mendix)](https://mendix.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Stop writing boilerplate. Start describing what you need.**

Type `@mendix-widget` in VS Code chat and describe your widget in plain English. The AI handles the rest:

```
@mendix-widget create a status badge that shows red, yellow, or green based on a status enum
```

## ✨ Features

| Feature                      | Description                                  |
| ---------------------------- | -------------------------------------------- |
| 🧠 **Natural Language**      | Describe widgets in plain English            |
| 🔍 **Smart Path Validation** | Finds .mpr files, knows where widgets go     |
| 🔬 **Beast Mode Research**   | 6-tier exhaustive search for patterns        |
| 🔄 **Auto-Fix Loop**         | Analyzes errors and fixes them automatically |
| 🚀 **Auto-Deploy**           | Deploys directly to your Mendix project      |
| 📦 **10+ Templates**         | Pre-built patterns for common widgets        |

## 🚀 Quick Start

### 1. Install the Extension

```bash
# From VS Code Marketplace (coming soon)
# Or build from source:
cd vscode-extension
npm install
npm run compile
```

### 2. Open Chat and Type

```
@mendix-widget create a rating widget with 5 stars
```

### 3. Answer the Questions

The AI will ask smart questions:

- Where should I create this widget?
- Do you have a Mendix project to deploy to?
- Should the rating be editable or read-only?

### 4. Watch It Build

The agent:

1. Generates widget code
2. Runs `npm install`
3. Builds the widget
4. If errors occur → researches fixes → retries
5. Deploys to your Mendix project

## 💬 Commands

| Command     | Description                      | Example                              |
| ----------- | -------------------------------- | ------------------------------------ |
| `/create`   | Create a widget from description | `/create progress bar with gradient` |
| `/template` | Use a pre-built template         | `/template status-badge`             |
| `/deploy`   | Deploy to Mendix project         | `/deploy D:\MendixProjects\MyApp`    |
| `/fix`      | Analyze and fix build errors     | `/fix` (paste errors)                |
| `/research` | Beast Mode pattern research      | `/research drag and drop widgets`    |

## 📦 Available Templates

| Template        | Description                     |
| --------------- | ------------------------------- |
| `status-badge`  | Colored badge based on status   |
| `data-card`     | Card with title, content, image |
| `progress-bar`  | Animated progress indicator     |
| `rating`        | Star rating input               |
| `icon-button`   | Button with icon and label      |
| `countdown`     | Timer to target date            |
| `text-input`    | Enhanced input with validation  |
| `modal-trigger` | Button that opens modal         |
| `file-upload`   | Drag-and-drop upload            |
| `tabs`          | Tab navigation                  |

## 🧠 How It Works

### The AI Brain

When you describe a widget, the AI:

1. **Understands** your natural language description
2. **Infers** properties, events, and types
3. **Asks** smart clarifying questions
4. **Generates** a widget configuration
5. **Executes** the generator engine
6. **Fixes** any build errors automatically

### Intelligent Path Validation

When you provide a path like `D:\MendixProjects\MyApp`:

```
✓ Finds the .mpr file
✓ Navigates to the widgets folder automatically
✓ Checks for naming conflicts
✓ Creates the folder if needed
✓ Provides helpful suggestions if something's wrong
```

**Not a monkey** - actually understands Mendix project structure!

### Beast Mode Research

When you ask about patterns or get stuck, Beast Mode searches **6 tiers**:

| Tier | Sources                                      |
| ---- | -------------------------------------------- |
| 1    | Official Mendix docs, API references         |
| 2    | GitHub code (mendix/widgets-resources is 🏆) |
| 3    | npm packages depending on @mendix/\*         |
| 4    | Community forums, Stack Overflow             |
| 5    | Web archives (Wayback Machine)               |
| 6    | YouTube, Mendix Academy, Mendix World        |

**Beast Mode never gives up.** It searches ALL tiers before saying "I don't know."

### Research → Build → Test → Fix Loop

```
┌─────────────────────────────────────────────────────────┐
│                    BUILD LOOP                            │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Generate │ → │  Build   │ → │  Test    │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│       ↑                              │                   │
│       │                              ↓                   │
│       │                        ┌──────────┐             │
│       └──────── FIX ←──────── │  Error?  │             │
│                                └──────────┘             │
│                                      │                   │
│                                      ↓ No               │
│                                ┌──────────┐             │
│                                │ Deploy!  │             │
│                                └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

The loop:

1. Generates widget code
2. Runs build
3. If errors → analyzes them with AI
4. Applies fixes automatically
5. Retries (up to 3 attempts)
6. Deploys when successful

## ⚙️ Configuration

Access via Settings → Extensions → Mendix Widget Agent

| Setting                                | Description                   | Default |
| -------------------------------------- | ----------------------------- | ------- |
| `mendixWidget.defaultMendixProject`    | Default Mendix project path   | (empty) |
| `mendixWidget.defaultWorkFolder`       | Default widget output folder  | (empty) |
| `mendixWidget.autoInstallDependencies` | Run npm install automatically | `true`  |
| `mendixWidget.autoBuild`               | Build widget after generation | `true`  |
| `mendixWidget.autoDeploy`              | Deploy to Mendix project      | `false` |
| `mendixWidget.beastModeEnabled`        | Enable exhaustive research    | `true`  |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    @mendix-widget Chat Participant                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User: "Create a pie chart widget for budget data"                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                        AI BRAIN                                 │ │
│  │                                                                 │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                      │ │
│  │  │ Natural Language │  │ Beast Mode      │                      │ │
│  │  │ Understanding    │  │ Research        │                      │ │
│  │  └────────┬────────┘  └────────┬────────┘                      │ │
│  │           │                     │                               │ │
│  │           ↓                     ↓                               │ │
│  │  ┌─────────────────────────────────────────┐                   │ │
│  │  │         Widget Configuration            │                   │ │
│  │  │  { name, properties, events, ... }      │                   │ │
│  │  └────────────────────┬────────────────────┘                   │ │
│  └───────────────────────│─────────────────────────────────────────┘ │
│                          │                                           │
│  ┌───────────────────────↓─────────────────────────────────────────┐ │
│  │                 PATH VALIDATOR                                   │ │
│  │  ✓ Find .mpr    ✓ widgets folder    ✓ Check conflicts          │ │
│  └───────────────────────┬─────────────────────────────────────────┘ │
│                          │                                           │
│  ┌───────────────────────↓─────────────────────────────────────────┐ │
│  │              GENERATOR BRIDGE                                    │ │
│  │  Calls → cli/generator.js (or PowerShell fallback)              │ │
│  └───────────────────────┬─────────────────────────────────────────┘ │
│                          │                                           │
│  ┌───────────────────────↓─────────────────────────────────────────┐ │
│  │                 BUILD LOOP                                       │ │
│  │  Generate → Build → Test → (Fix if needed) → Deploy             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Result: Widget deployed to Mendix project! 🎉                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Components

| Component        | File                         | Purpose                            |
| ---------------- | ---------------------------- | ---------------------------------- |
| Extension Entry  | `src/extension.ts`           | Registers participant and commands |
| Chat Participant | `src/chatParticipant.ts`     | Handles all chat interactions      |
| Path Validator   | `src/mendixPathValidator.ts` | Smart Mendix path validation       |
| Generator Bridge | `src/generatorBridge.ts`     | Connects to CLI generator          |
| Beast Mode       | `src/beastModeResearch.ts`   | 6-tier research protocol           |
| Build Loop       | `src/buildLoop.ts`           | Research → Build → Fix loop        |

## 📁 Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts          # Entry point
│   ├── chatParticipant.ts    # Chat handler
│   ├── mendixPathValidator.ts # Path validation
│   ├── generatorBridge.ts    # Generator connection
│   ├── beastModeResearch.ts  # Research protocol
│   └── buildLoop.ts          # Build/fix loop
├── resources/
│   └── icon.png              # Extension icon
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- VS Code 1.95+
- Mendix 10.x or 11.x (for testing)

### Building

```bash
cd vscode-extension
npm install
npm run compile
```

### Testing

1. Open the `vscode-extension` folder in VS Code
2. Press F5 to launch Extension Development Host
3. In the new window, open chat and type `@mendix-widget`

### Packaging

```bash
npm run package
# Creates mendix-widget-agent-1.0.0.vsix
```

## 🚧 Future Improvements

- [ ] **Widget Preview** - Live preview in VS Code
- [ ] **Visual Editor** - Drag-and-drop widget builder
- [ ] **Marketplace Templates** - Download community templates
- [ ] **Version Management** - Handle widget version upgrades
- [ ] **Multi-Widget Projects** - Generate related widgets together
- [ ] **Test Generation** - Auto-generate unit tests
- [ ] **Documentation Generation** - Auto-generate widget docs
- [ ] **GitHub Integration** - Push widgets to repository

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](../CONTRIBUTING.md) first.

---

**Made with ❤️ for the Mendix community**
