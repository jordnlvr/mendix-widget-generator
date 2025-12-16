/**
 * Mendix Widget Agent - VS Code Extension
 *
 * AI-powered Mendix Pluggable Widget generator with natural language interface.
 * Uses @mendix-widget chat participant for conversational widget creation.
 */

import * as vscode from 'vscode';
import { MendixWidgetChatParticipant } from './chatParticipant';
import { WidgetGeneratorBridge } from './generatorBridge';
import { MendixPathValidator } from './mendixPathValidator';

let chatParticipant: MendixWidgetChatParticipant;

export function activate(context: vscode.ExtensionContext) {
  console.log('Mendix Widget Agent is now active!');

  // Initialize components
  const pathValidator = new MendixPathValidator();
  const generatorBridge = new WidgetGeneratorBridge(context);

  // Create the chat participant
  chatParticipant = new MendixWidgetChatParticipant(context, pathValidator, generatorBridge);

  // Register the chat participant
  const participant = vscode.chat.createChatParticipant(
    'mendix-widget.agent',
    chatParticipant.handleRequest.bind(chatParticipant)
  );

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'icon.png');

  // Register commands
  context.subscriptions.push(
    participant,

    vscode.commands.registerCommand('mendix-widget.setMendixProject', async () => {
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
          await config.update(
            'defaultMendixProject',
            projectPath,
            vscode.ConfigurationTarget.Global
          );
          vscode.window.showInformationMessage(
            `Mendix project set: ${validation.projectName} (${validation.mendixVersion})`
          );
        } else {
          vscode.window.showErrorMessage(validation.error || 'Invalid Mendix project');
        }
      }
    }),

    vscode.commands.registerCommand('mendix-widget.setWorkFolder', async () => {
      const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select Widget Work Folder',
        openLabel: 'Select Folder',
      });

      if (result && result[0]) {
        const config = vscode.workspace.getConfiguration('mendixWidget');
        await config.update(
          'defaultWorkFolder',
          result[0].fsPath,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(`Work folder set: ${result[0].fsPath}`);
      }
    }),

    vscode.commands.registerCommand('mendix-widget.showTemplates', async () => {
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
        vscode.window.showInformationMessage(
          `Template "${selected.label}" selected. Use @mendix-widget /template ${selected.template.id} to create.`
        );
      }
    })
  );

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('mendixWidget.hasShownWelcome');
  if (!hasShownWelcome) {
    vscode.window
      .showInformationMessage(
        'Mendix Widget Agent activated! Type @mendix-widget in chat to get started.',
        'Open Chat'
      )
      .then((selection) => {
        if (selection === 'Open Chat') {
          vscode.commands.executeCommand('workbench.action.chat.open');
        }
      });
    context.globalState.update('mendixWidget.hasShownWelcome', true);
  }
}

export function deactivate() {
  console.log('Mendix Widget Agent deactivated');
}
