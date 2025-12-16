"use strict";
/**
 * Dynamic Patterns System
 *
 * This is the NUCLEUS of the learning system. Instead of hardcoded patterns
 * in TypeScript that require recompilation, patterns live in JSON files that
 * get updated as we learn.
 *
 * When you build widgets and discover new things:
 * 1. New patterns get added here (not just to knowledge base)
 * 2. On next run, these ARE the core patterns
 * 3. The tool literally evolves based on experience
 *
 * Pattern Categories:
 * - error-fixes: Error patterns and their solutions
 * - widget-templates: Successful widget patterns by type
 * - sdk-apis: Mendix SDK API patterns that work
 * - best-practices: Proven approaches
 * - build-configs: Build configurations that work
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
exports.DynamicPatterns = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
class DynamicPatterns {
    patternsPath;
    patterns;
    isDirty = false;
    constructor() {
        // Store patterns in the mendix-mcp-server knowledge folder for persistence
        this.patternsPath = this.findPatternsPath();
        this.patterns = this.loadPatterns();
    }
    findPatternsPath() {
        // Try to find mendix-mcp-server in common locations
        const possiblePaths = [
            path.join(process.env.USERPROFILE || '', 'VSCode-Dream-Workspace', 'mendix-mcp-server', 'knowledge', 'dynamic-patterns.json'),
            path.join('d:', 'Users', 'kelly.seale', 'VSCode-Dream-Workspace', 'mendix-mcp-server', 'knowledge', 'dynamic-patterns.json'),
        ];
        for (const p of possiblePaths) {
            const dir = path.dirname(p);
            if (fs.existsSync(dir)) {
                return p;
            }
        }
        // Fallback to extension's own folder
        const extensionPath = vscode.extensions.getExtension('jordnlvr.mendix-widget-agent')?.extensionPath;
        if (extensionPath) {
            return path.join(extensionPath, 'dynamic-patterns.json');
        }
        // Last resort: user's home directory
        return path.join(process.env.USERPROFILE || '.', '.mendix-widget-patterns.json');
    }
    loadPatterns() {
        if (fs.existsSync(this.patternsPath)) {
            try {
                const content = fs.readFileSync(this.patternsPath, 'utf8');
                const data = JSON.parse(content);
                console.log(`[DynamicPatterns] Loaded ${data.errorFixes.length} error fixes, ${data.widgetTemplates.length} templates`);
                return data;
            }
            catch (error) {
                console.error('[DynamicPatterns] Failed to load patterns:', error);
            }
        }
        // Return default patterns (the nucleus - these get expanded over time)
        return this.getDefaultPatterns();
    }
    getDefaultPatterns() {
        return {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            errorFixes: [
                {
                    id: 'missing-react-import',
                    errorPattern: "Cannot find name 'React'",
                    errorKeywords: ['React', 'cannot find', 'name'],
                    fix: {
                        type: 'file-edit',
                        file: 'src/*.tsx',
                        search: '',
                        replace: "import * as React from 'react';\n",
                        description: 'Add missing React import',
                    },
                    confidence: 0.95,
                    successCount: 10,
                    failureCount: 0,
                    lastUsed: new Date().toISOString(),
                    source: 'builtin',
                },
                {
                    id: 'classname-type-error',
                    errorPattern: "Type 'string | undefined' is not assignable",
                    errorKeywords: ['className', 'undefined', 'not assignable'],
                    fix: {
                        type: 'file-edit',
                        description: 'Add nullish coalescing for className',
                        search: 'className={props.class}',
                        replace: 'className={props.class ?? ""}',
                    },
                    confidence: 0.9,
                    successCount: 5,
                    failureCount: 1,
                    lastUsed: new Date().toISOString(),
                    source: 'builtin',
                },
                {
                    id: 'missing-build-script',
                    errorPattern: 'missing script: build',
                    errorKeywords: ['missing', 'script', 'build'],
                    fix: {
                        type: 'config-change',
                        file: 'package.json',
                        description: 'Add missing build scripts to package.json',
                    },
                    confidence: 0.95,
                    successCount: 8,
                    failureCount: 0,
                    lastUsed: new Date().toISOString(),
                    source: 'builtin',
                },
                {
                    id: 'strict-null-checks',
                    errorPattern: 'Object is possibly',
                    errorKeywords: ['possibly', 'undefined', 'null'],
                    fix: {
                        type: 'manual',
                        description: 'Add null safety checks - use optional chaining (?.) or nullish coalescing (??)',
                    },
                    confidence: 0.7,
                    successCount: 3,
                    failureCount: 2,
                    lastUsed: new Date().toISOString(),
                    source: 'builtin',
                },
            ],
            widgetTemplates: [
                {
                    id: 'data-display-basic',
                    widgetType: 'data-display',
                    keywords: ['display', 'show', 'view', 'text', 'label', 'value'],
                    template: {
                        structure: `export function {{WidgetName}}({ value, class: className }: {{WidgetName}}ContainerProps) {
  return (
    <div className={className ?? ""}>
      {value?.displayValue ?? "No value"}
    </div>
  );
}`,
                        imports: ["import { createElement } from 'react';"],
                        props: [
                            { name: 'value', type: 'EditableValue<string>', description: 'The value to display' },
                        ],
                        mendixDataHandling: 'Use value.displayValue for read-only, value.value for raw value',
                    },
                    examples: ['show a text value', 'display customer name', 'view the price'],
                    successCount: 5,
                    lastUsed: new Date().toISOString(),
                },
                {
                    id: 'form-input-basic',
                    widgetType: 'form-input',
                    keywords: ['input', 'edit', 'enter', 'type', 'form', 'field', 'textbox'],
                    template: {
                        structure: `export function {{WidgetName}}({ value, class: className }: {{WidgetName}}ContainerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value?.status === ValueStatus.Available) {
      value.setValue(e.target.value);
    }
  };
  
  return (
    <input
      className={className ?? ""}
      value={value?.value ?? ""}
      onChange={handleChange}
      disabled={value?.readOnly}
    />
  );
}`,
                        imports: [
                            "import { createElement } from 'react';",
                            "import { ValueStatus } from 'mendix';",
                        ],
                        props: [
                            { name: 'value', type: 'EditableValue<string>', description: 'The editable value' },
                        ],
                        mendixDataHandling: 'Check ValueStatus.Available before setValue, respect readOnly property',
                    },
                    examples: ['create an input field', 'editable text box', 'form field for name'],
                    successCount: 3,
                    lastUsed: new Date().toISOString(),
                },
            ],
            sdkApis: [
                {
                    id: 'editable-value',
                    apiName: 'EditableValue<T>',
                    correctUsage: `// Always check status before accessing value
if (props.value?.status === ValueStatus.Available) {
  const rawValue = props.value.value;
  props.value.setValue(newValue);
}
// For display, use displayValue
const display = props.value?.displayValue ?? "Loading...";`,
                    commonMistakes: [
                        'Accessing .value without checking status',
                        'Not handling Loading state',
                        'Ignoring readOnly property',
                    ],
                    mendixVersion: '9.0.0',
                    examples: ['EditableValue<string>', 'EditableValue<Big>', 'EditableValue<Date>'],
                    source: 'docs',
                },
                {
                    id: 'list-value',
                    apiName: 'ListValue',
                    correctUsage: `// ListValue for data sources
if (props.dataSource?.status === ValueStatus.Available) {
  const items = props.dataSource.items ?? [];
  items.forEach(item => {
    // Access attributes via item
    const name = props.nameAttr?.get(item)?.displayValue;
  });
}`,
                    commonMistakes: [
                        'Assuming items is always available',
                        'Not using .get(item) for ListAttributeValue',
                        'Forgetting null checks',
                    ],
                    mendixVersion: '9.0.0',
                    examples: ['data grid', 'list view', 'repeater'],
                    source: 'docs',
                },
            ],
            bestPractices: [
                {
                    id: 'null-safety',
                    category: 'typescript',
                    title: 'Always Use Null Safety',
                    description: 'Mendix widget props can be undefined during loading states',
                    doThis: [
                        'Use optional chaining (?.)',
                        'Use nullish coalescing (??)',
                        'Check ValueStatus',
                    ],
                    dontDoThis: [
                        'Assume props are always defined',
                        'Use non-null assertion (!) without checks',
                    ],
                    codeExample: `// Good
const value = props.attr?.value ?? defaultValue;

// Bad
const value = props.attr!.value;`,
                    source: 'docs',
                },
            ],
        };
    }
    /**
     * Save patterns to disk
     */
    save() {
        if (!this.isDirty) {
            return;
        }
        try {
            this.patterns.lastUpdated = new Date().toISOString();
            const dir = path.dirname(this.patternsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.patternsPath, JSON.stringify(this.patterns, null, 2));
            this.isDirty = false;
            console.log(`[DynamicPatterns] Saved to ${this.patternsPath}`);
        }
        catch (error) {
            console.error('[DynamicPatterns] Failed to save:', error);
        }
    }
    /**
     * Get error fix patterns matching an error
     */
    getMatchingErrorFixes(errorText) {
        const errorLower = errorText.toLowerCase();
        const matches = [];
        for (const pattern of this.patterns.errorFixes) {
            let score = 0;
            // Check regex/string pattern match
            if (errorText.includes(pattern.errorPattern)) {
                score += 10;
            }
            // Check keyword matches
            for (const keyword of pattern.errorKeywords) {
                if (errorLower.includes(keyword.toLowerCase())) {
                    score += 2;
                }
            }
            // Boost by confidence and success rate
            if (score > 0) {
                score *= pattern.confidence;
                score *= 1 + pattern.successCount / 10;
                matches.push({ pattern, score });
            }
        }
        // Sort by score descending
        matches.sort((a, b) => b.score - a.score);
        return matches.map((m) => m.pattern);
    }
    /**
     * Get widget template patterns matching a description
     */
    getMatchingTemplates(description) {
        const descLower = description.toLowerCase();
        const matches = [];
        for (const pattern of this.patterns.widgetTemplates) {
            let score = 0;
            // Check keyword matches
            for (const keyword of pattern.keywords) {
                if (descLower.includes(keyword.toLowerCase())) {
                    score += 3;
                }
            }
            // Check example matches
            for (const example of pattern.examples) {
                if (descLower.includes(example.toLowerCase()) ||
                    example.toLowerCase().includes(descLower)) {
                    score += 5;
                }
            }
            if (score > 0) {
                score *= 1 + pattern.successCount / 5;
                matches.push({ pattern, score });
            }
        }
        matches.sort((a, b) => b.score - a.score);
        return matches.map((m) => m.pattern);
    }
    /**
     * Get SDK API patterns
     */
    getSdkApiPatterns() {
        return this.patterns.sdkApis;
    }
    /**
     * Get best practices by category
     */
    getBestPractices(category) {
        if (category) {
            return this.patterns.bestPractices.filter((p) => p.category === category);
        }
        return this.patterns.bestPractices;
    }
    // =========================================================================
    // LEARNING METHODS - These update the nucleus!
    // =========================================================================
    /**
     * Learn a new error fix pattern
     * This UPDATES THE NUCLEUS - next time this error is seen, this fix is tried first!
     */
    learnErrorFix(errorText, fixDescription, fixDetails, success) {
        // Extract keywords from error
        const keywords = this.extractKeywords(errorText);
        // Check if we already have a similar pattern
        const existing = this.patterns.errorFixes.find((p) => p.errorPattern === errorText || this.similarity(p.errorKeywords, keywords) > 0.7);
        if (existing) {
            // Update existing pattern
            if (success) {
                existing.successCount++;
                existing.confidence = Math.min(1, existing.confidence + 0.05);
            }
            else {
                existing.failureCount++;
                existing.confidence = Math.max(0.1, existing.confidence - 0.1);
            }
            existing.lastUsed = new Date().toISOString();
        }
        else if (success) {
            // Add new pattern (only if it worked!)
            const newPattern = {
                id: `learned-${Date.now()}`,
                errorPattern: errorText.substring(0, 200),
                errorKeywords: keywords,
                fix: {
                    type: fixDetails.type || 'manual',
                    file: fixDetails.file,
                    search: fixDetails.search,
                    replace: fixDetails.replace,
                    description: fixDescription,
                    commands: fixDetails.commands,
                },
                confidence: 0.7, // Start moderate, builds with success
                successCount: 1,
                failureCount: 0,
                lastUsed: new Date().toISOString(),
                source: 'learned',
            };
            this.patterns.errorFixes.push(newPattern);
            console.log(`[DynamicPatterns] 🧠 LEARNED new error fix: ${fixDescription}`);
        }
        this.isDirty = true;
        this.save();
    }
    /**
     * Learn a successful widget template pattern
     */
    learnWidgetTemplate(widgetType, description, templateCode, props) {
        const keywords = this.extractKeywords(description);
        // Check for similar existing template
        const existing = this.patterns.widgetTemplates.find((p) => p.widgetType === widgetType || this.similarity(p.keywords, keywords) > 0.6);
        if (existing) {
            existing.successCount++;
            existing.examples.push(description);
            existing.lastUsed = new Date().toISOString();
        }
        else {
            const newTemplate = {
                id: `learned-${widgetType}-${Date.now()}`,
                widgetType,
                keywords,
                template: {
                    structure: templateCode,
                    imports: [],
                    props,
                    mendixDataHandling: 'Learned from successful build',
                },
                examples: [description],
                successCount: 1,
                lastUsed: new Date().toISOString(),
            };
            this.patterns.widgetTemplates.push(newTemplate);
            console.log(`[DynamicPatterns] 🧠 LEARNED new widget template: ${widgetType}`);
        }
        this.isDirty = true;
        this.save();
    }
    /**
     * Learn a new SDK API pattern
     */
    learnSdkApi(apiName, correctUsage, mistake) {
        const existing = this.patterns.sdkApis.find((p) => p.apiName === apiName);
        if (existing) {
            if (mistake && !existing.commonMistakes.includes(mistake)) {
                existing.commonMistakes.push(mistake);
            }
            // Update usage if this one is better (longer/more detailed)
            if (correctUsage.length > existing.correctUsage.length) {
                existing.correctUsage = correctUsage;
            }
        }
        else {
            const newApi = {
                id: `learned-api-${Date.now()}`,
                apiName,
                correctUsage,
                commonMistakes: mistake ? [mistake] : [],
                mendixVersion: '9.0.0',
                examples: [],
                source: 'learned',
            };
            this.patterns.sdkApis.push(newApi);
            console.log(`[DynamicPatterns] 🧠 LEARNED new SDK API pattern: ${apiName}`);
        }
        this.isDirty = true;
        this.save();
    }
    /**
     * Learn a best practice
     */
    learnBestPractice(category, title, description, doThis, dontDoThis) {
        const existing = this.patterns.bestPractices.find((p) => p.title.toLowerCase() === title.toLowerCase());
        if (!existing) {
            const newPractice = {
                id: `learned-bp-${Date.now()}`,
                category,
                title,
                description,
                doThis,
                dontDoThis,
                source: 'learned',
            };
            this.patterns.bestPractices.push(newPractice);
            console.log(`[DynamicPatterns] 🧠 LEARNED new best practice: ${title}`);
            this.isDirty = true;
            this.save();
        }
    }
    /**
     * Record that a fix was used (updates confidence)
     */
    recordFixUsage(patternId, success) {
        const pattern = this.patterns.errorFixes.find((p) => p.id === patternId);
        if (pattern) {
            if (success) {
                pattern.successCount++;
                pattern.confidence = Math.min(1, pattern.confidence + 0.05);
            }
            else {
                pattern.failureCount++;
                pattern.confidence = Math.max(0.1, pattern.confidence - 0.1);
            }
            pattern.lastUsed = new Date().toISOString();
            this.isDirty = true;
            this.save();
        }
    }
    /**
     * Get statistics about learned patterns
     */
    getStats() {
        const learned = this.patterns.errorFixes.filter((p) => p.source === 'learned').length +
            this.patterns.sdkApis.filter((p) => p.source === 'learned').length +
            this.patterns.bestPractices.filter((p) => p.source === 'learned').length;
        return {
            totalPatterns: this.patterns.errorFixes.length +
                this.patterns.widgetTemplates.length +
                this.patterns.sdkApis.length +
                this.patterns.bestPractices.length,
            learnedPatterns: learned,
            errorFixes: this.patterns.errorFixes.length,
            templates: this.patterns.widgetTemplates.length,
            sdkApis: this.patterns.sdkApis.length,
            bestPractices: this.patterns.bestPractices.length,
        };
    }
    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    extractKeywords(text) {
        // Extract meaningful keywords from text
        const stopWords = new Set([
            'the',
            'a',
            'an',
            'is',
            'are',
            'was',
            'were',
            'be',
            'been',
            'being',
            'have',
            'has',
            'had',
            'do',
            'does',
            'did',
            'will',
            'would',
            'could',
            'should',
            'may',
            'might',
            'must',
            'shall',
            'can',
            'need',
            'to',
            'of',
            'in',
            'for',
            'on',
            'with',
            'at',
            'by',
            'from',
            'as',
            'into',
            'through',
            'during',
            'before',
            'after',
            'above',
            'below',
            'between',
            'under',
            'again',
            'further',
            'then',
            'once',
            'and',
            'but',
            'or',
            'nor',
            'so',
            'yet',
            'both',
            'either',
            'neither',
            'not',
            'only',
            'own',
            'same',
            'than',
            'too',
            'very',
            'just',
        ]);
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 2 && !stopWords.has(word))
            .slice(0, 10);
    }
    similarity(arr1, arr2) {
        if (arr1.length === 0 || arr2.length === 0) {
            return 0;
        }
        const set1 = new Set(arr1.map((s) => s.toLowerCase()));
        const set2 = new Set(arr2.map((s) => s.toLowerCase()));
        let intersection = 0;
        for (const item of set1) {
            if (set2.has(item)) {
                intersection++;
            }
        }
        return intersection / Math.max(set1.size, set2.size);
    }
}
exports.DynamicPatterns = DynamicPatterns;
//# sourceMappingURL=dynamicPatterns.js.map