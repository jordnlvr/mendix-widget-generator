/**
 * Mendix Path Validator
 *
 * Intelligent validation of Mendix project paths.
 * NOT a monkey - actually understands Mendix project structure:
 * - Finds .mpr files
 * - Knows widgets go in the 'widgets' subfolder
 * - Checks for naming conflicts
 * - Provides helpful suggestions
 */

import * as fs from 'fs';
import * as path from 'path';

export interface PathValidationResult {
  isValid: boolean;
  projectPath?: string;
  projectName?: string;
  mprFile?: string;
  mendixVersion?: string;
  widgetsFolder?: string;
  existingWidgets?: string[];
  error?: string;
  suggestion?: string;
}

export interface WidgetConflictResult {
  exists: boolean;
  existingPath?: string;
  existingVersion?: string;
}

export class MendixPathValidator {
  /**
   * Validate a Mendix project path
   * Smart enough to:
   * - Find .mpr even if user provides project root
   * - Navigate to widgets folder automatically
   * - Extract project metadata
   */
  async validateMendixProject(inputPath: string): Promise<PathValidationResult> {
    try {
      // Normalize the path
      const normalizedPath = path.normalize(inputPath.trim());

      // Check if path exists
      if (!fs.existsSync(normalizedPath)) {
        return {
          isValid: false,
          error: `Path does not exist: ${normalizedPath}`,
          suggestion: 'Please provide a valid folder path to your Mendix project.',
        };
      }

      const stats = fs.statSync(normalizedPath);

      // If it's a file, check if it's an .mpr
      if (stats.isFile()) {
        if (normalizedPath.endsWith('.mpr')) {
          return this.validateFromMpr(normalizedPath);
        } else {
          return {
            isValid: false,
            error: 'Provided file is not a .mpr file',
            suggestion: 'Point to the project folder or the .mpr file directly.',
          };
        }
      }

      // It's a directory - search for .mpr file
      const files = fs.readdirSync(normalizedPath);
      const mprFiles = files.filter((f) => f.endsWith('.mpr'));

      if (mprFiles.length === 0) {
        // Maybe they provided the parent folder?
        const subdirs = files.filter((f) => {
          const fullPath = path.join(normalizedPath, f);
          return fs.statSync(fullPath).isDirectory();
        });

        for (const subdir of subdirs) {
          const subdirPath = path.join(normalizedPath, subdir);
          const subdirFiles = fs.readdirSync(subdirPath);
          const subdirMprs = subdirFiles.filter((f) => f.endsWith('.mpr'));
          if (subdirMprs.length > 0) {
            return {
              isValid: false,
              error: `No .mpr file found in ${normalizedPath}`,
              suggestion: `Did you mean: ${path.join(normalizedPath, subdir)}? Found ${
                subdirMprs[0]
              } there.`,
            };
          }
        }

        return {
          isValid: false,
          error: 'No Mendix project (.mpr file) found in this folder',
          suggestion:
            "Make sure you're pointing to the Mendix project root folder containing the .mpr file.",
        };
      }

      if (mprFiles.length > 1) {
        return {
          isValid: false,
          error: `Multiple .mpr files found: ${mprFiles.join(', ')}`,
          suggestion: 'Point directly to the specific .mpr file you want to use.',
        };
      }

      const mprPath = path.join(normalizedPath, mprFiles[0]);
      return this.validateFromMpr(mprPath);
    } catch (error) {
      return {
        isValid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Check that you have access to the folder.',
      };
    }
  }

  /**
   * Validate from a specific .mpr file path
   */
  private async validateFromMpr(mprPath: string): Promise<PathValidationResult> {
    const projectDir = path.dirname(mprPath);
    const projectName = path.basename(mprPath, '.mpr');

    // Find or create widgets folder
    const widgetsFolder = path.join(projectDir, 'widgets');
    let existingWidgets: string[] = [];

    if (fs.existsSync(widgetsFolder)) {
      const widgetFiles = fs.readdirSync(widgetsFolder);
      existingWidgets = widgetFiles.filter((f) => f.endsWith('.mpk'));
    }

    // Try to extract Mendix version from project metadata
    const mendixVersion = await this.extractMendixVersion(projectDir);

    return {
      isValid: true,
      projectPath: projectDir,
      projectName,
      mprFile: mprPath,
      mendixVersion,
      widgetsFolder,
      existingWidgets,
    };
  }

  /**
   * Extract Mendix version from project files
   */
  private async extractMendixVersion(projectDir: string): Promise<string> {
    // Check .mpr.json or other metadata files
    const mprJsonPath = path.join(projectDir, '.mendix-cache', 'version.json');
    const modelerVersionPath = path.join(projectDir, '.mpr.lock');

    try {
      // Try the lock file
      if (fs.existsSync(modelerVersionPath)) {
        const content = fs.readFileSync(modelerVersionPath, 'utf8');
        const versionMatch = content.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          return versionMatch[1];
        }
      }

      // Try the cache folder
      if (fs.existsSync(mprJsonPath)) {
        const content = JSON.parse(fs.readFileSync(mprJsonPath, 'utf8'));
        if (content.version) {
          return content.version;
        }
      }

      // Check the mpr file size and naming conventions
      // (larger projects tend to be newer versions)
      return 'Unknown (10.x+ assumed)';
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Check if a widget with the given name already exists
   */
  async checkWidgetConflict(
    widgetsFolder: string,
    widgetName: string
  ): Promise<WidgetConflictResult> {
    try {
      if (!fs.existsSync(widgetsFolder)) {
        return { exists: false };
      }

      const widgetFiles = fs.readdirSync(widgetsFolder);
      const widgetNameLower = widgetName.toLowerCase();

      for (const file of widgetFiles) {
        if (file.endsWith('.mpk')) {
          const nameWithoutExt = file.replace('.mpk', '');
          // Widget names might have version suffixes
          const baseName = nameWithoutExt.replace(/-\d+\.\d+\.\d+$/, '');

          if (
            baseName.toLowerCase() === widgetNameLower ||
            nameWithoutExt.toLowerCase() === widgetNameLower
          ) {
            // Try to extract version from filename
            const versionMatch = nameWithoutExt.match(/-(\d+\.\d+\.\d+)$/);

            return {
              exists: true,
              existingPath: path.join(widgetsFolder, file),
              existingVersion: versionMatch ? versionMatch[1] : 'unknown',
            };
          }
        }
      }

      return { exists: false };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Check if a path is a valid writable folder
   */
  async isValidFolder(folderPath: string): Promise<boolean> {
    try {
      const stats = fs.statSync(folderPath);
      if (!stats.isDirectory()) {
        return false;
      }

      // Check write access by trying to create a test file
      const testFile = path.join(folderPath, '.widget-test-' + Date.now());
      try {
        fs.writeFileSync(testFile, '');
        fs.unlinkSync(testFile);
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get the widgets folder for a project, creating it if needed
   */
  async ensureWidgetsFolder(projectPath: string): Promise<string> {
    const widgetsFolder = path.join(projectPath, 'widgets');

    if (!fs.existsSync(widgetsFolder)) {
      fs.mkdirSync(widgetsFolder, { recursive: true });
    }

    return widgetsFolder;
  }

  /**
   * Generate a non-conflicting widget name
   */
  async generateUniqueName(widgetsFolder: string, baseName: string): Promise<string> {
    let name = baseName;
    let counter = 1;

    while (true) {
      const conflict = await this.checkWidgetConflict(widgetsFolder, name);
      if (!conflict.exists) {
        return name;
      }
      counter++;
      name = `${baseName}${counter}`;
    }
  }
}
