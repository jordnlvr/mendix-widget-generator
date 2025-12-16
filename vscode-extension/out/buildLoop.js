"use strict";
/**
 * Build Loop
 *
 * Implements the Research → Build → Test → Fix loop.
 * When a build fails, this doesn't give up - it researches the error,
 * applies fixes, and tries again.
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
exports.BuildLoop = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
class BuildLoop {
    generator;
    research;
    constructor(generator, research) {
        this.generator = generator;
        this.research = research;
    }
    /**
     * Execute the full build loop with automatic error fixing
     */
    async execute(config, options, progressCallback, token) {
        const maxAttempts = options.maxAttempts || 3;
        let attempt = 0;
        const fixesApplied = [];
        while (attempt < maxAttempts) {
            attempt++;
            if (token.isCancellationRequested) {
                return {
                    success: false,
                    errors: ['Operation cancelled'],
                    warnings: [],
                    attempts: attempt,
                    fixesApplied,
                };
            }
            progressCallback(`\n### Build Attempt ${attempt}/${maxAttempts}\n\n`);
            // Ensure work folder exists
            const workFolder = options.workFolder || this.getDefaultWorkFolder();
            if (!fs.existsSync(workFolder)) {
                fs.mkdirSync(workFolder, { recursive: true });
            }
            // Add Mendix project path to config if provided
            const fullConfig = {
                ...config,
                mendixProjectPath: options.autoDeploy ? options.mendixProject : undefined,
            };
            progressCallback(`📁 Work folder: \`${workFolder}\`\n`);
            progressCallback(`📦 Generating ${config.name}...\n\n`);
            // Run the generator
            const result = await this.generator.generate(fullConfig, {
                workFolder,
                install: true,
                build: true,
            });
            if (result.success) {
                progressCallback(`✅ **Build successful!**\n\n`);
                if (result.mpkPath) {
                    progressCallback(`📦 MPK: \`${result.mpkPath}\`\n`);
                }
                if (result.deployedTo) {
                    progressCallback(`🚀 Deployed to: \`${result.deployedTo}\`\n`);
                }
                return {
                    ...result,
                    attempts: attempt,
                    fixesApplied,
                };
            }
            // Build failed - analyze and fix
            progressCallback(`\n⚠️ **Build failed**\n\n`);
            progressCallback(`\`\`\`\n${result.errors.join('\n')}\n\`\`\`\n\n`);
            if (attempt < maxAttempts) {
                progressCallback(`🔧 **Analyzing errors and applying fixes...**\n\n`);
                // Research the fix
                const fix = await this.analyzeAndFix(result.errors, config, result.outputPath || path.join(workFolder, config.name.toLowerCase()), progressCallback);
                if (fix.applied) {
                    fixesApplied.push(fix.description);
                    progressCallback(`\n✅ Fix applied: ${fix.description}\n`);
                    progressCallback(`\n🔄 Retrying build...\n`);
                }
                else {
                    progressCallback(`\n❌ Could not determine automatic fix.\n`);
                    break;
                }
            }
        }
        // All attempts failed
        return {
            success: false,
            errors: [`Build failed after ${attempt} attempts`],
            warnings: [],
            attempts: attempt,
            fixesApplied,
        };
    }
    /**
     * Research fixes for given errors
     */
    async researchFixes(errors) {
        const errorText = errors.join('\n');
        return await this.research.analyzeError(errorText);
    }
    /**
     * Analyze errors and apply automatic fixes
     */
    async analyzeAndFix(errors, config, widgetPath, progressCallback) {
        const errorText = errors.join('\n');
        // Pattern-based fixes (fast, no AI required)
        const patternFix = await this.tryPatternFix(errorText, widgetPath);
        if (patternFix.applied) {
            return patternFix;
        }
        // AI-powered fix research
        try {
            const [model] = await vscode.lm.selectChatModels({ family: 'gpt-4' });
            if (!model) {
                return { applied: false, description: 'No AI model available for analysis' };
            }
            const prompt = this.buildFixPrompt(errorText, config, widgetPath);
            const messages = [vscode.LanguageModelChatMessage.User(prompt)];
            const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
            let result = '';
            for await (const chunk of response.text) {
                result += chunk;
            }
            // Parse and apply the fix
            return await this.applyAIFix(result, widgetPath, progressCallback);
        }
        catch (error) {
            return { applied: false, description: `AI analysis failed: ${error}` };
        }
    }
    /**
     * Try pattern-based fixes for common errors
     */
    async tryPatternFix(errorText, widgetPath) {
        const errorLower = errorText.toLowerCase();
        // Missing dependencies
        if (errorLower.includes('cannot find module') || errorLower.includes('module not found')) {
            const match = errorText.match(/Cannot find module ['"]([^'"]+)['"]/);
            if (match) {
                const moduleName = match[1];
                if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
                    try {
                        const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
                        execSync(`npm install ${moduleName}`, { cwd: widgetPath, stdio: 'pipe' });
                        return { applied: true, description: `Installed missing module: ${moduleName}` };
                    }
                    catch {
                        // Installation failed
                    }
                }
            }
        }
        // Missing React import
        if (errorLower.includes("'react' must be in scope") ||
            errorLower.includes("cannot find name 'react'")) {
            // Add React import to TSX files
            const srcPath = path.join(widgetPath, 'src');
            if (fs.existsSync(srcPath)) {
                const files = fs.readdirSync(srcPath).filter((f) => f.endsWith('.tsx'));
                for (const file of files) {
                    const filePath = path.join(srcPath, file);
                    let content = fs.readFileSync(filePath, 'utf8');
                    if (!content.includes('import React') && !content.includes('import * as React')) {
                        content = `import * as React from 'react';\n${content}`;
                        fs.writeFileSync(filePath, content);
                    }
                }
                return { applied: true, description: 'Added missing React imports' };
            }
        }
        // TypeScript strict mode issues with null
        if (errorLower.includes("object is possibly 'null'") ||
            errorLower.includes("object is possibly 'undefined'")) {
            // This would need more context-specific fixes
            return { applied: false, description: 'Null safety issue requires manual review' };
        }
        // Missing package.json scripts
        if (errorLower.includes('missing script: build')) {
            const pkgPath = path.join(widgetPath, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                pkg.scripts = pkg.scripts || {};
                pkg.scripts.build = 'pluggable-widgets-tools build:web';
                pkg.scripts.dev = 'pluggable-widgets-tools start:web';
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
                return { applied: true, description: 'Added missing build scripts to package.json' };
            }
        }
        return { applied: false, description: '' };
    }
    /**
     * Build prompt for AI-powered fix
     */
    buildFixPrompt(errorText, config, widgetPath) {
        // Read current file contents for context
        let fileContext = '';
        const srcPath = path.join(widgetPath, 'src');
        if (fs.existsSync(srcPath)) {
            const files = fs.readdirSync(srcPath);
            for (const file of files) {
                if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.xml')) {
                    const content = fs.readFileSync(path.join(srcPath, file), 'utf8');
                    fileContext += `\n### ${file}\n\`\`\`\n${content.substring(0, 2000)}\n\`\`\`\n`;
                }
            }
        }
        return `You are a Mendix Pluggable Widget expert. A widget build has failed.

## Error Output
\`\`\`
${errorText}
\`\`\`

## Widget Config
\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`

## Current Files
${fileContext}

## Your Task

Analyze the error and provide a fix. Respond in this JSON format:
{
    "analysis": "What caused the error",
    "fixes": [
        {
            "file": "src/WidgetName.tsx",
            "action": "replace",
            "search": "text to find",
            "replace": "text to replace with"
        }
    ],
    "description": "Brief description of fix"
}

Be specific. Provide exact text to search for and replace.`;
    }
    /**
     * Apply AI-suggested fix
     */
    async applyAIFix(aiResponse, widgetPath, progressCallback) {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return { applied: false, description: 'Could not parse AI response' };
            }
            const fix = JSON.parse(jsonMatch[0]);
            if (!fix.fixes || fix.fixes.length === 0) {
                return { applied: false, description: fix.analysis || 'No fixes suggested' };
            }
            progressCallback(`\n**AI Analysis:** ${fix.analysis}\n\n`);
            let applied = 0;
            for (const f of fix.fixes) {
                const filePath = path.join(widgetPath, f.file);
                if (!fs.existsSync(filePath)) {
                    progressCallback(`⚠️ File not found: ${f.file}\n`);
                    continue;
                }
                let content = fs.readFileSync(filePath, 'utf8');
                if (f.action === 'replace' && f.search && f.replace !== undefined) {
                    if (content.includes(f.search)) {
                        content = content.replace(f.search, f.replace);
                        fs.writeFileSync(filePath, content);
                        progressCallback(`✅ Fixed ${f.file}\n`);
                        applied++;
                    }
                    else {
                        progressCallback(`⚠️ Search pattern not found in ${f.file}\n`);
                    }
                }
                else if (f.action === 'prepend' && f.content) {
                    content = f.content + '\n' + content;
                    fs.writeFileSync(filePath, content);
                    progressCallback(`✅ Added content to ${f.file}\n`);
                    applied++;
                }
                else if (f.action === 'append' && f.content) {
                    content = content + '\n' + f.content;
                    fs.writeFileSync(filePath, content);
                    progressCallback(`✅ Appended content to ${f.file}\n`);
                    applied++;
                }
            }
            return {
                applied: applied > 0,
                description: fix.description || `Applied ${applied} fix(es)`,
            };
        }
        catch (error) {
            return { applied: false, description: `Failed to apply fix: ${error}` };
        }
    }
    /**
     * Get default work folder
     */
    getDefaultWorkFolder() {
        // Use the workspace folder or temp directory
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return path.join(workspaceFolders[0].uri.fsPath, 'widgets');
        }
        // Fallback to temp directory
        const os = require('os');
        return path.join(os.tmpdir(), 'mendix-widgets');
    }
}
exports.BuildLoop = BuildLoop;
//# sourceMappingURL=buildLoop.js.map