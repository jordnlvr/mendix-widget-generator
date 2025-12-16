"use strict";
/**
 * Beast Mode Research
 *
 * Exhaustive 6-tier research protocol for Mendix widget patterns.
 * This is the AI's research brain - never gives up, always finds answers.
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
exports.BeastModeResearch = void 0;
const vscode = __importStar(require("vscode"));
// Research tier definitions
const RESEARCH_TIERS = [
    {
        tier: 1,
        name: 'Official Documentation',
        sources: [
            'docs.mendix.com',
            'apidocs.rnd.mendix.com/modelsdk/latest',
            'apidocs.rnd.mendix.com/platformsdk/latest',
            'docs.mendix.com/refguide',
            'docs.mendix.com/howto/extensibility',
        ],
    },
    {
        tier: 2,
        name: 'GitHub Code (THE GOLD MINES!)',
        sources: [
            'github.com/mendix/sdk-demo',
            'github.com/mendix/widgets-resources',
            'github.com/mendixlabs',
            'github.com search: mendixmodelsdk language:typescript',
        ],
    },
    {
        tier: 3,
        name: 'npm Package Analysis',
        sources: [
            'npmjs.com: @mendix/pluggable-widgets-tools',
            'npmjs.com: mendixmodelsdk dependents',
            'npmjs.com: @mendix/*',
        ],
    },
    {
        tier: 4,
        name: 'Community Forums',
        sources: [
            'community.mendix.com',
            'stackoverflow.com/questions/tagged/mendix',
            'stackoverflow.com/questions/tagged/mendix-pluggable-widgets',
        ],
    },
    {
        tier: 5,
        name: 'Web Archives',
        sources: ['web.archive.org/web/*/docs.mendix.com/*', 'archive.ph/docs.mendix.com'],
    },
    {
        tier: 6,
        name: 'Video & Multimedia',
        sources: [
            'youtube.com: mendix pluggable widgets',
            'Mendix World presentations',
            'Mendix Academy courses',
        ],
    },
];
class BeastModeResearch {
    /**
     * Perform exhaustive research on a topic
     */
    async research(topic, progressCallback) {
        const codeExamples = [];
        const sources = [];
        let summary = '';
        progressCallback?.(`## 🔬 Beast Mode Activated\n\n`);
        progressCallback?.(`**Topic:** ${topic}\n\n`);
        // Use the language model to research
        try {
            const [model] = await vscode.lm.selectChatModels({ family: 'gpt-4' });
            if (!model) {
                return this.getFallbackResearch(topic);
            }
            // Build comprehensive research prompt
            const researchPrompt = this.buildResearchPrompt(topic);
            progressCallback?.(`### Searching all 6 tiers...\n\n`);
            for (const tier of RESEARCH_TIERS) {
                progressCallback?.(`**Tier ${tier.tier}: ${tier.name}**\n`);
                tier.sources.forEach((s) => progressCallback?.(`  - ${s}\n`));
                progressCallback?.(`\n`);
            }
            const messages = [vscode.LanguageModelChatMessage.User(researchPrompt)];
            const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
            let result = '';
            for await (const chunk of response.text) {
                result += chunk;
            }
            // Parse the research results
            const parsed = this.parseResearchResult(result);
            return {
                summary: parsed.summary || `Research completed on: ${topic}`,
                codeExamples: parsed.codeExamples,
                sources: parsed.sources,
                confidence: parsed.confidence,
            };
        }
        catch (error) {
            progressCallback?.(`\n⚠️ Research error: ${error}\n`);
            return this.getFallbackResearch(topic);
        }
    }
    /**
     * Analyze build errors and research solutions
     */
    async analyzeError(errorText) {
        try {
            const [model] = await vscode.lm.selectChatModels({ family: 'gpt-4' });
            if (!model) {
                return this.getGenericErrorAdvice(errorText);
            }
            const prompt = `You are a Mendix Pluggable Widget expert. Analyze this build error and provide:
1. What caused the error
2. How to fix it (with code examples)
3. How to prevent it in the future

Error:
\`\`\`
${errorText}
\`\`\`

Be specific and provide exact code fixes. Use the Beast Mode research protocol - search exhaustively through:
- Official Mendix widget documentation
- @mendix/pluggable-widgets-tools docs
- TypeScript/React patterns
- Common widget development pitfalls`;
            const messages = [vscode.LanguageModelChatMessage.User(prompt)];
            const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
            let result = '';
            for await (const chunk of response.text) {
                result += chunk;
            }
            return result;
        }
        catch (error) {
            return this.getGenericErrorAdvice(errorText);
        }
    }
    /**
     * Build comprehensive research prompt
     */
    buildResearchPrompt(topic) {
        return `# 🔥 BEAST MODE RESEARCH: ${topic}

You are researching Mendix Pluggable Widget development. Use the 6-tier exhaustive research protocol.

## RESEARCH TIERS (Search ALL of them!)

### Tier 1: Official Documentation
- docs.mendix.com - Main documentation
- docs.mendix.com/howto/extensibility/pluggable-widgets - Widget how-tos
- @mendix/pluggable-widgets-tools documentation

### Tier 2: GitHub Code (GOLD MINE!)
- github.com/mendix/widgets-resources - Official widget examples
- Search: \`${topic} mendix widget language:typescript\`
- Check package.json patterns, TypeScript configurations

### Tier 3: npm Packages
- @mendix/pluggable-widgets-tools - Build tooling
- Other @mendix/* packages
- Community widget packages

### Tier 4: Community
- community.mendix.com forums
- Stack Overflow [mendix] tags
- Reddit r/mendix

### Tier 5: Archives
- Wayback Machine for old docs
- Archived tutorials

### Tier 6: Video/Courses
- Mendix Academy
- YouTube tutorials
- Mendix World presentations

## YOUR TASK

Research "${topic}" and provide:

1. **Summary**: What you found (2-3 paragraphs)
2. **Code Examples**: Working TypeScript/React code snippets
3. **Best Practices**: Dos and don'ts
4. **Sources**: Where you found this information
5. **Confidence Level**: high/medium/low based on source quality

Respond in this JSON format:
{
    "summary": "...",
    "codeExamples": [
        {"language": "typescript", "code": "...", "source": "...", "description": "..."}
    ],
    "bestPractices": ["Do: ...", "Don't: ..."],
    "sources": ["url1", "url2"],
    "confidence": "high|medium|low"
}

REMEMBER: Beast Mode NEVER gives up. Search ALL tiers!`;
    }
    /**
     * Parse research result JSON
     */
    parseResearchResult(result) {
        try {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    summary: parsed.summary || '',
                    codeExamples: parsed.codeExamples || [],
                    sources: parsed.sources || [],
                    confidence: parsed.confidence || 'medium',
                };
            }
        }
        catch {
            // JSON parsing failed, extract what we can
        }
        return {
            summary: result,
            codeExamples: [],
            sources: [],
            confidence: 'low',
        };
    }
    /**
     * Fallback when LLM is not available
     */
    getFallbackResearch(topic) {
        return {
            summary: `## Research on: ${topic}

I couldn't access the AI model for exhaustive research. Here are the resources you should check manually:

### Tier 1: Official Documentation
- [Pluggable Widgets How-To](https://docs.mendix.com/howto/extensibility/pluggable-widgets/)
- [Widget Property Types](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-property-types/)

### Tier 2: GitHub (THE GOLD MINES!)
- [mendix/widgets-resources](https://github.com/mendix/widgets-resources) - Official examples
- Search: \`${topic} site:github.com mendix\`

### Tier 3: npm
- [@mendix/pluggable-widgets-tools](https://www.npmjs.com/package/@mendix/pluggable-widgets-tools)

### Tier 4: Community
- [Mendix Forum](https://community.mendix.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mendix)

Use these resources to research "${topic}" manually.`,
            codeExamples: [],
            sources: [
                'https://docs.mendix.com/howto/extensibility/pluggable-widgets/',
                'https://github.com/mendix/widgets-resources',
            ],
            confidence: 'low',
        };
    }
    /**
     * Generic error advice when LLM is not available
     */
    getGenericErrorAdvice(errorText) {
        // Analyze common patterns
        if (errorText.includes('Cannot find module')) {
            return `## Module Not Found Error

**Problem:** A required module is missing.

**Solution:**
1. Run \`npm install\` to install dependencies
2. Check if the import path is correct
3. Verify the package is listed in package.json

\`\`\`bash
npm install
\`\`\`
`;
        }
        if (errorText.includes('Type') && errorText.includes('is not assignable')) {
            return `## TypeScript Type Error

**Problem:** Type mismatch in your code.

**Solution:**
1. Check the property types in your .xml file match your TypeScript types
2. Ensure EditableValue<T> is used for attribute bindings
3. Use ActionValue for action properties

\`\`\`typescript
// For attributes:
value: EditableValue<string>;

// For actions:
onClick?: ActionValue;
\`\`\`
`;
        }
        if (errorText.includes('xml') || errorText.includes('XML')) {
            return `## Widget XML Error

**Problem:** Issue with the widget.xml configuration.

**Solution:**
1. Validate XML syntax
2. Check property key names match component props
3. Ensure correct attribute/action types

\`\`\`xml
<property key="myProp" type="string" required="true">
    <caption>My Property</caption>
    <description>Description here</description>
</property>
\`\`\`
`;
        }
        return `## Build Error Analysis

**Error detected:**
\`\`\`
${errorText.substring(0, 500)}${errorText.length > 500 ? '...' : ''}
\`\`\`

**General troubleshooting steps:**
1. Run \`npm install\` to ensure dependencies are installed
2. Check for TypeScript errors: \`npm run lint\`
3. Verify widget.xml matches your component props
4. Check the Mendix pluggable widgets documentation

**Resources:**
- [Widget Development Guide](https://docs.mendix.com/howto/extensibility/pluggable-widgets/)
- [@mendix/pluggable-widgets-tools](https://www.npmjs.com/package/@mendix/pluggable-widgets-tools)
`;
    }
}
exports.BeastModeResearch = BeastModeResearch;
//# sourceMappingURL=beastModeResearch.js.map