"use strict";
/**
 * Knowledge Sharing Module
 *
 * When Beast Mode research finds valuable patterns, examples, or solutions,
 * this module saves them to the mendix-mcp-server knowledge base so they
 * can be shared and used in future sessions.
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
exports.KnowledgeSharing = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KnowledgeSharing {
    knowledgeBasePath;
    constructor() {
        // Try to find the mendix-mcp-server knowledge base
        this.findKnowledgeBase();
    }
    findKnowledgeBase() {
        // Common locations to search
        const possiblePaths = [
            // Dream Workspace location
            'D:\\Users\\kelly.seale\\VSCode-Dream-Workspace\\MCP-Tools\\mendix-mcp-server\\knowledge',
            // Relative to workspace
            path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'mendix-mcp-server', 'knowledge'),
            // User home
            path.join(process.env.USERPROFILE || '', 'mendix-mcp-server', 'knowledge'),
        ];
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                this.knowledgeBasePath = p;
                console.log(`Knowledge base found at: ${p}`);
                return;
            }
        }
        console.log('Knowledge base not found. Research findings will not be persisted.');
    }
    /**
     * Save research findings to the knowledge base
     */
    async saveResearchFindings(topic, result) {
        if (!this.knowledgeBasePath) {
            return false;
        }
        try {
            const entry = {
                title: `Widget Pattern: ${topic}`,
                category: 'widget-patterns',
                content: this.formatForKnowledge(result),
                source: 'beast-mode-research',
                timestamp: new Date().toISOString(),
                confidence: result.confidence,
                tags: this.extractTags(topic, result),
            };
            // Save to knowledge base
            const filename = `widget-pattern-${this.slugify(topic)}.json`;
            const filepath = path.join(this.knowledgeBasePath, filename);
            fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
            console.log(`Research findings saved to: ${filepath}`);
            return true;
        }
        catch (error) {
            console.error('Failed to save research findings:', error);
            return false;
        }
    }
    /**
     * Save a successful widget build pattern
     */
    async saveSuccessfulPattern(config, buildOutput) {
        if (!this.knowledgeBasePath) {
            return false;
        }
        try {
            const entry = {
                title: `Successful Widget: ${config.name}`,
                category: 'successful-builds',
                content: JSON.stringify({
                    config,
                    buildNotes: 'Widget built and deployed successfully',
                    buildOutput: buildOutput.substring(0, 500), // First 500 chars
                }, null, 2),
                source: 'widget-generator',
                timestamp: new Date().toISOString(),
                confidence: 'high',
                tags: ['successful', config.category || 'general', ...this.extractPropertyTypes(config)],
            };
            const filename = `successful-build-${this.slugify(config.name)}-${Date.now()}.json`;
            const filepath = path.join(this.knowledgeBasePath, filename);
            fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
            return true;
        }
        catch (error) {
            console.error('Failed to save successful pattern:', error);
            return false;
        }
    }
    /**
     * Save a fix that worked (for future auto-fixes)
     */
    async saveWorkingFix(errorPattern, fix, result) {
        if (!this.knowledgeBasePath) {
            return false;
        }
        if (result !== 'success') {
            return false; // Only save fixes that worked
        }
        try {
            const entry = {
                title: `Fix: ${errorPattern.substring(0, 50)}`,
                category: 'error-fixes',
                content: JSON.stringify({
                    errorPattern,
                    fix,
                    result,
                }, null, 2),
                source: 'auto-fix',
                timestamp: new Date().toISOString(),
                confidence: 'high',
                tags: ['fix', 'error-handling'],
            };
            const filename = `fix-${this.slugify(errorPattern.substring(0, 30))}-${Date.now()}.json`;
            const filepath = path.join(this.knowledgeBasePath, filename);
            fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
            return true;
        }
        catch (error) {
            console.error('Failed to save fix:', error);
            return false;
        }
    }
    /**
     * Get status of knowledge sharing
     */
    getStatus() {
        if (!this.knowledgeBasePath) {
            return { enabled: false };
        }
        try {
            const files = fs.readdirSync(this.knowledgeBasePath);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            return {
                enabled: true,
                path: this.knowledgeBasePath,
                entriesCount: jsonFiles.length,
            };
        }
        catch {
            return { enabled: false };
        }
    }
    formatForKnowledge(result) {
        let content = `## Summary\n${result.summary}\n\n`;
        if (result.codeExamples.length > 0) {
            content += `## Code Examples\n\n`;
            for (const example of result.codeExamples) {
                content += `### ${example.description || 'Example'}\n`;
                content += `Source: ${example.source}\n`;
                content += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
            }
        }
        if (result.sources.length > 0) {
            content += `## Sources\n`;
            for (const source of result.sources) {
                content += `- ${source}\n`;
            }
        }
        return content;
    }
    extractTags(topic, result) {
        const tags = [];
        // Extract from topic
        const topicWords = topic.toLowerCase().split(/\s+/);
        const keywords = ['chart', 'table', 'input', 'button', 'card', 'modal', 'form',
            'list', 'grid', 'tree', 'dropdown', 'date', 'file', 'image'];
        for (const word of topicWords) {
            if (keywords.includes(word)) {
                tags.push(word);
            }
        }
        // Add confidence level
        tags.push(`confidence-${result.confidence}`);
        return tags;
    }
    extractPropertyTypes(config) {
        const types = new Set();
        if (config.properties) {
            for (const prop of config.properties) {
                types.add(`prop-${prop.type}`);
            }
        }
        return Array.from(types);
    }
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
    }
}
exports.KnowledgeSharing = KnowledgeSharing;
//# sourceMappingURL=knowledgeSharing.js.map