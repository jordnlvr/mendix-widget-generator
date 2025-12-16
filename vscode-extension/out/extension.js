"use strict";
/**
 * Mendix Widget Agent - VS Code Extension
 *
 * AI-powered Mendix Pluggable Widget generator with natural language interface.
 * Uses @mendix-widget chat participant for conversational widget creation.
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const chatParticipant_1 = require("./chatParticipant");
const generatorBridge_1 = require("./generatorBridge");
const mendixPathValidator_1 = require("./mendixPathValidator");
let chatParticipant;
function activate(context) {
    console.log('Mendix Widget Agent is now active!');
    // Initialize components
    const pathValidator = new mendixPathValidator_1.MendixPathValidator();
    const generatorBridge = new generatorBridge_1.WidgetGeneratorBridge(context);
    // Create the chat participant
    chatParticipant = new chatParticipant_1.MendixWidgetChatParticipant(context, pathValidator, generatorBridge);
    // Register the chat participant
    const participant = vscode.chat.createChatParticipant('mendix-widget.agent', chatParticipant.handleRequest.bind(chatParticipant));
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'icon.png');
    // Register commands
    context.subscriptions.push(participant, vscode.commands.registerCommand('mendix-widget.setMendixProject', async () => {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: 'Select Mendix Project Folder',
            openLabel: 'Select Project',
        });
        if (result && result[0]) {
            const projectPath = result[0].fsPath;
            const validation = await pathValidator.validateMendixProject(projectPath);
            if (validation.isValid) {
                const config = vscode.workspace.getConfiguration('mendixWidget');
                await config.update('defaultMendixProject', projectPath, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Mendix project set: ${validation.projectName} (${validation.mendixVersion})`);
            }
            else {
                vscode.window.showErrorMessage(validation.error || 'Invalid Mendix project');
            }
        }
    }), vscode.commands.registerCommand('mendix-widget.setWorkFolder', async () => {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: 'Select Widget Work Folder',
            openLabel: 'Select Folder',
        });
        if (result && result[0]) {
            const config = vscode.workspace.getConfiguration('mendixWidget');
            await config.update('defaultWorkFolder', result[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Work folder set: ${result[0].fsPath}`);
        }
    }), vscode.commands.registerCommand('mendix-widget.showTemplates', async () => {
        const templates = generatorBridge.getAvailableTemplates();
        const items = templates.map((t) => ({
            label: t.displayName,
            description: t.description,
            detail: `Properties: ${t.properties.length}, Events: ${t.events.length}`,
            template: t,
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a template to use',
            title: 'Available Widget Templates',
        });
        if (selected) {
            vscode.window.showInformationMessage(`Template "${selected.label}" selected. Use @mendix-widget /template ${selected.template.id} to create.`);
        }
    }));
    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('mendixWidget.hasShownWelcome');
    if (!hasShownWelcome) {
        vscode.window
            .showInformationMessage('Mendix Widget Agent activated! Type @mendix-widget in chat to get started.', 'Open Chat')
            .then((selection) => {
            if (selection === 'Open Chat') {
                vscode.commands.executeCommand('workbench.action.chat.open');
            }
        });
        context.globalState.update('mendixWidget.hasShownWelcome', true);
    }
}
function deactivate() {
    console.log('Mendix Widget Agent deactivated');
}
//# sourceMappingURL=extension.js.map