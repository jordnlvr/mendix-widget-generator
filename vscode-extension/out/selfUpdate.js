"use strict";
/**
 * Self-Update Module
 *
 * Checks for updates from GitHub and provides easy update mechanism.
 * Can be triggered via /update command or automatically on startup.
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
exports.VERSION = exports.SelfUpdate = void 0;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const GITHUB_REPO = 'jordnlvr/mendix-widget-generator';
const CURRENT_VERSION = '1.1.0'; // Increment this with each release
class SelfUpdate {
    /**
     * Check for updates from GitHub
     */
    async checkForUpdates() {
        try {
            const releaseInfo = await this.fetchLatestRelease();
            const latestVersion = releaseInfo.tag_name.replace(/^v/, '');
            const updateAvailable = this.isNewerVersion(latestVersion, CURRENT_VERSION);
            return {
                currentVersion: CURRENT_VERSION,
                latestVersion,
                updateAvailable,
                downloadUrl: releaseInfo.assets?.find((a) => a.name.endsWith('.vsix'))?.browser_download_url,
                releaseNotes: releaseInfo.body,
            };
        }
        catch (error) {
            console.error('Failed to check for updates:', error);
            return {
                currentVersion: CURRENT_VERSION,
                latestVersion: 'unknown',
                updateAvailable: false,
            };
        }
    }
    /**
     * Download and install the latest version
     */
    async update(progressCallback) {
        try {
            progressCallback?.('Checking for updates...\n');
            const updateInfo = await this.checkForUpdates();
            if (!updateInfo.updateAvailable) {
                progressCallback?.(`✅ You're already on the latest version (${updateInfo.currentVersion})\n`);
                return true;
            }
            progressCallback?.(`📦 New version available: ${updateInfo.latestVersion}\n`);
            progressCallback?.(`Downloading...\n`);
            // Option 1: If there's a VSIX in releases, download it
            if (updateInfo.downloadUrl) {
                const vsixPath = await this.downloadVsix(updateInfo.downloadUrl, progressCallback);
                if (vsixPath) {
                    progressCallback?.(`Installing...\n`);
                    await this.installVsix(vsixPath);
                    progressCallback?.(`✅ Updated to ${updateInfo.latestVersion}!\n`);
                    progressCallback?.(`\n⚠️ Please reload VS Code to use the new version.\n`);
                    // Offer to reload
                    const reload = await vscode.window.showInformationMessage(`Mendix Widget Agent updated to ${updateInfo.latestVersion}. Reload to apply?`, 'Reload Now', 'Later');
                    if (reload === 'Reload Now') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                    return true;
                }
            }
            // Option 2: Clone and build from source
            progressCallback?.(`\nNo pre-built VSIX found. Building from source...\n`);
            return await this.buildFromSource(progressCallback);
        }
        catch (error) {
            progressCallback?.(`\n❌ Update failed: ${error}\n`);
            return false;
        }
    }
    /**
     * Get the local VSIX path for manual reinstall
     */
    getLocalVsixPath() {
        // Check common locations
        const possiblePaths = [
            'D:\\Users\\kelly.seale\\VSCode-Dream-Workspace\\Mendix-SDK-Workspace\\pluggable-widget-templates\\vscode-extension\\mendix-widget-agent-1.0.0.vsix',
            path.join(__dirname, '..', '..', 'mendix-widget-agent-*.vsix'),
        ];
        for (const p of possiblePaths) {
            if (fs.existsSync(p.replace('*', CURRENT_VERSION))) {
                return p.replace('*', CURRENT_VERSION);
            }
        }
        return undefined;
    }
    /**
     * Show manual update instructions
     */
    getManualUpdateInstructions() {
        return `
## Manual Update Instructions

### Option 1: From GitHub (Recommended)

\`\`\`powershell
cd D:\\Users\\kelly.seale\\VSCode-Dream-Workspace\\Mendix-SDK-Workspace\\pluggable-widget-templates
git pull origin main
cd vscode-extension
npm install
npm run compile
vsce package
code --install-extension mendix-widget-agent-*.vsix
\`\`\`

### Option 2: Direct VSIX Install

If you have a VSIX file:
\`\`\`powershell
code --install-extension path\\to\\mendix-widget-agent-X.X.X.vsix
\`\`\`

Then reload VS Code: \`Ctrl+Shift+P\` → "Reload Window"
`;
    }
    async fetchLatestRelease() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${GITHUB_REPO}/releases/latest`,
                headers: {
                    'User-Agent': 'MendixWidgetAgent',
                    'Accept': 'application/vnd.github.v3+json',
                },
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        // No releases yet - return mock
                        resolve({ tag_name: 'v1.0.0', body: 'Initial release' });
                    }
                });
            }).on('error', reject);
        });
    }
    isNewerVersion(latest, current) {
        const latestParts = latest.split('.').map(Number);
        const currentParts = current.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if ((latestParts[i] || 0) > (currentParts[i] || 0))
                return true;
            if ((latestParts[i] || 0) < (currentParts[i] || 0))
                return false;
        }
        return false;
    }
    async downloadVsix(url, progressCallback) {
        // For now, return null to trigger build-from-source
        // In future, implement actual download
        progressCallback?.(`VSIX download not yet implemented. Using build-from-source.\n`);
        return null;
    }
    async installVsix(vsixPath) {
        const terminal = vscode.window.createTerminal('Mendix Widget Update');
        terminal.sendText(`code --install-extension "${vsixPath}"`);
        terminal.show();
    }
    async buildFromSource(progressCallback) {
        const repoPath = 'D:\\Users\\kelly.seale\\VSCode-Dream-Workspace\\Mendix-SDK-Workspace\\pluggable-widget-templates';
        progressCallback?.(`\n### Building from source...\n\n`);
        progressCallback?.(`Repository: ${repoPath}\n\n`);
        // Create terminal and run commands
        const terminal = vscode.window.createTerminal('Mendix Widget Update');
        terminal.show();
        const commands = [
            `cd "${repoPath}"`,
            'git pull origin main',
            'cd vscode-extension',
            'npm install',
            'npm run compile',
            'vsce package',
            'code --install-extension mendix-widget-agent-*.vsix',
        ];
        terminal.sendText(commands.join(' && '));
        progressCallback?.(`\nRunning update in terminal...\n`);
        progressCallback?.(`\n⚠️ After the terminal completes, reload VS Code.\n`);
        return true;
    }
}
exports.SelfUpdate = SelfUpdate;
// Export current version for status checks
exports.VERSION = CURRENT_VERSION;
//# sourceMappingURL=selfUpdate.js.map