# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-01-15

### 🤖 Major Release: AI-Powered VS Code Extension

This release adds an AI-driven VS Code Chat Participant that understands natural language
and generates Mendix widgets autonomously.

### Added

- **🧠 VS Code Chat Participant (`@mendix-widget`)**

  - Natural language widget creation: "create a rating widget with 5 stars"
  - Smart clarifying questions powered by LLM
  - `/create` - Create widgets from natural language
  - `/template` - Use built-in templates
  - `/deploy` - Deploy to Mendix project
  - `/fix` - Analyze and fix build errors
  - `/research` - Beast Mode pattern research

- **🔍 Intelligent Path Validation**

  - Automatically finds `.mpr` files in given path
  - Navigates to correct `widgets` folder
  - Checks for naming conflicts
  - Generates unique names when needed

- **🔬 Beast Mode Research Protocol**

  - 6-tier exhaustive search: Official docs → GitHub → npm → Community → Archives → Video
  - Never gives up - researches until solution found
  - Integrates with error analysis for auto-fixes

- **🔄 Self-Healing Build Loop**

  - Research → Build → Test → Fix cycle
  - Pattern-based fast fixes (missing imports, etc.)
  - AI-powered fixes for complex errors
  - Up to 3 automatic retry attempts

- **📖 Comprehensive Documentation**
  - VS Code Extension README with user guide
  - ARCHITECTURE.md with technical details
  - GitHub Pages dedicated extension page

### Technical Details

- VS Code Chat Participant API (v1.95+)
- LLM integration via `vscode.lm.selectChatModels`
- TypeScript source in `vscode-extension/src/`
- Bridges to existing CLI generator engine

---

## [2.0.0] - 2025-12-15

### 🎉 Major Release: World-Class Edition

This release transforms the generator from a PowerShell-only tool into a cross-platform,
npm-publishable solution with a beautiful web UI.

### Added

- **🌐 npm/npx Support**

  - `npx create-mendix-widget` - works on Windows, macOS, and Linux
  - Short alias: `cmw`
  - Interactive wizard mode
  - Template mode: `--template status-badge`
  - Config mode: `--config widget.json`

- **🖥️ Web UI**

  - Visual widget configurator at `web/index.html`
  - Quick-start templates (click to load)
  - Add properties and events visually
  - Live preview of JSON config and XML
  - Download or copy generated config
  - Dark theme with smooth animations

- **📦 10 Built-in Templates**

  - `status-badge` - Colored status indicator with label
  - `data-card` - Repeating card layout for datasource
  - `text-input` - Custom validated input field
  - `progress-bar` - Visual progress indicator
  - `icon-button` - Button with icon and optional label
  - `tabs` - Tabbed content container
  - `modal-trigger` - Button that opens a modal popup
  - `file-upload` - Drag-and-drop file uploader
  - `countdown` - Countdown to a target date/time
  - `rating` - Interactive star rating component

- **📄 Open Source Files**
  - MIT License
  - Contributing guidelines
  - Code of Conduct (Contributor Covenant)
  - Security policy
  - GitHub Actions CI/CD workflow

### Changed

- Restructured CLI using Commander.js for better UX
- Modular architecture: wizard.js, generator.js, templates.js
- ES Modules for modern JavaScript support

### Technical Details

- Node.js 18+ (ESM)
- chalk ^5.3.0 (terminal colors)
- commander ^12.0.0 (CLI framework)
- enquirer ^2.4.1 (interactive prompts)
- ora ^8.0.1 (spinners)
- fs-extra ^11.2.0 (file operations)

---

## [1.0.0] - 2025-12-15

### Added

- 🚀 **Initial Release**
- Interactive widget wizard (`New-Widget.ps1`)
- Config-driven generator (`Generate-WidgetFromConfig.ps1`)
- Template-based generator (`Generate-Widget.ps1`)
- Comprehensive test suite (`Test-Generator.ps1`)
- JSON schema for widget configs
- VS Code snippets for all property types

### Features

- **Auto-Build**: Automatically runs `npm install` and `npm run build`
- **Auto-Deploy**: Copies MPK to test project on successful build
- **Auto-Cleanup**: Preserves failed widgets with timestamp for debugging
- **15+ Property Types**: Full support for all Mendix property types
  - string, boolean, integer, decimal
  - enumeration (both array and object formats)
  - textTemplate, expression
  - action (events)
  - attribute, datasource, widgets
  - image, icon, association, object

### Tested Widget Types

All passing (5/5):

- ✅ Simple (string + boolean)
- ✅ Enumeration (dropdown with values)
- ✅ Expression (dynamic expressions)
- ✅ Attribute (entity attribute binding)
- ✅ Datasource (list with widgets container)

### Technical Details

- Built on `pluggable-widgets-tools ~10.21.2`
- React 18.2.0
- TypeScript with strict mode
- Compatible with Mendix Studio Pro 10+/11+

---

## [Unreleased]

### Planned

- [ ] npm package (`npx create-mendix-widget`)
- [ ] Cross-platform support (macOS/Linux)
- [ ] GitHub Actions CI/CD
- [ ] Widget gallery with more examples
- [ ] Visual Studio Code extension
