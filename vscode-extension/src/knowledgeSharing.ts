/**
 * Knowledge Sharing Module
 *
 * When Beast Mode research finds valuable patterns, examples, or solutions,
 * this module saves them to the mendix-mcp-server knowledge base so they
 * can be shared and used in future sessions.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ResearchResult } from './beastModeResearch';

export interface KnowledgeEntry {
  title: string;
  category: string;
  content: string;
  source: string;
  timestamp: string;
  confidence: 'high' | 'medium' | 'low';
  tags: string[];
}

export class KnowledgeSharing {
  private knowledgeBasePath: string | undefined;

  constructor() {
    // Try to find the mendix-mcp-server knowledge base
    this.findKnowledgeBase();
  }

  private findKnowledgeBase(): void {
    // Common locations to search
    const possiblePaths = [
      // Dream Workspace location
      'D:\\Users\\kelly.seale\\VSCode-Dream-Workspace\\MCP-Tools\\mendix-mcp-server\\knowledge',
      // Relative to workspace
      path.join(
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
        'mendix-mcp-server',
        'knowledge'
      ),
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
  async saveResearchFindings(topic: string, result: ResearchResult): Promise<boolean> {
    if (!this.knowledgeBasePath) {
      return false;
    }

    try {
      const entry: KnowledgeEntry = {
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
    } catch (error) {
      console.error('Failed to save research findings:', error);
      return false;
    }
  }

  /**
   * Save a successful widget build pattern
   */
  async saveSuccessfulPattern(config: any, buildOutput: string): Promise<boolean> {
    if (!this.knowledgeBasePath) {
      return false;
    }

    try {
      const entry: KnowledgeEntry = {
        title: `Successful Widget: ${config.name}`,
        category: 'successful-builds',
        content: JSON.stringify(
          {
            config,
            buildNotes: 'Widget built and deployed successfully',
            buildOutput: buildOutput.substring(0, 500), // First 500 chars
          },
          null,
          2
        ),
        source: 'widget-generator',
        timestamp: new Date().toISOString(),
        confidence: 'high',
        tags: ['successful', config.category || 'general', ...this.extractPropertyTypes(config)],
      };

      const filename = `successful-build-${this.slugify(config.name)}-${Date.now()}.json`;
      const filepath = path.join(this.knowledgeBasePath, filename);

      fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save successful pattern:', error);
      return false;
    }
  }

  /**
   * Save a fix that worked (for future auto-fixes)
   */
  async saveWorkingFix(
    errorPattern: string,
    fix: string,
    result: 'success' | 'partial' | 'failed'
  ): Promise<boolean> {
    if (!this.knowledgeBasePath) {
      return false;
    }

    if (result !== 'success') {
      return false; // Only save fixes that worked
    }

    try {
      const entry: KnowledgeEntry = {
        title: `Fix: ${errorPattern.substring(0, 50)}`,
        category: 'error-fixes',
        content: JSON.stringify(
          {
            errorPattern,
            fix,
            result,
          },
          null,
          2
        ),
        source: 'auto-fix',
        timestamp: new Date().toISOString(),
        confidence: 'high',
        tags: ['fix', 'error-handling'],
      };

      const filename = `fix-${this.slugify(errorPattern.substring(0, 30))}-${Date.now()}.json`;
      const filepath = path.join(this.knowledgeBasePath, filename);

      fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save fix:', error);
      return false;
    }
  }

  /**
   * Get status of knowledge sharing
   */
  getStatus(): { enabled: boolean; path?: string; entriesCount?: number } {
    if (!this.knowledgeBasePath) {
      return { enabled: false };
    }

    try {
      const files = fs.readdirSync(this.knowledgeBasePath);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));
      return {
        enabled: true,
        path: this.knowledgeBasePath,
        entriesCount: jsonFiles.length,
      };
    } catch {
      return { enabled: false };
    }
  }

  // ============================================================
  // KNOWLEDGE RETRIEVAL - Use saved knowledge to improve behavior
  // ============================================================

  /**
   * Search knowledge base for patterns matching a topic
   * This is called BEFORE doing external research to use what we've already learned
   */
  searchKnowledge(topic: string): KnowledgeEntry[] {
    if (!this.knowledgeBasePath) {
      return [];
    }

    const results: KnowledgeEntry[] = [];
    const searchTerms = topic.toLowerCase().split(/\s+/);

    try {
      const files = fs.readdirSync(this.knowledgeBasePath);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.knowledgeBasePath, file);
          const content = fs.readFileSync(filepath, 'utf-8');
          const entry: KnowledgeEntry = JSON.parse(content);

          // Score how well this entry matches the search
          const score = this.scoreMatch(entry, searchTerms);
          if (score > 0) {
            (entry as any)._score = score;
            results.push(entry);
          }
        } catch {
          // Skip malformed files
        }
      }

      // Sort by score descending
      results.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));

      // Return top 5 matches
      return results.slice(0, 5);
    } catch {
      return [];
    }
  }

  /**
   * Get known fixes for an error pattern
   * Returns fixes that worked in the past for similar errors
   */
  getKnownFixes(errorText: string): Array<{ errorPattern: string; fix: string }> {
    if (!this.knowledgeBasePath) {
      return [];
    }

    const fixes: Array<{ errorPattern: string; fix: string; score: number }> = [];
    const errorLower = errorText.toLowerCase();

    try {
      const files = fs.readdirSync(this.knowledgeBasePath);

      for (const file of files) {
        if (!file.startsWith('fix-') || !file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.knowledgeBasePath, file);
          const content = fs.readFileSync(filepath, 'utf-8');
          const entry: KnowledgeEntry = JSON.parse(content);

          // Parse the fix content
          const fixData = JSON.parse(entry.content);
          if (fixData.errorPattern && fixData.fix) {
            // Score similarity
            const patternLower = fixData.errorPattern.toLowerCase();
            let score = 0;

            // Check for common error keywords
            const errorKeywords = patternLower.split(/\s+/);
            for (const keyword of errorKeywords) {
              if (keyword.length > 3 && errorLower.includes(keyword)) {
                score += 1;
              }
            }

            if (score > 0) {
              fixes.push({
                errorPattern: fixData.errorPattern,
                fix: fixData.fix,
                score,
              });
            }
          }
        } catch {
          // Skip malformed files
        }
      }

      // Sort by score and return
      fixes.sort((a, b) => b.score - a.score);
      return fixes.slice(0, 3).map((f) => ({ errorPattern: f.errorPattern, fix: f.fix }));
    } catch {
      return [];
    }
  }

  /**
   * Get successful build patterns similar to what we're trying to build
   */
  getSimilarSuccessfulBuilds(widgetType: string): KnowledgeEntry[] {
    if (!this.knowledgeBasePath) {
      return [];
    }

    const results: KnowledgeEntry[] = [];
    const searchTerms = widgetType.toLowerCase().split(/\s+/);

    try {
      const files = fs.readdirSync(this.knowledgeBasePath);

      for (const file of files) {
        if (!file.startsWith('successful-build-') || !file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.knowledgeBasePath, file);
          const content = fs.readFileSync(filepath, 'utf-8');
          const entry: KnowledgeEntry = JSON.parse(content);

          // Check tag matches
          const tagMatches = entry.tags.filter((tag) =>
            searchTerms.some((term) => tag.toLowerCase().includes(term))
          ).length;

          if (tagMatches > 0) {
            (entry as any)._score = tagMatches;
            results.push(entry);
          }
        } catch {
          // Skip malformed files
        }
      }

      results.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));
      return results.slice(0, 3);
    } catch {
      return [];
    }
  }

  /**
   * Get all high-confidence knowledge for a category
   */
  getHighConfidenceKnowledge(category: string): KnowledgeEntry[] {
    if (!this.knowledgeBasePath) {
      return [];
    }

    const results: KnowledgeEntry[] = [];

    try {
      const files = fs.readdirSync(this.knowledgeBasePath);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.knowledgeBasePath, file);
          const content = fs.readFileSync(filepath, 'utf-8');
          const entry: KnowledgeEntry = JSON.parse(content);

          if (entry.category === category && entry.confidence === 'high') {
            results.push(entry);
          }
        } catch {
          // Skip malformed files
        }
      }

      return results;
    } catch {
      return [];
    }
  }

  /**
   * Score how well an entry matches search terms
   */
  private scoreMatch(entry: KnowledgeEntry, searchTerms: string[]): number {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();

    for (const term of searchTerms) {
      if (term.length < 3) continue;

      // Title matches are worth more
      if (titleLower.includes(term)) score += 3;

      // Tag matches are valuable
      if (entry.tags.some((tag) => tag.includes(term))) score += 2;

      // Content matches
      if (contentLower.includes(term)) score += 1;
    }

    // Boost high confidence entries
    if (entry.confidence === 'high') score *= 1.5;
    else if (entry.confidence === 'medium') score *= 1.2;

    return score;
  }

  private formatForKnowledge(result: ResearchResult): string {
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

  private extractTags(topic: string, result: ResearchResult): string[] {
    const tags: string[] = [];

    // Extract from topic
    const topicWords = topic.toLowerCase().split(/\s+/);
    const keywords = [
      'chart',
      'table',
      'input',
      'button',
      'card',
      'modal',
      'form',
      'list',
      'grid',
      'tree',
      'dropdown',
      'date',
      'file',
      'image',
    ];
    for (const word of topicWords) {
      if (keywords.includes(word)) {
        tags.push(word);
      }
    }

    // Add confidence level
    tags.push(`confidence-${result.confidence}`);

    return tags;
  }

  private extractPropertyTypes(config: any): string[] {
    const types = new Set<string>();
    if (config.properties) {
      for (const prop of config.properties) {
        types.add(`prop-${prop.type}`);
      }
    }
    return Array.from(types);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}
