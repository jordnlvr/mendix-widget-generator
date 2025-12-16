"use strict";
/**
 * Mendix Widget Chat Participant
 *
 * Handles all @mendix-widget chat interactions with AI-driven responses.
 * This is the brain of the operation - understanding natural language,
 * asking smart questions, and orchestrating widget creation.
 *
 * NOW WITH DYNAMIC PATTERNS: The nucleus that evolves as you build widgets!
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
exports.MendixWidgetChatParticipant = void 0;
const vscode = __importStar(require("vscode"));
const beastModeResearch_1 = require("./beastModeResearch");
const buildLoop_1 = require("./buildLoop");
const dynamicPatterns_1 = require("./dynamicPatterns");
const knowledgeSharing_1 = require("./knowledgeSharing");
const selfUpdate_1 = require("./selfUpdate");
class MendixWidgetChatParticipant {
    context;
    pathValidator;
    generatorBridge;
    beastMode;
    buildLoop;
    knowledgeSharing;
    selfUpdate;
    dynamicPatterns;
    // Store conversation state per chat session
    conversationStates = new Map();
    constructor(context, pathValidator, generatorBridge) {
        this.context = context;
        this.pathValidator = pathValidator;
        this.generatorBridge = generatorBridge;
        this.beastMode = new beastModeResearch_1.BeastModeResearch();
        this.dynamicPatterns = new dynamicPatterns_1.DynamicPatterns();
        this.buildLoop = new buildLoop_1.BuildLoop(generatorBridge, this.beastMode);
        this.knowledgeSharing = new knowledgeSharing_1.KnowledgeSharing();
        this.selfUpdate = new selfUpdate_1.SelfUpdate();
    }
    async handleRequest(request, context, stream, token) {
        const sessionId = this.getSessionId(context);
        let state = this.conversationStates.get(sessionId) || { stage: 'initial' };
        try {
            // Handle commands that DON'T need a model first
            if (request.command) {
                const noModelCommands = ['help', 'status', 'patterns', 'template'];
                if (noModelCommands.includes(request.command)) {
                    return await this.handleCommand(request, context, stream, token, state, sessionId);
                }
            }
            // For commands/operations that need a model, check availability
            if (!request.model) {
                stream.markdown(`⚠️ **Language model not available**\n\n`);
                stream.markdown(`This might happen if Copilot is still initializing. Try:\n`);
                stream.markdown(`1. Wait a few seconds and try again\n`);
                stream.markdown(`2. Make sure GitHub Copilot is signed in\n`);
                stream.markdown(`3. Try \`/help\` or \`/template\` which don't need AI\n`);
                return {};
            }
            // Handle specific commands
            if (request.command) {
                return await this.handleCommand(request, context, stream, token, state, sessionId);
            }
            // Handle natural language based on current state
            return await this.handleNaturalLanguage(request, context, stream, token, state, sessionId);
        }
        catch (error) {
            stream.markdown(`\\n\\n❌ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}\\n`);
            return { errorDetails: { message: String(error) } };
        }
    }
    async handleCommand(request, context, stream, token, state, sessionId) {
        switch (request.command) {
            case 'create':
                return await this.handleCreate(request, stream, token, state, sessionId);
            case 'template':
                return await this.handleTemplate(request, stream, token);
            case 'deploy':
                return await this.handleDeploy(request, stream, token);
            case 'fix':
                return await this.handleFix(request, stream, token, state, sessionId);
            case 'research':
                return await this.handleResearch(request, stream, token);
            case 'update':
                return await this.handleUpdate(request, stream, token);
            case 'status':
                return await this.handleStatus(stream, token);
            case 'patterns':
                return await this.handlePatterns(stream, token);
            case 'learn':
                return await this.handleLearn(request, stream, token);
            case 'help':
                return await this.showHelp(stream);
            default:
                stream.markdown(`Unknown command: ${request.command}`);
                return {};
        }
    }
    async handleCreate(request, stream, token, state, sessionId) {
        const userPrompt = request.prompt.trim();
        if (!userPrompt) {
            stream.markdown(`# 🎨 Create a Mendix Widget\n\n`);
            stream.markdown(`Tell me what you want to build! For example:\n\n`);
            stream.markdown(`- "A status badge that shows red/yellow/green based on an enum"\n`);
            stream.markdown(`- "A card component with an image, title, and click action"\n`);
            stream.markdown(`- "A progress bar with customizable colors"\n\n`);
            stream.markdown(`Just describe your widget in plain English and I'll handle the rest.\n`);
            return {};
        }
        // Start the widget creation flow
        state = {
            stage: 'gathering',
            widgetDescription: userPrompt,
            pendingQuestions: [],
        };
        stream.markdown(`# 🚀 Let's Build Your Widget!\n\n`);
        stream.markdown(`I understand you want: **${userPrompt}**\n\n`);
        // Use LLM to analyze the request and generate clarifying questions
        stream.markdown(`Let me analyze your requirements...\n\n`);
        const analysisPrompt = this.buildAnalysisPrompt(userPrompt);
        try {
            // Use the SAME model the user is chatting with - no selection needed!
            const model = request.model;
            const messages = [vscode.LanguageModelChatMessage.User(analysisPrompt)];
            const response = await model.sendRequest(messages, {}, token);
            let analysisResult = '';
            for await (const chunk of response.text) {
                analysisResult += chunk;
            }
            // Parse the analysis and ask smart questions
            const analysis = this.parseAnalysis(analysisResult);
            state.widgetConfig = analysis.suggestedConfig;
            state.pendingQuestions = analysis.clarifyingQuestions;
            stream.markdown(`## 📋 What I Understood\n\n`);
            stream.markdown(`- **Widget Name:** ${analysis.suggestedConfig.name || 'TBD'}\n`);
            stream.markdown(`- **Type:** ${analysis.suggestedConfig.category || 'Display'}\n`);
            stream.markdown(`- **Properties:** ${analysis.suggestedConfig.properties?.length || 0} identified\n`);
            stream.markdown(`- **Events:** ${analysis.suggestedConfig.events?.length || 0} identified\n\n`);
            // Check for work folder and Mendix project
            const config = vscode.workspace.getConfiguration('mendixWidget');
            const savedWorkFolder = config.get('defaultWorkFolder');
            const savedMendixProject = config.get('defaultMendixProject');
            stream.markdown(`## ❓ A Few Questions\n\n`);
            if (!savedWorkFolder) {
                stream.markdown(`1. **Where should I create this widget?** (folder path)\n`);
            }
            else {
                stream.markdown(`1. ✅ Work folder: \`${savedWorkFolder}\`\n`);
                state.workFolder = savedWorkFolder;
            }
            if (!savedMendixProject) {
                stream.markdown(`2. **Do you have a Mendix project to deploy to?** (optional - provide project folder path)\n`);
            }
            else {
                const validation = await this.pathValidator.validateMendixProject(savedMendixProject);
                if (validation.isValid) {
                    stream.markdown(`2. ✅ Mendix project: \`${validation.projectName}\` (${validation.mendixVersion})\n`);
                    state.mendixProject = savedMendixProject;
                    state.mendixProjectValidation = validation;
                }
                else {
                    stream.markdown(`2. ⚠️ Saved project invalid: ${validation.error}\n`);
                }
            }
            // Add AI-generated clarifying questions
            if (analysis.clarifyingQuestions.length > 0) {
                stream.markdown(`\n### Widget-Specific Questions:\n\n`);
                analysis.clarifyingQuestions.forEach((q, i) => {
                    stream.markdown(`${i + 3}. ${q}\n`);
                });
            }
            stream.markdown(`\n---\n`);
            stream.markdown(`\n**Reply with your answers**, or say "looks good" to proceed with defaults.\n`);
            this.conversationStates.set(sessionId, state);
        }
        catch (error) {
            stream.markdown(`\n⚠️ AI analysis unavailable: ${error}\n\n`);
            return await this.fallbackToTemplateSelection(stream);
        }
        return {};
    }
    async handleNaturalLanguage(request, context, stream, token, state, sessionId) {
        const userPrompt = request.prompt.trim().toLowerCase();
        // Check for confirmations
        if (state.stage === 'gathering' && this.isConfirmation(userPrompt)) {
            return await this.proceedWithBuild(request, stream, token, state, sessionId);
        }
        // Check for path-like inputs when we're gathering
        if (state.stage === 'gathering') {
            const paths = this.extractPaths(request.prompt);
            if (paths.length > 0) {
                return await this.handlePathInputs(paths, stream, state, sessionId);
            }
        }
        // Check if it looks like a widget description
        if (this.looksLikeWidgetRequest(request.prompt)) {
            return await this.handleCreate({ ...request, command: 'create' }, stream, token, state, sessionId);
        }
        // Default: show help
        return await this.showHelp(stream);
    }
    async handleTemplate(request, stream, token) {
        const templateId = request.prompt.trim();
        const templates = this.generatorBridge.getAvailableTemplates();
        if (!templateId) {
            stream.markdown(`# 📦 Available Templates\n\n`);
            templates.forEach((t) => {
                stream.markdown(`### ${t.displayName}\n`);
                stream.markdown(`\`/template ${t.id}\` - ${t.description}\n\n`);
            });
            return {};
        }
        const template = templates.find((t) => t.id === templateId);
        if (!template) {
            stream.markdown(`❌ Template "${templateId}" not found.\n\n`);
            stream.markdown(`Available: ${templates.map((t) => t.id).join(', ')}\n`);
            return {};
        }
        stream.markdown(`# 📦 Using Template: ${template.displayName}\n\n`);
        stream.markdown(`${template.description}\n\n`);
        stream.markdown(`**Properties:** ${template.properties.map((p) => p.key).join(', ')}\n`);
        stream.markdown(`**Events:** ${template.events.map((e) => e.key).join(', ') || 'None'}\n\n`);
        stream.markdown(`Reply with a **widget name** to create, or provide a **Mendix project path** to deploy to.\n`);
        return {};
    }
    async handleDeploy(request, stream, token) {
        const projectPath = request.prompt.trim();
        if (!projectPath) {
            stream.markdown(`# 🚀 Deploy Widget\n\n`);
            stream.markdown(`Provide the path to your Mendix project folder.\n\n`);
            stream.markdown(`Example: \`D:\\MendixProjects\\MyApp\`\n\n`);
            stream.markdown(`I'll:\n`);
            stream.markdown(`1. Verify the .mpr file exists\n`);
            stream.markdown(`2. Find the widgets folder\n`);
            stream.markdown(`3. Check for naming conflicts\n`);
            stream.markdown(`4. Copy the .mpk file\n`);
            return {};
        }
        stream.markdown(`# 🔍 Validating Mendix Project\n\n`);
        const validation = await this.pathValidator.validateMendixProject(projectPath);
        if (!validation.isValid) {
            stream.markdown(`❌ **Invalid project:** ${validation.error}\n\n`);
            if (validation.suggestion) {
                stream.markdown(`💡 **Suggestion:** ${validation.suggestion}\n`);
            }
            return {};
        }
        stream.markdown(`✅ **Project Found:** ${validation.projectName}\n`);
        stream.markdown(`📁 **Location:** \`${validation.projectPath}\`\n`);
        stream.markdown(`🔧 **Mendix Version:** ${validation.mendixVersion}\n`);
        stream.markdown(`📦 **Widgets Folder:** \`${validation.widgetsFolder}\`\n\n`);
        if (validation.existingWidgets && validation.existingWidgets.length > 0) {
            stream.markdown(`### Existing Widgets:\n`);
            validation.existingWidgets.forEach((w) => {
                stream.markdown(`- ${w}\n`);
            });
        }
        // Save for future use
        const config = vscode.workspace.getConfiguration('mendixWidget');
        await config.update('defaultMendixProject', projectPath, vscode.ConfigurationTarget.Global);
        stream.markdown(`\n✅ Project saved as default for future deployments.\n`);
        return {};
    }
    async handleFix(request, stream, token, state, sessionId) {
        stream.markdown(`# 🔧 Fix Widget Build Errors\n\n`);
        if (!state.buildErrors || state.buildErrors.length === 0) {
            stream.markdown(`No recent build errors found.\n\n`);
            stream.markdown(`To fix errors:\n`);
            stream.markdown(`1. Run \`npm run build\` in your widget folder\n`);
            stream.markdown(`2. Copy the error output\n`);
            stream.markdown(`3. Paste it here and I'll analyze it\n\n`);
            if (request.prompt.trim()) {
                // User provided error text
                stream.markdown(`---\n\n`);
                stream.markdown(`## Analyzing Provided Errors...\n\n`);
                const analysis = await this.beastMode.analyzeError(request.prompt, request.model);
                stream.markdown(analysis);
            }
            return {};
        }
        stream.markdown(`## Found ${state.buildErrors.length} error(s)\n\n`);
        for (const error of state.buildErrors) {
            stream.markdown(`\`\`\`\n${error}\n\`\`\`\n\n`);
        }
        stream.markdown(`## 🔍 Researching Solutions...\n\n`);
        const fixes = await this.buildLoop.researchFixes(state.buildErrors, request.model);
        stream.markdown(fixes);
        return {};
    }
    async handleResearch(request, stream, token) {
        const topic = request.prompt.trim();
        if (!topic) {
            stream.markdown(`# 🔬 Beast Mode Research\n\n`);
            stream.markdown(`Provide a topic to research exhaustively:\n\n`);
            stream.markdown(`- \`/research chart widgets\` - How to build chart widgets\n`);
            stream.markdown(`- \`/research drag and drop\` - Implementing drag & drop\n`);
            stream.markdown(`- \`/research data grid patterns\` - Data grid widget patterns\n\n`);
            stream.markdown(`I'll search through all 6 tiers:\n`);
            stream.markdown(`1. Official Mendix docs\n`);
            stream.markdown(`2. GitHub code (sdk-demo is 🏆)\n`);
            stream.markdown(`3. npm packages\n`);
            stream.markdown(`4. Community forums\n`);
            stream.markdown(`5. Web archives\n`);
            stream.markdown(`6. Video tutorials\n`);
            return {};
        }
        stream.markdown(`# 🔬 Beast Mode: "${topic}"\n\n`);
        stream.markdown(`*Initiating 6-tier exhaustive research...*\n\n`);
        const research = await this.beastMode.research(topic, request.model, (update) => {
            stream.markdown(update);
        });
        stream.markdown(`\n---\n\n`);
        stream.markdown(`## 📚 Research Complete\n\n`);
        stream.markdown(research.summary);
        if (research.codeExamples.length > 0) {
            stream.markdown(`\n### Code Examples\n\n`);
            research.codeExamples.forEach((example) => {
                stream.markdown(`\`\`\`${example.language}\n${example.code}\n\`\`\`\n`);
                stream.markdown(`*Source: ${example.source}*\n\n`);
            });
        }
        return {};
    }
    async proceedWithBuild(request, stream, token, state, sessionId) {
        if (!state.widgetConfig?.name) {
            stream.markdown(`❌ Widget configuration incomplete. Please provide more details.\n`);
            return {};
        }
        state.stage = 'building';
        this.conversationStates.set(sessionId, state);
        stream.markdown(`# 🏗️ Building Widget: ${state.widgetConfig.name}\n\n`);
        // Execute the build with the build loop (passing the chat model)
        const result = await this.buildLoop.execute(state.widgetConfig, {
            workFolder: state.workFolder,
            mendixProject: state.mendixProject,
            autoDeploy: !!state.mendixProject,
        }, request.model, (update) => stream.markdown(update), token);
        if (result.success) {
            stream.markdown(`\n---\n\n`);
            stream.markdown(`# ✅ Widget Ready!\n\n`);
            stream.markdown(`📁 **Location:** \`${result.outputPath}\`\n`);
            stream.markdown(`📦 **MPK File:** \`${result.mpkPath}\`\n`);
            if (result.deployedTo) {
                stream.markdown(`🚀 **Deployed To:** \`${result.deployedTo}\`\n\n`);
                stream.markdown(`Press **F4** in Studio Pro to refresh the toolbox.\n`);
            }
            // Clear state
            this.conversationStates.delete(sessionId);
        }
        else {
            state.stage = 'fixing';
            state.buildErrors = result.errors;
            state.attemptCount = (state.attemptCount || 0) + 1;
            this.conversationStates.set(sessionId, state);
            stream.markdown(`\n---\n\n`);
            stream.markdown(`# ⚠️ Build Failed (Attempt ${state.attemptCount}/3)\n\n`);
            if (state.attemptCount < 3) {
                stream.markdown(`I'm analyzing the errors and will attempt a fix...\n\n`);
                // Recursive fix attempt
                return await this.handleFix({ prompt: result.errors.join('\n') }, stream, token, state, sessionId);
            }
            else {
                stream.markdown(`Maximum fix attempts reached. Here's what I found:\n\n`);
                result.errors.forEach((e) => stream.markdown(`- ${e}\n`));
                stream.markdown(`\nPlease review manually or provide more context.\n`);
            }
        }
        return {};
    }
    async handlePathInputs(paths, stream, state, sessionId) {
        for (const inputPath of paths) {
            // Check if it's a Mendix project
            const validation = await this.pathValidator.validateMendixProject(inputPath);
            if (validation.isValid) {
                state.mendixProject = inputPath;
                state.mendixProjectValidation = validation;
                stream.markdown(`✅ **Mendix Project Found:** ${validation.projectName}\n`);
                stream.markdown(`   📁 Widgets will deploy to: \`${validation.widgetsFolder}\`\n\n`);
                // Check for conflicts if we have a widget name
                if (state.widgetConfig?.name) {
                    const conflict = await this.pathValidator.checkWidgetConflict(validation.widgetsFolder, state.widgetConfig.name);
                    if (conflict.exists) {
                        stream.markdown(`⚠️ **Conflict:** Widget "${state.widgetConfig.name}" already exists.\n`);
                        stream.markdown(`   Existing version: ${conflict.existingVersion}\n`);
                        stream.markdown(`   Reply "overwrite" to replace, or provide a different name.\n\n`);
                    }
                }
            }
            else {
                // Check if it's just a folder
                const isFolder = await this.pathValidator.isValidFolder(inputPath);
                if (isFolder) {
                    state.workFolder = inputPath;
                    stream.markdown(`✅ **Work Folder Set:** \`${inputPath}\`\n\n`);
                }
                else {
                    stream.markdown(`❌ Invalid path: \`${inputPath}\`\n`);
                    if (validation.suggestion) {
                        stream.markdown(`   💡 ${validation.suggestion}\n\n`);
                    }
                }
            }
        }
        // Check if we have everything we need
        if (state.workFolder && state.widgetConfig?.name) {
            stream.markdown(`---\n\n`);
            stream.markdown(`Ready to build! Say "go" or "build it" to proceed.\n`);
        }
        this.conversationStates.set(sessionId, state);
        return {};
    }
    async showHelp(stream) {
        stream.markdown(`# 🎨 Mendix Widget Agent v1.3.4\n\n`);
        stream.markdown(`I help you create Mendix Pluggable Widgets using natural language.\n\n`);
        stream.markdown(`## 📝 Commands\n\n`);
        stream.markdown(`| Command | Description |\n`);
        stream.markdown(`|---------|-------------|\n`);
        stream.markdown(`| \`/create\` | Create a widget from natural language description |\n`);
        stream.markdown(`| \`/template\` | Browse and use pre-built widget templates |\n`);
        stream.markdown(`| \`/deploy\` | Deploy a built widget to a Mendix project |\n`);
        stream.markdown(`| \`/fix\` | Analyze build errors and suggest fixes |\n`);
        stream.markdown(`| \`/research\` | Beast Mode 7-tier research on any widget topic |\n`);
        stream.markdown(`| \`/update\` | Check for extension updates |\n`);
        stream.markdown(`| \`/status\` | View current widget generation status |\n`);
        stream.markdown(`| \`/patterns\` | View the learned patterns nucleus |\n`);
        stream.markdown(`| \`/learn\` | Teach a new pattern to the nucleus |\n`);
        stream.markdown(`| \`/help\` | Show this help message |\n\n`);
        stream.markdown(`## 🚀 Quick Start\n\n`);
        stream.markdown(`Just describe what you want - no command needed:\n\n`);
        stream.markdown(`> "Create a rating widget with stars that saves to an integer attribute"\n\n`);
        stream.markdown(`I'll ask smart questions, generate the code, build it, and deploy it.\n\n`);
        stream.markdown(`## 🧠 Self-Learning\n\n`);
        stream.markdown(`This extension learns from successful builds! Use \`/patterns\` to see what I've learned.\n`);
        return {};
    }
    async fallbackToTemplateSelection(stream) {
        stream.markdown(`## Select a Template\n\n`);
        const templates = this.generatorBridge.getAvailableTemplates();
        templates.slice(0, 5).forEach((t) => {
            stream.markdown(`- **${t.displayName}** - \`/template ${t.id}\`\n`);
        });
        stream.markdown(`\nOr describe your widget in more detail.\n`);
        return {};
    }
    // Helper methods
    getSessionId(context) {
        // Use conversation history to generate consistent session ID
        return `session-${context.history.length}`;
    }
    buildAnalysisPrompt(userRequest) {
        return `Analyze this Mendix Pluggable Widget request and provide a structured response.

User Request: "${userRequest}"

Respond in this exact JSON format:
{
    "suggestedConfig": {
        "name": "WidgetNameInPascalCase",
        "displayName": "Human Readable Name",
        "description": "Brief description",
        "category": "Display|Input|Data|Container|Visualization",
        "properties": [
            {"key": "propName", "type": "string|integer|boolean|decimal|expression|object|action|attribute", "caption": "Display Name", "description": "What it does", "required": true|false}
        ],
        "events": [
            {"key": "onEventName", "caption": "Display Name", "description": "When it triggers"}
        ]
    },
    "clarifyingQuestions": [
        "Question about unclear aspects of the widget"
    ],
    "suggestedPatterns": ["Pattern or library recommendations"],
    "complexity": "simple|moderate|complex"
}

Be intelligent:
- Infer properties from the description
- Suggest appropriate types (use 'attribute' for data binding, 'action' for callbacks)
- Ask about unclear aspects (colors, sizes, data sources)
- Don't over-engineer simple widgets`;
    }
    parseAnalysis(result) {
        try {
            // Extract JSON from the response
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    suggestedConfig: parsed.suggestedConfig || {},
                    clarifyingQuestions: parsed.clarifyingQuestions || [],
                };
            }
        }
        catch (e) {
            console.error('Failed to parse analysis:', e);
        }
        return {
            suggestedConfig: {},
            clarifyingQuestions: ['Could you describe your widget in more detail?'],
        };
    }
    isConfirmation(input) {
        const confirmPhrases = [
            'yes',
            'yep',
            'yeah',
            'ok',
            'okay',
            'sure',
            'looks good',
            'go ahead',
            'proceed',
            'build it',
            'go',
            'do it',
            'create it',
            'make it',
            'confirm',
        ];
        return confirmPhrases.some((phrase) => input.includes(phrase));
    }
    extractPaths(input) {
        // Match Windows and Unix paths
        const pathRegex = /(?:[A-Za-z]:)?[\\/](?:[^\s\\/:*?"<>|]+[\\/])*[^\s\\/:*?"<>|]*/g;
        return (input.match(pathRegex) || []).filter((p) => p.length > 3);
    }
    looksLikeWidgetRequest(input) {
        const widgetKeywords = [
            'widget',
            'component',
            'create',
            'build',
            'make',
            'display',
            'show',
            'input',
            'button',
            'card',
            'status',
            'badge',
            'chart',
            'grid',
            'list',
        ];
        const lower = input.toLowerCase();
        return widgetKeywords.some((kw) => lower.includes(kw));
    }
    /**
     * Handle /update command - check for and install updates
     */
    async handleUpdate(request, stream, token) {
        stream.markdown(`# 🔄 Update Mendix Widget Agent\n\n`);
        const updateInfo = await this.selfUpdate.checkForUpdates();
        if (!updateInfo.updateAvailable) {
            stream.markdown(`✅ **You're on the latest version!**\n\n`);
            stream.markdown(`- Current Version: **${updateInfo.currentVersion}**\n`);
            stream.markdown(`- Latest Version: **${updateInfo.latestVersion}**\n\n`);
            return {};
        }
        stream.markdown(`📦 **Update Available!**\n\n`);
        stream.markdown(`- Current Version: ${updateInfo.currentVersion}\n`);
        stream.markdown(`- Latest Version: **${updateInfo.latestVersion}**\n\n`);
        if (updateInfo.releaseNotes) {
            stream.markdown(`### Release Notes\n${updateInfo.releaseNotes}\n\n`);
        }
        stream.markdown(`---\n\n`);
        stream.markdown(`### Installing Update...\n\n`);
        const success = await this.selfUpdate.update((msg) => stream.markdown(msg));
        if (!success) {
            stream.markdown(`\n### Manual Update Instructions\n`);
            stream.markdown(this.selfUpdate.getManualUpdateInstructions());
        }
        return {};
    }
    /**
     * Handle /status command - show version and knowledge base status
     */
    async handleStatus(stream, token) {
        stream.markdown(`# 📊 Mendix Widget Agent Status\n\n`);
        // Version info
        stream.markdown(`## Version\n`);
        stream.markdown(`- **Installed Version:** ${selfUpdate_1.VERSION}\n\n`);
        // Check for updates
        const updateInfo = await this.selfUpdate.checkForUpdates();
        if (updateInfo.updateAvailable) {
            stream.markdown(`⚠️ **Update Available:** ${updateInfo.latestVersion}\n`);
            stream.markdown(`   Use \`/update\` to install.\n\n`);
        }
        else {
            stream.markdown(`✅ Up to date\n\n`);
        }
        // Knowledge base status
        stream.markdown(`## Knowledge Sharing\n`);
        const kbStatus = this.knowledgeSharing.getStatus();
        if (kbStatus.enabled) {
            stream.markdown(`✅ **Connected to Knowledge Base**\n`);
            stream.markdown(`- Path: \`${kbStatus.path}\`\n`);
            stream.markdown(`- Entries: ${kbStatus.entriesCount}\n`);
            stream.markdown(`\nResearch findings and successful patterns are being saved!\n\n`);
        }
        else {
            stream.markdown(`⚠️ **Knowledge Base Not Found**\n`);
            stream.markdown(`Research findings won't be saved for future use.\n`);
            stream.markdown(`To enable, ensure mendix-mcp-server is in the expected location.\n\n`);
        }
        // Dynamic Patterns status (the nucleus!)
        stream.markdown(`## 🔮 The Nucleus (Dynamic Patterns)\n`);
        const patternStats = this.dynamicPatterns.getStats();
        stream.markdown(`| Category | Count |\n`);
        stream.markdown(`|----------|-------|\n`);
        stream.markdown(`| Error Fixes | ${patternStats.errorFixes} |\n`);
        stream.markdown(`| Widget Templates | ${patternStats.templates} |\n`);
        stream.markdown(`| SDK APIs | ${patternStats.sdkApis} |\n`);
        stream.markdown(`| Best Practices | ${patternStats.bestPractices} |\n`);
        stream.markdown(`| **Learned (from experience)** | **${patternStats.learnedPatterns}** |\n\n`);
        stream.markdown(`Use \`/patterns\` for details, \`/learn\` to add new patterns.\n\n`);
        // Available commands
        stream.markdown(`## Available Commands\n\n`);
        stream.markdown(`| Command | Description |\n`);
        stream.markdown(`|---------|-------------|\n`);
        stream.markdown(`| \`/create\` | Create widget from natural language |\n`);
        stream.markdown(`| \`/template\` | Use a pre-built template |\n`);
        stream.markdown(`| \`/deploy\` | Deploy to Mendix project |\n`);
        stream.markdown(`| \`/fix\` | Analyze and fix build errors |\n`);
        stream.markdown(`| \`/research\` | Beast Mode pattern research |\n`);
        stream.markdown(`| \`/patterns\` | View learned patterns (the nucleus) |\n`);
        stream.markdown(`| \`/learn\` | Teach new patterns manually |\n`);
        stream.markdown(`| \`/update\` | Check for and install updates |\n`);
        stream.markdown(`| \`/status\` | Show this status page |\n\n`);
        // Configuration
        const config = vscode.workspace.getConfiguration('mendixWidget');
        stream.markdown(`## Configuration\n`);
        stream.markdown(`- Default Mendix Project: \`${config.get('defaultMendixProject') || 'Not set'}\`\n`);
        stream.markdown(`- Default Work Folder: \`${config.get('defaultWorkFolder') || 'Not set'}\`\n`);
        stream.markdown(`- Beast Mode: ${config.get('beastModeEnabled', true) ? '✅ Enabled' : '❌ Disabled'}\n`);
        return {};
    }
    /**
     * Handle /patterns command - show the nucleus (learned patterns)
     */
    async handlePatterns(stream, token) {
        stream.markdown(`# 🔮 The Nucleus - Dynamic Patterns\n\n`);
        stream.markdown(`These are the patterns I've learned from building widgets. They get better over time!\n\n`);
        const stats = this.dynamicPatterns.getStats();
        // Summary
        stream.markdown(`## 📊 Summary\n\n`);
        stream.markdown(`| Category | Total | Learned |\n`);
        stream.markdown(`|----------|-------|--------|\n`);
        stream.markdown(`| Error Fixes | ${stats.errorFixes} | - |\n`);
        stream.markdown(`| Widget Templates | ${stats.templates} | - |\n`);
        stream.markdown(`| SDK API Patterns | ${stats.sdkApis} | - |\n`);
        stream.markdown(`| Best Practices | ${stats.bestPractices} | - |\n`);
        stream.markdown(`| **Total** | **${stats.totalPatterns}** | **${stats.learnedPatterns}** |\n\n`);
        // Error Fixes
        stream.markdown(`## 🔧 Error Fix Patterns\n\n`);
        const errorFixes = this.dynamicPatterns.getMatchingErrorFixes('');
        if (errorFixes.length > 0) {
            for (const fix of errorFixes.slice(0, 5)) {
                const confidence = (fix.confidence * 100).toFixed(0);
                const successRate = fix.successCount + fix.failureCount > 0
                    ? ((fix.successCount / (fix.successCount + fix.failureCount)) * 100).toFixed(0)
                    : 'N/A';
                stream.markdown(`### ${fix.fix.description}\n`);
                stream.markdown(`- **Pattern:** \`${fix.errorPattern.substring(0, 60)}...\`\n`);
                stream.markdown(`- **Confidence:** ${confidence}%\n`);
                stream.markdown(`- **Success Rate:** ${successRate}% (${fix.successCount} successes, ${fix.failureCount} failures)\n`);
                stream.markdown(`- **Source:** ${fix.source}\n\n`);
            }
            if (errorFixes.length > 5) {
                stream.markdown(`*... and ${errorFixes.length - 5} more*\n\n`);
            }
        }
        else {
            stream.markdown(`*No patterns yet. Build some widgets to start learning!*\n\n`);
        }
        // Best Practices
        stream.markdown(`## 💡 Best Practices\n\n`);
        const practices = this.dynamicPatterns.getBestPractices();
        for (const practice of practices.slice(0, 3)) {
            stream.markdown(`### ${practice.title}\n`);
            stream.markdown(`${practice.description}\n\n`);
            stream.markdown(`✅ **Do:** ${practice.doThis.slice(0, 2).join(', ')}\n\n`);
            stream.markdown(`❌ **Don't:** ${practice.dontDoThis.slice(0, 2).join(', ')}\n\n`);
        }
        // How it works
        stream.markdown(`---\n\n`);
        stream.markdown(`## 🧠 How Learning Works\n\n`);
        stream.markdown(`1. When you build a widget and it fails, I try these patterns FIRST\n`);
        stream.markdown(`2. If a pattern works, its confidence goes UP\n`);
        stream.markdown(`3. If a pattern fails, its confidence goes DOWN\n`);
        stream.markdown(`4. New successful fixes get added to the nucleus\n`);
        stream.markdown(`5. The more you use @mendix-widget, the smarter it gets!\n\n`);
        stream.markdown(`Use \`/learn\` to manually add patterns.\n`);
        return {};
    }
    /**
     * Handle /learn command - manually add knowledge to the nucleus
     */
    async handleLearn(request, stream, token) {
        const input = request.prompt.trim();
        if (!input) {
            stream.markdown(`# 🎓 Teach Me Something New\n\n`);
            stream.markdown(`You can add new patterns to my nucleus! Options:\n\n`);
            stream.markdown(`## Add an Error Fix\n`);
            stream.markdown(`\`\`\`\n@mendix-widget /learn error: "Cannot find name 'React'" -> Add React import\n\`\`\`\n\n`);
            stream.markdown(`## Add a Best Practice\n`);
            stream.markdown(`\`\`\`\n@mendix-widget /learn practice: Always use optional chaining for Mendix props\n\`\`\`\n\n`);
            stream.markdown(`## Add an SDK Pattern\n`);
            stream.markdown(`\`\`\`\n@mendix-widget /learn api: EditableValue - always check status before accessing value\n\`\`\`\n\n`);
            return {};
        }
        // Parse the input
        if (input.toLowerCase().startsWith('error:')) {
            const parts = input
                .substring(6)
                .split('->')
                .map((s) => s.trim());
            if (parts.length >= 2) {
                const errorPattern = parts[0].replace(/^["']|["']$/g, '');
                const fixDescription = parts[1];
                this.dynamicPatterns.learnErrorFix(errorPattern, fixDescription, { type: 'manual', description: fixDescription }, true);
                stream.markdown(`✅ **Learned Error Fix!**\n\n`);
                stream.markdown(`- **Pattern:** ${errorPattern}\n`);
                stream.markdown(`- **Fix:** ${fixDescription}\n\n`);
                stream.markdown(`This will be tried first next time I see this error.\n`);
            }
            else {
                stream.markdown(`❌ Couldn't parse. Use format: \`error: "pattern" -> fix description\`\n`);
            }
        }
        else if (input.toLowerCase().startsWith('practice:')) {
            const practice = input.substring(9).trim();
            this.dynamicPatterns.learnBestPractice('general', practice.substring(0, 50), practice, [practice], []);
            stream.markdown(`✅ **Learned Best Practice!**\n\n`);
            stream.markdown(`- ${practice}\n\n`);
        }
        else if (input.toLowerCase().startsWith('api:')) {
            const parts = input
                .substring(4)
                .split('-')
                .map((s) => s.trim());
            if (parts.length >= 2) {
                const apiName = parts[0];
                const usage = parts.slice(1).join(' - ');
                this.dynamicPatterns.learnSdkApi(apiName, usage);
                stream.markdown(`✅ **Learned SDK API Pattern!**\n\n`);
                stream.markdown(`- **API:** ${apiName}\n`);
                stream.markdown(`- **Usage:** ${usage}\n\n`);
            }
            else {
                stream.markdown(`❌ Couldn't parse. Use format: \`api: ApiName - usage description\`\n`);
            }
        }
        else {
            stream.markdown(`❓ Start with \`error:\`, \`practice:\`, or \`api:\`\n`);
            stream.markdown(`Run \`/learn\` without arguments for examples.\n`);
        }
        return {};
    }
}
exports.MendixWidgetChatParticipant = MendixWidgetChatParticipant;
//# sourceMappingURL=chatParticipant.js.map