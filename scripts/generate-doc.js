#!/usr/bin/env node

/**
 * Documentation template generator
 * Creates consistent documentation files based on templates
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import enquirer from "enquirer";

const { prompt } = enquirer;

// Directory setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const docsDir = path.join(rootDir, "docs", "content", "docs");

// Documentation categories
const categories = [
  { name: "1.getting-started", display: "Getting Started" },
  { name: "2.usage", display: "Usage" },
  { name: "3.configuration", display: "Configuration" },
  { name: "4.advanced", display: "Advanced" },
  { name: "5.api-reference", display: "API Reference" },
  { name: "6.troubleshooting", display: "Troubleshooting" },
];

// Template generators
const templates = {
  // Getting Started template
  "1.getting-started": (title, slug) => `---
title: ${title}
description: Learn how to get started with CommitStudio
---

# ${title}

Brief introduction to this topic.

## Prerequisites

- List prerequisites here
- Node.js v18 or higher
- Git installed and configured

## Installation

\`\`\`bash
npm install -g commitstudio
\`\`\`

## Usage

\`\`\`bash
commitstudio --help
\`\`\`

## Next Steps

- [Configuration Options](/docs/3-configuration/options)
- [Standard Mode](/docs/2-usage/standard-mode)
- [Examples](/docs/2-usage/examples)
`,

  // Usage template
  "2.usage": (title, slug) => `---
title: ${title}
description: Learn how to use CommitStudio for ${title.toLowerCase()}
---

# ${title}

Brief explanation of this usage mode.

## Available Options

\`\`\`bash
commitstudio [options]
\`\`\`

- \`--option-one\`: Description of option one
- \`--option-two\`: Description of option two

## Examples

\`\`\`bash
# Example 1
commitstudio --example-flag

# Example 2
commitstudio --another-flag
\`\`\`

## Best Practices

- List best practices here
- And other recommendations

## Related Topics

- [Configuration Options](/docs/3-configuration/options)
- [Troubleshooting](/docs/6.troubleshooting/common-issues)
`,

  // Configuration template
  "3.configuration": (title, slug) => `---
title: ${title}
description: Learn about ${title.toLowerCase()} in CommitStudio
---

# ${title}

Overview of this configuration topic.

## Available Options

- \`option-one\`: Description of option one
- \`option-two\`: Description of option two

## Examples

\`\`\`bash
# Example configuration
commitstudio config --set-option value
\`\`\`

## Best Practices

- Configuration recommendation 1
- Configuration recommendation 2

## Related Settings

- [Related Topic 1](/docs/3-configuration/options)
- [Related Topic 2](/docs/2-usage/standard-mode)
`,

  // Default template for other categories
  "default": (title, slug) => `---
title: ${title}
description: Documentation about ${title.toLowerCase()} in CommitStudio
---

# ${title}

Overview of this topic.

## Key Points

- Important point 1
- Important point 2
- Important point 3

## Examples

\`\`\`bash
# Example code
commitstudio --example-flag
\`\`\`

## Related Topics

- [Getting Started](/docs/1.getting-started/introduction)
- [Configuration](/docs/3-configuration/options)
`,
};

async function generateDoc() {
  console.log(chalk.blue("Documentation Template Generator"));
  
  try {
    // Select category
    const { category } = await prompt({
      type: "select",
      name: "category",
      message: "Select documentation category:",
      choices: categories.map(c => ({ name: c.name, message: c.display })),
    });
    
    // Get document title
    const { title } = await prompt({
      type: "input",
      name: "title",
      message: "Enter document title:",
      validate: value => value.length > 0 ? true : 'Title is required',
    });
    
    // Generate slug from title
    let slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-');     // Remove consecutive hyphens
    
    // Let user confirm or modify slug
    const { confirmedSlug } = await prompt({
      type: "input",
      name: "confirmedSlug",
      message: "Confirm or modify the document slug:",
      initial: slug,
    });
    
    slug = confirmedSlug;
    
    // Determine template to use
    const templateFn = templates[category] || templates.default;
    
    // Generate content
    const content = templateFn(title, slug);
    
    // Create directory if it doesn't exist
    const dirPath = path.join(docsDir, category);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write file
    const filePath = path.join(dirPath, `${slug}.mdx`);
    fs.writeFileSync(filePath, content);
    
    console.log(chalk.green(`✓ Documentation file created at: ${path.relative(rootDir, filePath)}`));
    
    // Suggest next steps
    console.log(chalk.blue("\nNext steps:"));
    console.log(chalk.dim("1. Edit the generated file to add more specific content"));
    console.log(chalk.dim("2. Run the validation to check for any issues:"));
    console.log(chalk.dim("   npm run docs:validate"));
    console.log(chalk.dim("3. Start the docs dev server to preview:"));
    console.log(chalk.dim("   npm run docs:dev"));
    
  } catch (error) {
    console.error(chalk.red("Error generating documentation:"), error.message);
    process.exit(1);
  }
}

// Run the generator
generateDoc(); 