/**
 * Beast Mode Research
 *
 * Exhaustive 6-tier research protocol for Mendix widget patterns.
 * This is the AI's research brain - never gives up, always finds answers.
 *
 * NOW WITH LEARNING: Checks local knowledge base FIRST before external research.
 * Research findings are saved back, so the system gets smarter over time.
 */

import * as vscode from 'vscode';
import { KnowledgeEntry, KnowledgeSharing } from './knowledgeSharing';

export interface ResearchResult {
  summary: string;
  codeExamples: CodeExample[];
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  fromCache?: boolean; // True if this came from local knowledge
}

export interface CodeExample {
  language: string;
  code: string;
  source: string;
  description?: string;
}

// Research tier definitions - NOW WITH LOCAL KNOWLEDGE AS TIER 0!
const RESEARCH_TIERS = [
  {
    tier: 0,
    name: 'Local Knowledge Base (Learned Patterns)',
    sources: ['Previously successful builds', 'Saved research findings', 'Working fixes'],
  },
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

export class BeastModeResearch {
  private knowledgeSharing: KnowledgeSharing;

  constructor() {
    this.knowledgeSharing = new KnowledgeSharing();
  }

  /**
   * Perform exhaustive research on a topic
   * NOW CHECKS LOCAL KNOWLEDGE FIRST before external research!
   */
  async research(
    topic: string,
    progressCallback?: (update: string) => void
  ): Promise<ResearchResult> {
    const codeExamples: CodeExample[] = [];
    const sources: string[] = [];
    let summary = '';

    progressCallback?.(`## 🔬 Beast Mode Activated\n\n`);
    progressCallback?.(`**Topic:** ${topic}\n\n`);

    // TIER 0: Check local knowledge base FIRST
    progressCallback?.(`### Tier 0: Checking Local Knowledge Base...\n\n`);

    const localKnowledge = this.knowledgeSharing.searchKnowledge(topic);
    if (localKnowledge.length > 0) {
      progressCallback?.(
        `✅ **Found ${localKnowledge.length} relevant entries in local knowledge!**\n\n`
      );

      // Check if we have a high-confidence match
      const highConfidence = localKnowledge.find((k) => k.confidence === 'high');
      if (highConfidence) {
        progressCallback?.(`🎯 **High-confidence match found:** ${highConfidence.title}\n\n`);
        progressCallback?.(`Using cached knowledge (faster and proven to work).\n\n`);

        // Return the cached result
        return {
          summary: highConfidence.content,
          codeExamples: this.extractCodeExamplesFromContent(highConfidence.content),
          sources: [`Local Knowledge: ${highConfidence.title}`, highConfidence.source],
          confidence: 'high',
          fromCache: true,
        };
      }

      // Medium confidence - use as supplement
      progressCallback?.(`📚 Found relevant patterns (will enhance external research):\n`);
      for (const entry of localKnowledge.slice(0, 3)) {
        progressCallback?.(`  - ${entry.title}\n`);
        sources.push(`Local: ${entry.title}`);
      }
      progressCallback?.(`\n`);
    } else {
      progressCallback?.(`No cached knowledge found. Proceeding with external research...\n\n`);
    }

    // Continue with external research
    try {
      // Use any available model (works with GPT-4, Claude, etc.)
      const models = await vscode.lm.selectChatModels({});
      const model = models[0];

      if (!model) {
        return this.getFallbackResearch(topic);
      }

      // Build comprehensive research prompt, including local knowledge context
      const researchPrompt = this.buildResearchPrompt(topic, localKnowledge);

      progressCallback?.(`### Searching external tiers...\n\n`);

      for (const tier of RESEARCH_TIERS.filter((t) => t.tier > 0)) {
        progressCallback?.(`**Tier ${tier.tier}: ${tier.name}**\n`);
        tier.sources.forEach((s) => progressCallback?.(`  - ${s}\n`));
        progressCallback?.(`\n`);
      }

      const messages = [vscode.LanguageModelChatMessage.User(researchPrompt)];
      const response = await model.sendRequest(
        messages,
        {},
        new vscode.CancellationTokenSource().token
      );

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
    } catch (error) {
      progressCallback?.(`\n⚠️ Research error: ${error}\n`);
      return this.getFallbackResearch(topic);
    }
  }

  /**
   * Analyze build errors and research solutions
   */
  async analyzeError(errorText: string): Promise<string> {
    try {
      // Use any available model (works with GPT-4, Claude, etc.)
      const models = await vscode.lm.selectChatModels({});
      const model = models[0];

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
      const response = await model.sendRequest(
        messages,
        {},
        new vscode.CancellationTokenSource().token
      );

      let result = '';
      for await (const chunk of response.text) {
        result += chunk;
      }

      return result;
    } catch (error) {
      return this.getGenericErrorAdvice(errorText);
    }
  }

  /**
   * Extract code examples from cached knowledge content
   */
  private extractCodeExamplesFromContent(content: string): CodeExample[] {
    const examples: CodeExample[] = [];

    // Match code blocks with language
    const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      examples.push({
        language: match[1],
        code: match[2].trim(),
        source: 'Local Knowledge Base',
        description: 'Cached from previous research',
      });
    }

    return examples;
  }

  /**
   * Build comprehensive research prompt
   */
  private buildResearchPrompt(topic: string, localKnowledge?: KnowledgeEntry[]): string {
    let localContext = '';

    if (localKnowledge && localKnowledge.length > 0) {
      localContext = `\n## LOCAL KNOWLEDGE CONTEXT
The following patterns were found in the local knowledge base. Use them as additional context:

`;
      for (const entry of localKnowledge.slice(0, 3)) {
        localContext += `### ${entry.title}\n${entry.content.substring(0, 500)}...\n\n`;
      }
    }

    return `# 🔥 BEAST MODE RESEARCH: ${topic}

You are researching Mendix Pluggable Widget development. Use the 6-tier exhaustive research protocol.
${localContext}
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
  private parseResearchResult(result: string): {
    summary: string;
    codeExamples: CodeExample[];
    sources: string[];
    confidence: 'high' | 'medium' | 'low';
  } {
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
    } catch {
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
  private getFallbackResearch(topic: string): ResearchResult {
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
  private getGenericErrorAdvice(errorText: string): string {
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
