"use strict";
/**
 * Widget Generator Bridge
 *
 * Connects the VS Code extension to the CLI generator engine.
 * This is the execution layer - the AI brain decides, this executes.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetGeneratorBridge = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class WidgetGeneratorBridge {
    context;
    generatorPath;
    constructor(context) {
        this.context = context;
        // The generator is in the parent directory
        this.generatorPath = path.join(context.extensionPath, '..', 'cli');
    }
    /**
     * Get list of available templates
     */
    getAvailableTemplates() {
        return [
            {
                id: 'status-badge',
                displayName: 'Status Badge',
                description: 'Displays a colored badge based on status value',
                properties: [
                    {
                        key: 'status',
                        type: 'attribute',
                        caption: 'Status',
                        description: 'The status value to display',
                        required: true,
                    },
                    {
                        key: 'size',
                        type: 'enumeration',
                        caption: 'Size',
                        defaultValue: 'medium',
                        enumValues: [
                            { key: 'small', caption: 'Small' },
                            { key: 'medium', caption: 'Medium' },
                            { key: 'large', caption: 'Large' },
                        ],
                    },
                ],
                events: [],
            },
            {
                id: 'data-card',
                displayName: 'Data Card',
                description: 'A card component with title, content, and optional image',
                properties: [
                    { key: 'title', type: 'expression', caption: 'Title', required: true },
                    { key: 'content', type: 'expression', caption: 'Content' },
                    { key: 'imageUrl', type: 'expression', caption: 'Image URL' },
                    { key: 'showShadow', type: 'boolean', caption: 'Show Shadow', defaultValue: 'true' },
                ],
                events: [
                    { key: 'onClick', caption: 'On Click', description: 'Triggered when card is clicked' },
                ],
            },
            {
                id: 'progress-bar',
                displayName: 'Progress Bar',
                description: 'Animated progress bar with customizable colors',
                properties: [
                    {
                        key: 'value',
                        type: 'attribute',
                        caption: 'Value',
                        description: 'Current progress (0-100)',
                        required: true,
                    },
                    { key: 'maxValue', type: 'integer', caption: 'Max Value', defaultValue: '100' },
                    { key: 'color', type: 'string', caption: 'Color', defaultValue: '#264AE5' },
                    { key: 'showLabel', type: 'boolean', caption: 'Show Label', defaultValue: 'true' },
                ],
                events: [],
            },
            {
                id: 'rating',
                displayName: 'Rating',
                description: 'Star rating input component',
                properties: [
                    {
                        key: 'value',
                        type: 'attribute',
                        caption: 'Value',
                        description: 'Current rating value',
                        required: true,
                    },
                    { key: 'maxStars', type: 'integer', caption: 'Max Stars', defaultValue: '5' },
                    { key: 'readOnly', type: 'boolean', caption: 'Read Only', defaultValue: 'false' },
                    {
                        key: 'size',
                        type: 'enumeration',
                        caption: 'Size',
                        enumValues: [
                            { key: 'small', caption: 'Small' },
                            { key: 'medium', caption: 'Medium' },
                            { key: 'large', caption: 'Large' },
                        ],
                    },
                ],
                events: [
                    { key: 'onChange', caption: 'On Change', description: 'Triggered when rating changes' },
                ],
            },
            {
                id: 'icon-button',
                displayName: 'Icon Button',
                description: 'A button with icon and optional label',
                properties: [
                    {
                        key: 'icon',
                        type: 'string',
                        caption: 'Icon Class',
                        description: 'Glyphicon or custom icon class',
                        required: true,
                    },
                    { key: 'label', type: 'expression', caption: 'Label' },
                    {
                        key: 'variant',
                        type: 'enumeration',
                        caption: 'Variant',
                        enumValues: [
                            { key: 'primary', caption: 'Primary' },
                            { key: 'secondary', caption: 'Secondary' },
                            { key: 'danger', caption: 'Danger' },
                            { key: 'success', caption: 'Success' },
                        ],
                    },
                    { key: 'disabled', type: 'boolean', caption: 'Disabled', defaultValue: 'false' },
                ],
                events: [
                    { key: 'onClick', caption: 'On Click', description: 'Triggered when button is clicked' },
                ],
            },
            {
                id: 'countdown',
                displayName: 'Countdown Timer',
                description: 'Displays countdown to a target date/time',
                properties: [
                    { key: 'targetDate', type: 'attribute', caption: 'Target Date', required: true },
                    {
                        key: 'format',
                        type: 'enumeration',
                        caption: 'Format',
                        enumValues: [
                            { key: 'full', caption: 'Days Hours Minutes Seconds' },
                            { key: 'compact', caption: 'Compact' },
                            { key: 'minimal', caption: 'Minimal' },
                        ],
                    },
                    { key: 'showLabels', type: 'boolean', caption: 'Show Labels', defaultValue: 'true' },
                ],
                events: [
                    {
                        key: 'onComplete',
                        caption: 'On Complete',
                        description: 'Triggered when countdown reaches zero',
                    },
                ],
            },
            {
                id: 'text-input',
                displayName: 'Text Input',
                description: 'Enhanced text input with validation',
                properties: [
                    { key: 'value', type: 'attribute', caption: 'Value', required: true },
                    { key: 'placeholder', type: 'expression', caption: 'Placeholder' },
                    { key: 'pattern', type: 'string', caption: 'Validation Pattern' },
                    { key: 'maxLength', type: 'integer', caption: 'Max Length' },
                    { key: 'showClear', type: 'boolean', caption: 'Show Clear Button', defaultValue: 'true' },
                ],
                events: [
                    { key: 'onChange', caption: 'On Change' },
                    { key: 'onBlur', caption: 'On Blur' },
                ],
            },
            {
                id: 'modal-trigger',
                displayName: 'Modal Trigger',
                description: 'Button that opens a modal/popup',
                properties: [
                    { key: 'buttonText', type: 'expression', caption: 'Button Text', required: true },
                    { key: 'modalTitle', type: 'expression', caption: 'Modal Title' },
                    {
                        key: 'modalSize',
                        type: 'enumeration',
                        caption: 'Modal Size',
                        enumValues: [
                            { key: 'small', caption: 'Small' },
                            { key: 'medium', caption: 'Medium' },
                            { key: 'large', caption: 'Large' },
                            { key: 'fullscreen', caption: 'Full Screen' },
                        ],
                    },
                ],
                events: [
                    { key: 'onOpen', caption: 'On Open' },
                    { key: 'onClose', caption: 'On Close' },
                ],
            },
            {
                id: 'file-upload',
                displayName: 'File Upload',
                description: 'Drag-and-drop file upload component',
                properties: [
                    {
                        key: 'accept',
                        type: 'string',
                        caption: 'Accepted Types',
                        description: 'e.g., .pdf,.docx,image/*',
                    },
                    { key: 'maxSize', type: 'integer', caption: 'Max Size (MB)', defaultValue: '10' },
                    { key: 'multiple', type: 'boolean', caption: 'Allow Multiple', defaultValue: 'false' },
                ],
                events: [
                    { key: 'onUpload', caption: 'On Upload', description: 'Triggered when file is selected' },
                    { key: 'onError', caption: 'On Error', description: 'Triggered on validation error' },
                ],
            },
            {
                id: 'tabs',
                displayName: 'Tabs',
                description: 'Tab navigation component',
                properties: [
                    { key: 'defaultTab', type: 'integer', caption: 'Default Tab Index', defaultValue: '0' },
                    {
                        key: 'orientation',
                        type: 'enumeration',
                        caption: 'Orientation',
                        enumValues: [
                            { key: 'horizontal', caption: 'Horizontal' },
                            { key: 'vertical', caption: 'Vertical' },
                        ],
                    },
                    { key: 'showIcons', type: 'boolean', caption: 'Show Icons', defaultValue: 'false' },
                ],
                events: [{ key: 'onTabChange', caption: 'On Tab Change' }],
            },
        ];
    }
    /**
     * Generate a widget from configuration
     */
    async generate(config, options) {
        const errors = [];
        const warnings = [];
        try {
            const outputPath = path.join(options.workFolder, config.name.toLowerCase());
            // Create the widget config file
            const configPath = path.join(options.workFolder, `${config.name}-config.json`);
            fs.writeFileSync(configPath, JSON.stringify({
                widget: {
                    name: config.name,
                    displayName: config.displayName || config.name,
                    description: config.description || `A custom ${config.name} widget`,
                    category: config.category || 'Display',
                    company: config.company || 'mycompany',
                },
                properties: config.properties,
                events: config.events,
                mendixProjectPath: config.mendixProjectPath,
            }, null, 2));
            // Check if we can use the Node.js generator
            const nodeGeneratorPath = path.join(this.generatorPath, 'index.js');
            const psGeneratorPath = path.join(path.dirname(this.generatorPath), 'Generate-WidgetFromConfig.ps1');
            if (fs.existsSync(nodeGeneratorPath)) {
                // Use Node.js CLI
                return await this.runNodeGenerator(configPath, outputPath, options, config);
            }
            else if (fs.existsSync(psGeneratorPath)) {
                // Fall back to PowerShell
                return await this.runPowerShellGenerator(configPath, outputPath, options, config);
            }
            else {
                // Inline generation
                return await this.runInlineGeneration(config, outputPath, options);
            }
        }
        catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings,
            };
        }
    }
    /**
     * Run the Node.js CLI generator
     */
    async runNodeGenerator(configPath, outputPath, options, config) {
        return new Promise((resolve) => {
            const args = [
                path.join(this.generatorPath, 'index.js'),
                '--config',
                configPath,
                '--output',
                options.workFolder,
            ];
            if (options.install === false) {
                args.push('--no-install');
            }
            if (options.build === false) {
                args.push('--no-build');
            }
            if (config.mendixProjectPath) {
                args.push('--mendix', config.mendixProjectPath);
            }
            const child = (0, child_process_1.spawn)('node', args, {
                cwd: path.dirname(this.generatorPath),
                shell: true,
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    // Find the .mpk file
                    const mpkPath = this.findMpk(outputPath);
                    resolve({
                        success: true,
                        outputPath,
                        mpkPath,
                        deployedTo: config.mendixProjectPath
                            ? path.join(config.mendixProjectPath, 'widgets')
                            : undefined,
                        errors: [],
                        warnings: stderr ? [stderr] : [],
                    });
                }
                else {
                    resolve({
                        success: false,
                        outputPath,
                        errors: [stderr || stdout || `Process exited with code ${code}`],
                        warnings: [],
                    });
                }
            });
        });
    }
    /**
     * Run the PowerShell generator
     */
    async runPowerShellGenerator(configPath, outputPath, options, config) {
        return new Promise((resolve) => {
            const psPath = path.join(path.dirname(this.generatorPath), 'Generate-WidgetFromConfig.ps1');
            const args = [
                '-ExecutionPolicy',
                'Bypass',
                '-File',
                psPath,
                '-ConfigPath',
                configPath,
                '-OutputPath',
                options.workFolder,
            ];
            if (options.install === false) {
                args.push('-NoInstall');
            }
            if (options.build === false) {
                args.push('-NoBuild');
            }
            const child = (0, child_process_1.spawn)('powershell', args, { shell: true });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    const mpkPath = this.findMpk(outputPath);
                    resolve({
                        success: true,
                        outputPath,
                        mpkPath,
                        errors: [],
                        warnings: [],
                    });
                }
                else {
                    resolve({
                        success: false,
                        errors: [stderr || stdout],
                        warnings: [],
                    });
                }
            });
        });
    }
    /**
     * Inline widget generation (fallback)
     */
    async runInlineGeneration(config, outputPath, options) {
        try {
            // Create directory structure
            fs.mkdirSync(outputPath, { recursive: true });
            fs.mkdirSync(path.join(outputPath, 'src'), { recursive: true });
            // Generate widget files inline
            this.generateWidgetXml(outputPath, config);
            this.generatePackageJson(outputPath, config);
            this.generateTsConfig(outputPath);
            this.generateComponent(outputPath, config);
            this.generatePreview(outputPath, config);
            this.generateStyles(outputPath, config);
            // Install and build
            if (options.install !== false) {
                (0, child_process_1.execSync)('npm install', { cwd: outputPath, stdio: 'pipe' });
            }
            if (options.build !== false) {
                (0, child_process_1.execSync)('npm run build', { cwd: outputPath, stdio: 'pipe' });
            }
            const mpkPath = this.findMpk(outputPath);
            // Deploy if Mendix path provided
            let deployedTo;
            if (config.mendixProjectPath && mpkPath) {
                const widgetsFolder = path.join(config.mendixProjectPath, 'widgets');
                fs.mkdirSync(widgetsFolder, { recursive: true });
                fs.copyFileSync(mpkPath, path.join(widgetsFolder, path.basename(mpkPath)));
                deployedTo = widgetsFolder;
            }
            return {
                success: true,
                outputPath,
                mpkPath,
                deployedTo,
                errors: [],
                warnings: [],
            };
        }
        catch (error) {
            return {
                success: false,
                outputPath,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings: [],
            };
        }
    }
    /**
     * Find the generated .mpk file
     */
    findMpk(widgetPath) {
        const distPath = path.join(widgetPath, 'dist');
        if (!fs.existsSync(distPath))
            return undefined;
        const files = fs.readdirSync(distPath);
        const mpk = files.find((f) => f.endsWith('.mpk'));
        return mpk ? path.join(distPath, mpk) : undefined;
    }
    // File generation methods
    generateWidgetXml(dir, config) {
        const propsXml = config.properties
            .map((p) => {
            const required = p.required ? ' required="true"' : '';
            const defaultVal = p.defaultValue ? ` defaultValue="${p.defaultValue}"` : '';
            if (p.type === 'enumeration' && p.enumValues) {
                const enums = p.enumValues
                    .map((e) => `                <enumerationValue key="${e.key}">${e.caption}</enumerationValue>`)
                    .join('\n');
                return `            <property key="${p.key}" type="enumeration"${defaultVal}>
                <caption>${p.caption}</caption>
                <description>${p.description || ''}</description>
                <enumerationValues>
${enums}
                </enumerationValues>
            </property>`;
            }
            return `            <property key="${p.key}" type="${p.type}"${required}${defaultVal}>
                <caption>${p.caption}</caption>
                <description>${p.description || ''}</description>
            </property>`;
        })
            .join('\n');
        const eventsXml = config.events
            .map((e) => `            <property key="${e.key}" type="action">
                <caption>${e.caption}</caption>
                <description>${e.description || ''}</description>
            </property>`)
            .join('\n');
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<widget id="${config.company || 'mycompany'}.${config.name.toLowerCase()}.${config.name}" 
        pluginWidget="true" needsEntityContext="false"
        supportedPlatform="Web" offlineCapable="true"
        xmlns="http://www.mendix.com/widget/1.0/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../node_modules/mendix/custom_widget.xsd">
    <name>${config.displayName || config.name}</name>
    <description>${config.description || ''}</description>
    <icon/>
    <properties>
        <propertyGroup caption="General">
${propsXml}
        </propertyGroup>
        <propertyGroup caption="Events">
${eventsXml}
        </propertyGroup>
        <propertyGroup caption="Common">
            <systemProperty key="Name" />
            <systemProperty key="Visibility" />
        </propertyGroup>
    </properties>
</widget>`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.xml`), xml);
    }
    generatePackageJson(dir, config) {
        const pkg = {
            name: config.name.toLowerCase(),
            version: '1.0.0',
            description: config.description || '',
            scripts: {
                build: 'pluggable-widgets-tools build:web',
                dev: 'pluggable-widgets-tools start:web',
                lint: 'eslint src/**/*.{ts,tsx}',
            },
            dependencies: {
                classnames: '^2.3.2',
            },
            devDependencies: {
                '@mendix/pluggable-widgets-tools': '^10.0.0',
                '@types/react': '^18.2.0',
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                typescript: '^5.0.0',
            },
        };
        fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
    }
    generateTsConfig(dir) {
        const tsconfig = {
            compilerOptions: {
                target: 'ES2020',
                module: 'ESNext',
                lib: ['ES2020', 'DOM'],
                jsx: 'react',
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                moduleResolution: 'node',
                outDir: './dist',
            },
            include: ['src/**/*'],
        };
        fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    }
    generateComponent(dir, config) {
        const propsInterface = config.properties
            .map((p) => {
            const tsType = this.getTsType(p.type);
            const optional = p.required ? '' : '?';
            return `    ${p.key}${optional}: ${tsType};`;
        })
            .join('\n');
        const eventsInterface = config.events.map((e) => `    ${e.key}?: () => void;`).join('\n');
        const component = `import { ReactElement, createElement } from 'react';
import classNames from 'classnames';
import './ui/${config.name}.css';

export interface ${config.name}Props {
${propsInterface}
${eventsInterface}
    className?: string;
    style?: React.CSSProperties;
}

export function ${config.name}(props: ${config.name}Props): ReactElement {
    const { className, style } = props;
    
    return (
        <div 
            className={classNames('widget-${config.name.toLowerCase()}', className)}
            style={style}
        >
            {/* Widget content goes here */}
            <span>${config.displayName || config.name}</span>
        </div>
    );
}
`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.tsx`), component);
    }
    generatePreview(dir, config) {
        const preview = `import { ReactElement, createElement } from 'react';
import { ${config.name}Props } from './${config.name}';

export function preview(props: ${config.name}Props): ReactElement {
    return (
        <div className="widget-${config.name.toLowerCase()}-preview">
            ${config.displayName || config.name} Preview
        </div>
    );
}
`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.editorPreview.tsx`), preview);
    }
    generateStyles(dir, config) {
        fs.mkdirSync(path.join(dir, 'src', 'ui'), { recursive: true });
        const css = `.widget-${config.name.toLowerCase()} {
    /* Widget styles */
}
`;
        fs.writeFileSync(path.join(dir, 'src', 'ui', `${config.name}.css`), css);
    }
    getTsType(propType) {
        switch (propType) {
            case 'string':
                return 'string';
            case 'integer':
            case 'decimal':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'expression':
                return 'string';
            case 'attribute':
                return 'EditableValue<any>';
            case 'action':
                return 'ActionValue';
            case 'enumeration':
                return 'string';
            default:
                return 'any';
        }
    }
}
exports.WidgetGeneratorBridge = WidgetGeneratorBridge;
//# sourceMappingURL=generatorBridge.js.map