#!/usr/bin/env node

/**
 * Documentation validation script
 * Ensures documentation is complete, well-structured, and follows guidelines
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { glob } from "glob";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const docsDir = path.join(rootDir, "docs", "content", "docs");

// Required sections for each documentation page
const requiredSections = {
  all: ["# ", "## "], // All docs must have at least a title and one section heading
  'getting-started': ["## Prerequisites", "## Installation", "## Usage"],
  'configuration': ["## Available Options", "## Examples"],
  'troubleshooting': ["## Common Issues", "## Solutions"],
};

// Required frontmatter properties
const requiredFrontmatter = ["title", "description"];

// Minimum word counts for quality assurance
const minWords = {
  description: 10, // Frontmatter description should have at least 10 words
  content: 100     // Content should have at least 100 words
};

async function validateDocs() {
  console.log(chalk.blue("Validating documentation files..."));
  
  // Find all documentation files
  const files = await glob("**/*.mdx", { cwd: docsDir });
  
  let errors = 0;
  let warnings = 0;
  
  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const relativePath = path.relative(rootDir, filePath);
    const content = fs.readFileSync(filePath, "utf8");
    
    try {
      // Parse frontmatter
      const { data, content: docContent } = matter(content);
      
      console.log(chalk.dim(`Checking ${relativePath}...`));
      
      // Check required frontmatter
      for (const prop of requiredFrontmatter) {
        if (!data[prop]) {
          console.error(chalk.red(`✘ Missing frontmatter property: ${prop}`));
          errors++;
        } else if (prop === "description" && data[prop].split(" ").length < minWords.description) {
          console.warn(chalk.yellow(`⚠ Description too short (${data[prop].split(" ").length} words)`));
          warnings++;
        }
      }
      
      // Check content length
      const wordCount = docContent.split(/\s+/).length;
      if (wordCount < minWords.content) {
        console.warn(chalk.yellow(`⚠ Content too short (${wordCount} words)`));
        warnings++;
      }
      
      // Check for required sections based on doc category
      const category = file.split("/")[0];
      const allSections = requiredSections.all || [];
      const categorySections = requiredSections[category] || [];
      
      const sections = [...allSections, ...categorySections];
      for (const section of sections) {
        if (!docContent.includes(section)) {
          console.warn(chalk.yellow(`⚠ Missing recommended section: ${section}`));
          warnings++;
        }
      }
      
      // Check for code examples (if not in getting-started)
      if (!category.includes("getting-started") && !docContent.includes("```")) {
        console.warn(chalk.yellow("⚠ No code examples found"));
        warnings++;
      }
      
      // Check for links to other documentation
      if (!docContent.includes("](/docs/")) {
        console.warn(chalk.yellow("⚠ No links to other documentation pages"));
        warnings++;
      }
    } catch (err) {
      console.error(chalk.red(`✘ Error parsing ${relativePath}: ${err.message}`));
      errors++;
    }
  }
  
  // Summary
  if (errors === 0 && warnings === 0) {
    console.log(chalk.green("✓ All documentation files validated successfully!"));
    return true;
  } else {
    console.log(chalk.yellow(`Documentation validation complete with ${errors} errors and ${warnings} warnings.`));
    if (errors > 0) {
      return false;
    }
    return true;
  }
}

// Run validation
validateDocs().then(success => {
  if (!success) {
    process.exit(1);
  }
}); 