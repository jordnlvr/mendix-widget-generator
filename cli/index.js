#!/usr/bin/env node

/**
 * create-mendix-widget CLI
 *
 * The fastest way to create Mendix pluggable widgets.
 *
 * Usage:
 *   npx create-mendix-widget
 *   npx create-mendix-widget my-widget
 *   npx create-mendix-widget --template status-badge
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { createRequire } from 'module';
import { generateFromConfig } from './generator.js';
import { getTemplate, listTemplates } from './templates.js';
import { wizard } from './wizard.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

async function generateFromTemplate(templateName, customName, options) {
  const template = getTemplate(templateName);

  if (!template) {
    console.log(chalk.red(`\n❌ Template "${templateName}" not found.\n`));
    listTemplates();
    process.exit(1);
  }

  // Build config from template
  const config = {
    name: customName || template.name,
    displayName: customName ? customName.replace(/([A-Z])/g, ' $1').trim() : template.displayName,
    description: template.description,
    category: template.category,
    properties: template.properties,
    events: template.events || [],
  };

  console.log(chalk.cyan(`\n📦 Using template: ${chalk.bold(template.displayName)}`));
  console.log(chalk.gray(`   ${template.description}\n`));

  await generateFromConfig(config, options);
}

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white(
  '🧙 MENDIX WIDGET GENERATOR'
)}                                     ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray(
  'Zero to deployed widget in 60 seconds'
)}                           ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════════════╝')}
`;

program
  .name('create-mendix-widget')
  .description('🧙 The fastest way to create Mendix pluggable widgets')
  .version(pkg.version)
  .argument('[name]', 'Widget name (PascalCase)')
  .option('-t, --template <name>', 'Use a template (run --list-templates to see options)')
  .option('-c, --config <path>', 'Path to JSON config file')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-m, --mendix <path>', 'Mendix project widgets folder (for auto-deploy)')
  .option('-l, --list-templates', 'List available templates')
  .option('--no-install', 'Skip npm install')
  .option('--no-build', 'Skip npm run build')
  .action(async (name, options) => {
    console.log(banner);

    // List templates and exit
    if (options.listTemplates) {
      listTemplates();
      process.exit(0);
    }

    // Config file mode
    if (options.config) {
      await generateFromConfig(options.config, { ...options, mendixProjectPath: options.mendix });
      return;
    }

    // Template mode
    if (options.template) {
      await generateFromTemplate(options.template, name, { ...options, mendixProjectPath: options.mendix });
      return;
    }

    // Interactive wizard (default)
    const config = await wizard(name);
    
    // Use paths from wizard or command line
    const finalOptions = {
      ...options,
      output: config.outputPath || options.output,
      mendixProjectPath: config.mendixProjectPath || options.mendix,
    };
    
    await generateFromConfig(config, finalOptions);
  });

program.parse();
