/**
 * Interactive Wizard for Widget Creation
 */

import chalk from 'chalk';
import Enquirer from 'enquirer';
const { prompt } = Enquirer;

const CATEGORIES = [
  'Display',
  'Input controls',
  'Data controls',
  'Navigation',
  'File handling',
  'Utilities',
];

const PROPERTY_TYPES = [
  { name: 'string', description: 'Text input' },
  { name: 'boolean', description: 'True/false toggle' },
  { name: 'integer', description: 'Whole number' },
  { name: 'decimal', description: 'Decimal number' },
  { name: 'enumeration', description: 'Dropdown selection' },
  { name: 'textTemplate', description: 'Text with parameters' },
  { name: 'expression', description: 'Dynamic expression' },
  { name: 'action', description: 'Event handler' },
  { name: 'attribute', description: 'Entity attribute binding' },
  { name: 'datasource', description: 'List of objects' },
  { name: 'widgets', description: 'Container for child widgets' },
  { name: 'image', description: 'Static or dynamic image' },
  { name: 'icon', description: 'Icon from library' },
];

export function intro() {
  console.log(chalk.gray("  Let's create your widget step by step.\n"));
}

export async function wizard(providedName) {
  intro();

  // Step 1: Basic Info
  console.log(chalk.magenta.bold('📋 STEP 1: Basic Information\n'));

  const basicInfo = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Widget name (PascalCase)',
      initial: providedName || 'MyWidget',
      validate: (v) => /^[A-Z][a-zA-Z0-9]+$/.test(v) || 'Must be PascalCase (e.g., StatusBadge)',
    },
    {
      type: 'input',
      name: 'displayName',
      message: 'Display name (shown in Studio Pro)',
      initial: (prev) => prev.name.replace(/([A-Z])/g, ' $1').trim(),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description',
      initial: (prev) => `A custom ${prev.displayName} widget`,
    },
    {
      type: 'select',
      name: 'category',
      message: 'Category',
      choices: CATEGORIES,
    },
    {
      type: 'input',
      name: 'company',
      message: 'Company prefix (for package naming)',
      initial: 'mycompany',
    },
  ]);

  // Step 2: Properties
  console.log(chalk.magenta.bold('\n🎛️  STEP 2: Widget Properties\n'));

  const properties = [];
  let addMore = true;

  const { wantProperties } = await prompt({
    type: 'confirm',
    name: 'wantProperties',
    message: 'Add properties to your widget?',
    initial: true,
  });

  while (addMore && wantProperties) {
    const prop = await promptProperty();
    properties.push(prop);

    const { continueAdding } = await prompt({
      type: 'confirm',
      name: 'continueAdding',
      message: 'Add another property?',
      initial: true,
    });
    addMore = continueAdding;
  }

  // Step 3: Events
  console.log(chalk.magenta.bold('\n🎯 STEP 3: Events (Actions)\n'));

  const events = [];

  const { wantEvents } = await prompt({
    type: 'confirm',
    name: 'wantEvents',
    message: 'Add event handlers (onClick, onChange, etc.)?',
    initial: true,
  });

  if (wantEvents) {
    let addMoreEvents = true;
    while (addMoreEvents) {
      const event = await promptEvent();
      events.push(event);

      const { continueAdding } = await prompt({
        type: 'confirm',
        name: 'continueAdding',
        message: 'Add another event?',
        initial: false,
      });
      addMoreEvents = continueAdding;
    }
  }

  // Summary
  console.log(
    chalk.green.bold('\n╔═══════════════════════════════════════════════════════════════════╗')
  );
  console.log(
    chalk.green.bold('║  📋 WIDGET CONFIGURATION SUMMARY                                  ║')
  );
  console.log(
    chalk.green.bold('╚═══════════════════════════════════════════════════════════════════╝\n')
  );

  console.log(chalk.white(`   Widget: ${basicInfo.name} (${basicInfo.displayName})`));
  console.log(chalk.white(`   Category: ${basicInfo.category} | Company: ${basicInfo.company}`));
  console.log(chalk.white(`   Properties: ${properties.length}`));
  properties.forEach((p) => console.log(chalk.gray(`      • ${p.key} (${p.type})`)));
  console.log(chalk.white(`   Events: ${events.length}`));
  events.forEach((e) => console.log(chalk.gray(`      • ${e.key}`)));

  const { proceed } = await prompt({
    type: 'confirm',
    name: 'proceed',
    message: 'Generate widget?',
    initial: true,
  });

  if (!proceed) {
    console.log(chalk.yellow('Cancelled.'));
    process.exit(0);
  }

  // Step 4: Output Settings
  console.log(chalk.magenta.bold('\n📂 STEP 4: Output Settings\n'));

  const outputSettings = await prompt([
    {
      type: 'input',
      name: 'outputPath',
      message: 'Output directory (where to create the widget)',
      initial: '.',
    },
    {
      type: 'input',
      name: 'mendixProjectPath',
      message: 'Mendix project widgets folder (optional - for auto-deploy)',
      initial: '',
      hint: 'Leave empty to skip auto-deploy',
    },
  ]);

  return {
    widget: basicInfo,
    properties,
    events,
    outputPath: outputSettings.outputPath,
    mendixProjectPath: outputSettings.mendixProjectPath || null,
  };
}

async function promptProperty() {
  const typeChoices = PROPERTY_TYPES.map((t) => ({
    name: t.name,
    message: `${t.name.padEnd(15)} - ${t.description}`,
  }));

  const base = await prompt([
    {
      type: 'select',
      name: 'type',
      message: 'Property type',
      choices: typeChoices,
    },
    {
      type: 'input',
      name: 'key',
      message: 'Property key (camelCase)',
      validate: (v) => /^[a-z][a-zA-Z0-9]*$/.test(v) || 'Must be camelCase',
    },
    {
      type: 'input',
      name: 'caption',
      message: 'Caption (shown in Studio Pro)',
      initial: (prev) => prev.key.replace(/([A-Z])/g, ' $1').trim(),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description',
    },
    {
      type: 'confirm',
      name: 'required',
      message: 'Required?',
      initial: true,
    },
  ]);

  // Type-specific options
  if (base.type === 'enumeration') {
    const { values } = await prompt({
      type: 'input',
      name: 'values',
      message: 'Enum values (comma-separated)',
      initial: 'option1, option2, option3',
    });
    base.enumValues = values.split(',').map((v) => v.trim());
    base.defaultValue = base.enumValues[0];
  }

  if (base.type === 'expression') {
    const { returnType } = await prompt({
      type: 'select',
      name: 'returnType',
      message: 'Return type',
      choices: ['String', 'Boolean', 'Integer', 'Decimal', 'DateTime'],
    });
    base.returnType = returnType;
  }

  if (base.type === 'attribute') {
    const { attrTypes } = await prompt({
      type: 'multiselect',
      name: 'attrTypes',
      message: 'Allowed attribute types',
      choices: ['String', 'Integer', 'Long', 'Decimal', 'Boolean', 'DateTime', 'Enum'],
      initial: ['String'],
    });
    base.attributeTypes = attrTypes;
  }

  console.log(chalk.green(`   ✅ Added: ${base.key} (${base.type})`));
  return base;
}

async function promptEvent() {
  const event = await prompt([
    {
      type: 'input',
      name: 'key',
      message: 'Event key (e.g., onClick, onSelect)',
      initial: 'onClick',
    },
    {
      type: 'input',
      name: 'caption',
      message: 'Caption',
      initial: (prev) => prev.key.replace(/([A-Z])/g, ' $1').trim(),
    },
  ]);

  event.type = 'action';
  event.description = `Triggered when ${event.caption.toLowerCase()}`;

  console.log(chalk.green(`   ✅ Added event: ${event.key}`));
  return event;
}

export default { wizard, intro };
