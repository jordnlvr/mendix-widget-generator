/**
 * Widget Templates Gallery
 */

import chalk from 'chalk';

export const TEMPLATES = {
  'status-badge': {
    name: 'StatusBadge',
    displayName: 'Status Badge',
    description: 'Displays a colored status indicator with label',
    category: 'Display',
    properties: [
      {
        key: 'status',
        type: 'enumeration',
        caption: 'Status',
        description: 'Status type',
        enumValues: ['info', 'success', 'warning', 'error'],
        defaultValue: 'info',
      },
      {
        key: 'label',
        type: 'textTemplate',
        caption: 'Label',
        description: 'Badge text',
        required: true,
      },
      {
        key: 'showIcon',
        type: 'boolean',
        caption: 'Show Icon',
        description: 'Display status icon',
        defaultValue: true,
      },
    ],
    events: [
      { key: 'onClick', caption: 'On Click', description: 'Triggered when badge is clicked' },
    ],
  },

  'data-card': {
    name: 'DataCard',
    displayName: 'Data Card',
    description: 'Card component that repeats for each item in a datasource',
    category: 'Data controls',
    properties: [
      {
        key: 'dataSource',
        type: 'datasource',
        caption: 'Data source',
        description: 'List of items',
        required: true,
      },
      {
        key: 'content',
        type: 'widgets',
        caption: 'Card Content',
        description: 'Widget content for each card',
        dataSource: 'dataSource',
      },
      {
        key: 'columns',
        type: 'enumeration',
        caption: 'Columns',
        description: 'Grid columns',
        enumValues: ['1', '2', '3', '4'],
        defaultValue: '3',
      },
      {
        key: 'emptyMessage',
        type: 'string',
        caption: 'Empty Message',
        description: 'Shown when no items',
        defaultValue: 'No items found',
      },
    ],
    events: [
      { key: 'onSelect', caption: 'On Select', description: 'Triggered when card is selected' },
    ],
  },

  'text-input': {
    name: 'TextInput',
    displayName: 'Text Input',
    description: 'Custom text input with validation',
    category: 'Input controls',
    properties: [
      {
        key: 'value',
        type: 'attribute',
        caption: 'Value',
        description: 'Bound attribute',
        attributeTypes: ['String'],
        required: true,
      },
      {
        key: 'placeholder',
        type: 'string',
        caption: 'Placeholder',
        description: 'Placeholder text',
        defaultValue: 'Enter text...',
      },
      {
        key: 'maxLength',
        type: 'integer',
        caption: 'Max Length',
        description: 'Maximum characters',
        defaultValue: 255,
      },
      {
        key: 'required',
        type: 'boolean',
        caption: 'Required',
        description: 'Is field required',
        defaultValue: false,
      },
    ],
    events: [
      { key: 'onChange', caption: 'On Change', description: 'Triggered when value changes' },
      { key: 'onBlur', caption: 'On Blur', description: 'Triggered when field loses focus' },
    ],
  },

  'progress-bar': {
    name: 'ProgressBar',
    displayName: 'Progress Bar',
    description: 'Visual progress indicator',
    category: 'Display',
    properties: [
      {
        key: 'value',
        type: 'expression',
        caption: 'Value',
        description: 'Current value (0-100)',
        returnType: 'Integer',
        required: true,
      },
      {
        key: 'showLabel',
        type: 'boolean',
        caption: 'Show Label',
        description: 'Display percentage',
        defaultValue: true,
      },
      {
        key: 'color',
        type: 'enumeration',
        caption: 'Color',
        description: 'Bar color',
        enumValues: ['primary', 'success', 'warning', 'danger'],
        defaultValue: 'primary',
      },
      {
        key: 'animated',
        type: 'boolean',
        caption: 'Animated',
        description: 'Animate progress',
        defaultValue: true,
      },
    ],
    events: [],
  },

  'icon-button': {
    name: 'IconButton',
    displayName: 'Icon Button',
    description: 'Button with icon and optional label',
    category: 'Input controls',
    properties: [
      { key: 'icon', type: 'icon', caption: 'Icon', description: 'Button icon', required: true },
      {
        key: 'label',
        type: 'textTemplate',
        caption: 'Label',
        description: 'Button text',
        required: false,
      },
      {
        key: 'variant',
        type: 'enumeration',
        caption: 'Variant',
        description: 'Button style',
        enumValues: ['primary', 'secondary', 'outline', 'ghost'],
        defaultValue: 'primary',
      },
      {
        key: 'disabled',
        type: 'expression',
        caption: 'Disabled',
        description: 'Disable button',
        returnType: 'Boolean',
      },
    ],
    events: [{ key: 'onClick', caption: 'On Click', description: 'Triggered when clicked' }],
  },

  tabs: {
    name: 'Tabs',
    displayName: 'Tabs',
    description: 'Tabbed content container',
    category: 'Navigation',
    properties: [
      {
        key: 'tabs',
        type: 'object',
        caption: 'Tabs',
        description: 'Tab definitions',
        isList: true,
      },
      {
        key: 'defaultTab',
        type: 'integer',
        caption: 'Default Tab',
        description: 'Initially selected tab (0-based)',
        defaultValue: 0,
      },
      {
        key: 'variant',
        type: 'enumeration',
        caption: 'Variant',
        description: 'Tab style',
        enumValues: ['line', 'enclosed', 'pills'],
        defaultValue: 'line',
      },
    ],
    events: [
      { key: 'onTabChange', caption: 'On Tab Change', description: 'Triggered when tab changes' },
    ],
  },

  'modal-trigger': {
    name: 'ModalTrigger',
    displayName: 'Modal Trigger',
    description: 'Button that opens a modal popup',
    category: 'Navigation',
    properties: [
      {
        key: 'triggerText',
        type: 'textTemplate',
        caption: 'Trigger Text',
        description: 'Button text',
        required: true,
      },
      {
        key: 'modalTitle',
        type: 'textTemplate',
        caption: 'Modal Title',
        description: 'Modal header',
        required: true,
      },
      {
        key: 'content',
        type: 'widgets',
        caption: 'Modal Content',
        description: 'Content inside modal',
      },
      {
        key: 'size',
        type: 'enumeration',
        caption: 'Size',
        description: 'Modal size',
        enumValues: ['sm', 'md', 'lg', 'xl'],
        defaultValue: 'md',
      },
    ],
    events: [
      { key: 'onOpen', caption: 'On Open', description: 'Triggered when modal opens' },
      { key: 'onClose', caption: 'On Close', description: 'Triggered when modal closes' },
    ],
  },

  'file-upload': {
    name: 'FileUpload',
    displayName: 'File Upload',
    description: 'Drag-and-drop file uploader',
    category: 'File handling',
    properties: [
      {
        key: 'accept',
        type: 'string',
        caption: 'Accepted Types',
        description: 'MIME types or extensions',
        defaultValue: '*/*',
      },
      {
        key: 'maxSize',
        type: 'integer',
        caption: 'Max Size (MB)',
        description: 'Maximum file size',
        defaultValue: 10,
      },
      {
        key: 'multiple',
        type: 'boolean',
        caption: 'Multiple',
        description: 'Allow multiple files',
        defaultValue: false,
      },
    ],
    events: [
      { key: 'onUpload', caption: 'On Upload', description: 'Triggered when file is uploaded' },
      { key: 'onError', caption: 'On Error', description: 'Triggered on upload error' },
    ],
  },

  countdown: {
    name: 'Countdown',
    displayName: 'Countdown Timer',
    description: 'Countdown to a target date/time',
    category: 'Display',
    properties: [
      {
        key: 'targetDate',
        type: 'attribute',
        caption: 'Target Date',
        description: 'Countdown to this date',
        attributeTypes: ['DateTime'],
        required: true,
      },
      {
        key: 'showDays',
        type: 'boolean',
        caption: 'Show Days',
        description: 'Display days',
        defaultValue: true,
      },
      {
        key: 'showHours',
        type: 'boolean',
        caption: 'Show Hours',
        description: 'Display hours',
        defaultValue: true,
      },
      {
        key: 'showMinutes',
        type: 'boolean',
        caption: 'Show Minutes',
        description: 'Display minutes',
        defaultValue: true,
      },
      {
        key: 'showSeconds',
        type: 'boolean',
        caption: 'Show Seconds',
        description: 'Display seconds',
        defaultValue: true,
      },
    ],
    events: [
      {
        key: 'onComplete',
        caption: 'On Complete',
        description: 'Triggered when countdown reaches zero',
      },
    ],
  },

  rating: {
    name: 'Rating',
    displayName: 'Star Rating',
    description: 'Interactive star rating component',
    category: 'Input controls',
    properties: [
      {
        key: 'value',
        type: 'attribute',
        caption: 'Value',
        description: 'Rating value (1-5)',
        attributeTypes: ['Integer', 'Decimal'],
        required: true,
      },
      {
        key: 'maxStars',
        type: 'integer',
        caption: 'Max Stars',
        description: 'Number of stars',
        defaultValue: 5,
      },
      {
        key: 'readonly',
        type: 'boolean',
        caption: 'Read Only',
        description: 'Disable interaction',
        defaultValue: false,
      },
      {
        key: 'size',
        type: 'enumeration',
        caption: 'Size',
        description: 'Star size',
        enumValues: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    ],
    events: [
      { key: 'onChange', caption: 'On Change', description: 'Triggered when rating changes' },
    ],
  },
};

export function listTemplates() {
  console.log(chalk.cyan.bold('\n📦 Available Widget Templates\n'));
  console.log(chalk.gray('  Use: npx create-mendix-widget --template <name>\n'));

  for (const [key, template] of Object.entries(TEMPLATES)) {
    console.log(chalk.white.bold(`  ${key.padEnd(20)}`), chalk.gray(template.description));
  }

  console.log('');
}

export function getTemplate(name) {
  return TEMPLATES[name];
}

export default { TEMPLATES, listTemplates, getTemplate };
