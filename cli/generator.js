/**
 * Widget Generator - Core Logic
 * Generates Mendix Pluggable Widget from config
 */

import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateFromConfig(config, options = {}) {
  // Handle both config object and file path
  let widgetConfig = config;
  if (typeof config === 'string') {
    widgetConfig = await fs.readJson(config);
  }

  // Normalize config (support both flat and nested)
  const widget = widgetConfig.widget || widgetConfig;
  const properties = widgetConfig.properties || [];
  const events = widgetConfig.events || [];

  const {
    name,
    displayName = name,
    description = `A custom ${displayName} widget`,
    category = 'Display',
    company = 'mycompany',
  } = widget;

  const widgetNameLower = name.toLowerCase();
  const outputDir = path.resolve(options.output || '.', widgetNameLower);

  console.log('');
  const spinner = ora(`Creating ${chalk.cyan(name)} widget...`).start();

  try {
    // Create directory structure
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(outputDir, 'src'));

    // Generate files
    spinner.text = 'Generating widget XML...';
    await generateWidgetXml(outputDir, {
      name,
      displayName,
      description,
      category,
      company,
      properties,
      events,
    });

    spinner.text = 'Generating package.json...';
    await generatePackageJson(outputDir, { name, displayName, description, company });

    spinner.text = 'Generating tsconfig.json...';
    await generateTsConfig(outputDir);

    spinner.text = 'Generating component...';
    await generateComponent(outputDir, { name, properties, events });

    spinner.text = 'Generating preview...';
    await generatePreview(outputDir, { name, displayName });

    spinner.text = 'Generating styles...';
    await generateStyles(outputDir, { name });

    spinner.text = 'Generating package.xml...';
    await generatePackageXml(outputDir, { name, displayName, description, company });

    spinner.succeed(`Created ${chalk.cyan(name)} in ${chalk.gray(outputDir)}`);

    // Install dependencies
    if (options.install !== false) {
      const installSpinner = ora('Installing dependencies...').start();
      try {
        execSync('npm install', { cwd: outputDir, stdio: 'pipe' });
        installSpinner.succeed('Dependencies installed');
      } catch (err) {
        installSpinner.fail('Failed to install dependencies');
        console.log(chalk.yellow('  Run `npm install` manually'));
      }
    }

    // Build widget
    if (options.build !== false) {
      const buildSpinner = ora('Building widget...').start();
      try {
        execSync('npm run build', { cwd: outputDir, stdio: 'pipe' });
        buildSpinner.succeed('Build successful');

        // Find MPK
        const distDir = path.join(outputDir, 'dist');
        if (await fs.pathExists(distDir)) {
          const mpks = await findFiles(distDir, '.mpk');
          if (mpks.length > 0) {
            const mpkSize = (await fs.stat(mpks[0])).size / 1024;
            console.log(
              chalk.green(`  ✅ MPK created: ${path.basename(mpks[0])} (${mpkSize.toFixed(1)} KB)`)
            );
          }
        }
      } catch (err) {
        buildSpinner.fail('Build failed');
        console.log(chalk.red('  Check the output above for errors'));
      }
    }

    // Success message
    console.log('');
    console.log(
      chalk.green.bold('╔═══════════════════════════════════════════════════════════════════╗')
    );
    console.log(
      chalk.green.bold('║  ✅ WIDGET READY!                                                 ║')
    );
    console.log(
      chalk.green.bold('╚═══════════════════════════════════════════════════════════════════╝')
    );
    console.log('');
    console.log(chalk.white('  Next steps:'));
    console.log(
      chalk.gray(
        `  1. Copy the .mpk from ${widgetNameLower}/dist/ to your Mendix project widgets folder`
      )
    );
    console.log(chalk.gray('  2. Open Studio Pro and press F4 to refresh'));
    console.log(chalk.gray(`  3. Find "${displayName}" in the toolbox`));
    console.log('');
  } catch (err) {
    spinner.fail('Failed to create widget');
    console.error(chalk.red(err.message));
    process.exit(1);
  }
}

// ============================================================================
// FILE GENERATORS
// ============================================================================

async function generateWidgetXml(dir, config) {
  const { name, displayName, description, category, company, properties, events } = config;

  const propsXml = properties.map((p) => generatePropertyXml(p)).join('\n');
  const eventsXml = events.map((e) => generateEventXml(e)).join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<widget id="${company}.${name.toLowerCase()}.${name}" pluginWidget="true" needsEntityContext="false"
        supportedPlatform="Web" offlineCapable="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../node_modules/mendix/custom_widget.xsd">
    <name>${displayName}</name>
    <description>${description}</description>
    <icon/>
    <properties>
        <propertyGroup caption="General">
${propsXml}
        </propertyGroup>
        <propertyGroup caption="Events">
${eventsXml}
        </propertyGroup>
        <propertyGroup caption="Common">
            <systemProperty key="Name" />
            <systemProperty key="Visibility" />
        </propertyGroup>
    </properties>
</widget>`;

  await fs.writeFile(path.join(dir, 'src', `${name}.xml`), xml);
}

function generatePropertyXml(prop) {
  const {
    key,
    type,
    caption,
    description,
    required = false,
    defaultValue,
    enumValues,
    returnType,
    attributeTypes,
  } = prop;
  const req = required ? 'required="true"' : 'required="false"';
  const indent = '            ';

  switch (type) {
    case 'string':
      const strDefault = defaultValue ? `defaultValue="${defaultValue}"` : '';
      return `${indent}<property key="${key}" type="string" ${req} ${strDefault}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;

    case 'boolean':
      return `${indent}<property key="${key}" type="boolean" defaultValue="${
        defaultValue !== false
      }">
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;

    case 'integer':
      return `${indent}<property key="${key}" type="integer" defaultValue="${defaultValue || 0}">
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;

    case 'enumeration':
      const enumXml = (enumValues || ['option1'])
        .map(
          (v) =>
            `${indent}        <enumerationValue key="${v}">${
              v.charAt(0).toUpperCase() + v.slice(1)
            }</enumerationValue>`
        )
        .join('\n');
      return `${indent}<property key="${key}" type="enumeration" defaultValue="${
        defaultValue || enumValues?.[0] || 'option1'
      }">
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}    <enumerationValues>
${enumXml}
${indent}    </enumerationValues>
${indent}</property>`;

    case 'textTemplate':
      return `${indent}<property key="${key}" type="textTemplate" ${req}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;

    case 'expression':
      return `${indent}<property key="${key}" type="expression" ${req}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}    <returnType type="${returnType || 'String'}" />
${indent}</property>`;

    case 'attribute':
      const attrTypesXml = (attributeTypes || ['String'])
        .map((t) => `${indent}        <attributeType name="${t}" />`)
        .join('\n');
      return `${indent}<property key="${key}" type="attribute" ${req}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}    <attributeTypes>
${attrTypesXml}
${indent}    </attributeTypes>
${indent}</property>`;

    case 'datasource':
      return `${indent}<property key="${key}" type="datasource" isList="true" ${req}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;

    case 'widgets':
      const dsRef = prop.dataSource ? `dataSource="${prop.dataSource}"` : '';
      return `${indent}<property key="${key}" type="widgets" ${req} ${dsRef}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;

    default:
      return `${indent}<property key="${key}" type="${type}" ${req}>
${indent}    <caption>${caption}</caption>
${indent}    <description>${description}</description>
${indent}</property>`;
  }
}

function generateEventXml(event) {
  const indent = '            ';
  return `${indent}<property key="${event.key}" type="action" required="false">
${indent}    <caption>${event.caption}</caption>
${indent}    <description>${event.description || 'Event handler'}</description>
${indent}</property>`;
}

async function generatePackageJson(dir, config) {
  const { name, description, company } = config;
  const pkg = {
    name: name.toLowerCase(),
    version: '1.0.0',
    description,
    copyright: `© ${new Date().getFullYear()} ${company}`,
    license: 'MIT',
    scripts: {
      build: `cross-env MPKOUTPUT=${name}.mpk pluggable-widgets-tools build:web`,
      dev: 'pluggable-widgets-tools start:web',
    },
    devDependencies: {
      '@mendix/pluggable-widgets-tools': '~10.21.2',
      '@types/react': '~18.2.0',
      'cross-env': '^7.0.3',
    },
    dependencies: {
      classnames: '^2.3.2',
    },
    overrides: {
      react: '18.2.0',
      'react-dom': '18.2.0',
      '@types/react': '~18.2.0',
    },
  };

  await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
}

async function generateTsConfig(dir) {
  const tsconfig = {
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM'],
      module: 'ES2022',
      moduleResolution: 'bundler',
      noUnusedLocals: true,
      noUnusedParameters: true,
      outDir: './dist',
      resolveJsonModule: true,
      skipLibCheck: true,
      strict: true,
      target: 'ES2022',
    },
    include: ['src/**/*'],
  };

  await fs.writeJson(path.join(dir, 'tsconfig.json'), tsconfig, { spaces: 2 });
}

async function generateComponent(dir, config) {
  const { name, properties } = config;
  const nameLower = name.toLowerCase();

  const tsx = `import { ReactElement, createElement } from "react";
import { ${name}ContainerProps } from "../typings/${name}Props";
import classNames from "classnames";

import "./ui/${name}.css";

export function ${name}({ class: className, name }: ${name}ContainerProps): ReactElement {
    const rootClass = classNames("widget-${nameLower}", className);
    
    return (
        <div className={rootClass} data-testid={name}>
            <span>${name} Widget</span>
        </div>
    );
}
`;

  await fs.ensureDir(path.join(dir, 'src'));
  await fs.writeFile(path.join(dir, 'src', `${name}.tsx`), tsx);
}

async function generatePreview(dir, config) {
  const { name, displayName } = config;
  const nameLower = name.toLowerCase();

  const tsx = `import { ReactElement, createElement } from "react";
import { ${name}PreviewProps } from "../typings/${name}Props";

export function preview(_props: ${name}PreviewProps): ReactElement {
    return <div className="widget-${nameLower}-preview">${displayName}</div>;
}

export function getPreviewCss(): string {
    return \`
.widget-${nameLower}-preview {
    padding: 8px 12px;
    background: #f5f5f5;
    border: 1px dashed #ccc;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
}
\`;
}
`;

  await fs.writeFile(path.join(dir, 'src', `${name}.editorPreview.tsx`), tsx);
}

async function generateStyles(dir, config) {
  const { name } = config;
  const nameLower = name.toLowerCase();

  const css = `.widget-${nameLower} {
    /* Widget container styles */
}

.widget-${nameLower}--loading {
    opacity: 0.6;
}

.widget-${nameLower}--error {
    color: #e74c3c;
}
`;

  await fs.ensureDir(path.join(dir, 'src', 'ui'));
  await fs.writeFile(path.join(dir, 'src', 'ui', `${name}.css`), css);
}

async function generatePackageXml(dir, config) {
  const { name, displayName, description, company } = config;

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.mendix.com/package/1.0/">
    <clientModule name="${name}" version="1.0.0" xmlns="http://www.mendix.com/clientModule/1.0/">
        <widgetFiles>
            <widgetFile path="${name}.xml" />
        </widgetFiles>
    </clientModule>
</package>`;

  await fs.writeFile(path.join(dir, 'src', 'package.xml'), xml);
}

// Utility: find files by extension
async function findFiles(dir, ext) {
  const results = [];
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...(await findFiles(fullPath, ext)));
    } else if (file.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

export default { generateFromConfig };
