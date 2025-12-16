# 🧙 Mendix Widget Generator

[![GitHub release](https://img.shields.io/github/v/release/jordnlvr/mendix-widget-generator?style=flat-square)](https://github.com/jordnlvr/mendix-widget-generator/releases)
[![npm version](https://img.shields.io/npm/v/create-mendix-widget?style=flat-square&color=cb3837)](https://www.npmjs.com/package/create-mendix-widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Mendix](https://img.shields.io/badge/Mendix-10%2B%20%7C%2011%2B-0595DB?style=flat-square)](https://mendix.com)

> **Zero to deployed widget in 60 seconds.** The fastest way to create Mendix pluggable widgets.

---

## 🌐 Live Demo & Documentation

**📖 Documentation Site:** [jordnlvr.github.io/mendix-widget-generator](https://jordnlvr.github.io/mendix-widget-generator/)

**🖥️ Visual Configurator:** [jordnlvr.github.io/mendix-widget-generator/configurator.html](https://jordnlvr.github.io/mendix-widget-generator/configurator.html)

---

## ❓ What Is This?

This is a **code generator tool** (NOT an AI chatbot) that creates Mendix pluggable widgets. It provides:

1. **Visual Web Configurator** - A form-based UI where you click buttons, fill in fields, and download a config file
2. **CLI Wizard** - An interactive command-line tool that asks you questions step by step
3. **Template Library** - 10 pre-built widget configurations you can use as starting points
4. **Auto-Build & Deploy** - Automatically runs npm install, builds the widget, and optionally deploys to your Mendix project

### How It Works

```
┌─────────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Web Configurator   │ ──▶  │   JSON Config    │ ──▶  │  Generated      │
│  (or CLI Wizard)    │      │   (widget spec)  │      │  Widget Code    │
└─────────────────────┘      └──────────────────┘      └─────────────────┘
         │                                                      │
         │                                                      ▼
         │                                              ┌─────────────────┐
         └─────────────────────────────────────────────▶│  .mpk file      │
                                                        │  (ready to use) │
                                                        └─────────────────┘
```

---

## 🚀 Quick Start

### Option 1: Web Configurator (Easiest)

1. Go to **[jordnlvr.github.io/mendix-widget-generator/configurator.html](https://jordnlvr.github.io/mendix-widget-generator/configurator.html)**
2. Click a template (e.g., "Status Badge") or start blank
3. Add properties and events using the form
4. Click **"Download"** to save the JSON config
5. Run:
   ```bash
   npx create-mendix-widget --config my-widget.json
   ```

### Option 2: CLI Wizard

```bash
npx create-mendix-widget
```

The wizard will ask:
1. **Widget name** (PascalCase, e.g., `StatusBadge`)
2. **Display name** (shown in Studio Pro toolbox)
3. **Description**
4. **Category** (Display, Input controls, Data controls, etc.)
5. **Properties** (add as many as you need)
6. **Events** (on click, on change, etc.)
7. **Output directory** (where to create the widget)
8. **Mendix project path** (optional - auto-deploys the .mpk)

### Option 3: Use a Template

```bash
# See all templates
npx create-mendix-widget --list-templates

# Use a template directly
npx create-mendix-widget --template status-badge

# Use a template with custom name
npx create-mendix-widget --template status-badge MyStatusWidget
```

### Option 4: Config File

```bash
npx create-mendix-widget --config widget-config.json --output ./my-widgets
```

---

## 📦 Built-in Templates

| Template | Description |
|----------|-------------|
| `status-badge` | Colored status indicator with label |
| `data-card` | Card component that repeats for datasource items |
| `text-input` | Custom text input with validation |
| `progress-bar` | Visual progress indicator |
| `icon-button` | Button with icon and optional label |
| `tabs` | Tabbed content container |
| `modal-trigger` | Button that opens a modal popup |
| `file-upload` | Drag-and-drop file uploader |
| `countdown` | Countdown to a target date/time |
| `rating` | Interactive star rating component |

---

## 🖥️ Using the Web Configurator

The visual configurator at **[configurator.html](https://jordnlvr.github.io/mendix-widget-generator/configurator.html)** lets you:

### 1. Start with a Template
Click any template card (Status Badge, Data Card, etc.) to pre-fill the form with that widget's configuration.

### 2. Customize the Widget
- **Widget Name**: Must be PascalCase (e.g., `MyWidget`)
- **Display Name**: What appears in Studio Pro's toolbox
- **Category**: Determines which toolbox section it appears in

### 3. Add Properties
Click "+ Add Property" and configure:
- **Key**: camelCase identifier (e.g., `labelText`)
- **Type**: String, Boolean, Enumeration, Attribute, Datasource, etc.
- **Caption**: Label shown in Studio Pro
- **Required**: Whether the property must be set

### 4. Add Events
Click "+ Add Event" for action handlers like onClick, onChange, onSelect.

### 5. Export & Generate
- **Copy JSON**: Copy the config to clipboard
- **Download**: Save as a `.json` file
- Use with: `npx create-mendix-widget --config your-config.json`

### 6. Preview Tabs
- **config.json**: The JSON config you'll download
- **Widget.xml**: Preview of the generated XML
- **Command**: The CLI command to run

---

## ⚙️ CLI Options

```bash
npx create-mendix-widget [name] [options]

Arguments:
  name                    Widget name (PascalCase)

Options:
  -t, --template <name>   Use a pre-built template
  -c, --config <path>     Generate from JSON config file
  -o, --output <path>     Output directory (default: current folder)
  -m, --mendix <path>     Mendix project widgets folder (auto-deploy)
  -l, --list-templates    Show all available templates
  --no-install            Skip npm install
  --no-build              Skip npm run build
  -V, --version           Show version
  -h, --help              Show help
```

### Examples

```bash
# Interactive wizard
npx create-mendix-widget

# Use template, output to specific folder
npx create-mendix-widget --template rating --output ./my-widgets

# Auto-deploy to Mendix project
npx create-mendix-widget --template status-badge --mendix "C:/Projects/MyApp/widgets"

# From config with auto-deploy
npx create-mendix-widget --config widget.json --mendix "C:/Projects/MyApp/widgets"
```

---

## 📋 JSON Config Format

```json
{
  "widget": {
    "name": "StatusBadge",
    "displayName": "Status Badge",
    "description": "Displays a colored status indicator",
    "category": "Display",
    "company": "mycompany"
  },
  "properties": [
    {
      "key": "status",
      "type": "enumeration",
      "caption": "Status",
      "description": "The status type",
      "enumValues": ["info", "warning", "error", "success"],
      "defaultValue": "info"
    },
    {
      "key": "label",
      "type": "textTemplate",
      "caption": "Label",
      "description": "Badge text",
      "required": true
    }
  ],
  "events": [
    {
      "key": "onClick",
      "caption": "On Click",
      "description": "Triggered when clicked"
    }
  ]
}
```

---

## 🎛️ Supported Property Types

| Type | Description | Config Options |
|------|-------------|----------------|
| `string` | Text input | `defaultValue` |
| `boolean` | True/false toggle | `defaultValue` |
| `integer` | Whole number | `defaultValue` |
| `decimal` | Decimal number | `defaultValue` |
| `enumeration` | Dropdown selection | `enumValues: ["a", "b"]`, `defaultValue` |
| `textTemplate` | Parameterized text | `required` |
| `expression` | Dynamic expression | `returnType: "String"` |
| `attribute` | Entity attribute binding | `attributeTypes: ["String"]` |
| `datasource` | List of objects | `isList: true` |
| `widgets` | Container for child widgets | `dataSource` |
| `icon` | Icon from library | |
| `image` | Static or dynamic image | |

---

## 🔧 Local Development

### Clone & Install

```bash
git clone https://github.com/jordnlvr/mendix-widget-generator.git
cd mendix-widget-generator
npm install
```

### Run Locally

```bash
# Run the CLI directly
node cli/index.js

# Or link it globally
npm link
create-mendix-widget
```

### Run Tests (Windows PowerShell)

```powershell
.\Test-Generator.ps1
```

---

## 📁 Project Structure

```
mendix-widget-generator/
├── cli/
│   ├── index.js        # CLI entry point
│   ├── wizard.js       # Interactive question wizard
│   ├── generator.js    # Core code generation logic
│   └── templates.js    # Built-in template definitions
├── web/
│   └── index.html      # Local web configurator
├── docs/
│   ├── index.html      # GitHub Pages landing page
│   └── configurator.html  # Online web configurator
├── widget-configs/     # Example config files
└── package.json        # npm package config
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

---

## 📄 License

MIT © [jordnlvr](https://github.com/jordnlvr)
