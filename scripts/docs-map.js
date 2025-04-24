#!/usr/bin/env node

/**
 * Documentation map generator
 * Creates a visual map of the documentation structure and identifies gaps
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

// Expected structure based on sidebar
const expectedDocs = {
  "1.getting-started": [
    "introduction", 
    "installation", 
    "quick-start"
  ],
  "2.usage": [
    "standard-mode", 
    "configuration-mode", 
    "yolo-mode", 
    "examples"
  ],
  "3.configuration": [
    "options", 
    "customizing-behavior", 
    "environment-variables"
  ],
  "4.advanced": [
    "ci-cd-integration", 
    "custom-ai-models", 
    "github-actions"
  ],
  "5.api-reference": [
    "cli", 
    "javascript-api", 
    "output-format"
  ],
  "6.troubleshooting": [
    "common-issues", 
    "faq"
  ]
};

async function generateDocsMap() {
  console.log(chalk.blue("Generating documentation map..."));
  
  // Find all existing documentation files
  const files = await glob("**/*.mdx", { cwd: docsDir });
  
  // Map to track existing docs
  const existingDocs = {};
  
  // Process each file to get metadata
  files.forEach(file => {
    const categoryMatch = file.match(/^([^/]+)\/(.+)\.mdx$/);
    if (categoryMatch) {
      const category = categoryMatch[1];
      const slug = categoryMatch[2];
      
      if (!existingDocs[category]) {
        existingDocs[category] = [];
      }
      
      // Get frontmatter
      const filePath = path.join(docsDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        
        existingDocs[category].push({
          slug,
          title: data.title || slug,
          hasDescription: Boolean(data.description),
          wordCount: content.split(/\s+/).length
        });
      } catch (err) {
        console.error(chalk.red(`Error reading ${file}: ${err.message}`));
        existingDocs[category].push({
          slug,
          title: slug,
          hasDescription: false,
          wordCount: 0,
          error: err.message
        });
      }
    }
  });
  
  // Print documentation map
  console.log(chalk.bold("\nDocumentation Map:\n"));
  
  let missingDocs = 0;
  let underfilledDocs = 0;
  
  // For each expected category
  for (const [category, expectedSlugs] of Object.entries(expectedDocs)) {
    console.log(chalk.cyan(`${category}`));
    
    // Check each expected slug
    for (const slug of expectedSlugs) {
      const categoryDocs = existingDocs[category] || [];
      const doc = categoryDocs.find(d => d.slug === slug);
      
      if (doc) {
        const qualityIndicator = doc.wordCount < 200 ? "⚠️" : "✓";
        const descriptionIndicator = doc.hasDescription ? "" : " (missing description)";
        
        // Color code based on quality
        let displayText;
        if (doc.wordCount < 100) {
          displayText = chalk.red(`  ${qualityIndicator} ${slug}: ${doc.title}${descriptionIndicator} (${doc.wordCount} words)`);
          underfilledDocs++;
        } else if (doc.wordCount < 300) {
          displayText = chalk.yellow(`  ${qualityIndicator} ${slug}: ${doc.title}${descriptionIndicator} (${doc.wordCount} words)`);
        } else {
          displayText = chalk.green(`  ${qualityIndicator} ${slug}: ${doc.title} (${doc.wordCount} words)`);
        }
        
        console.log(displayText);
      } else {
        console.log(chalk.red(`  ✘ ${slug}: Missing`));
        missingDocs++;
      }
    }
    
    // Check for extra docs not in expected structure
    const categoryDocs = existingDocs[category] || [];
    const extraDocs = categoryDocs.filter(d => !expectedSlugs.includes(d.slug));
    
    if (extraDocs.length > 0) {
      console.log(chalk.yellow("\n  Extra documents not in sidebar:"));
      extraDocs.forEach(doc => {
        console.log(chalk.yellow(`  ➕ ${doc.slug}: ${doc.title}`));
      });
    }
    
    console.log(""); // Add spacing between categories
  }
  
  // Check for unexpected categories
  const expectedCategories = Object.keys(expectedDocs);
  const extraCategories = Object.keys(existingDocs).filter(c => !expectedCategories.includes(c));
  
  if (extraCategories.length > 0) {
    console.log(chalk.yellow("\nExtra categories not in sidebar:"));
    extraCategories.forEach(category => {
      console.log(chalk.yellow(`${category}`));
      (existingDocs[category] || []).forEach(doc => {
        console.log(chalk.yellow(`  ➕ ${doc.slug}: ${doc.title}`));
      });
    });
    console.log("");
  }
  
  // Summary
  console.log(chalk.bold("\nDocumentation Summary:"));
  console.log(`Total Files: ${files.length}`);
  console.log(`Missing Documents: ${missingDocs}`);
  console.log(`Underfilled Documents: ${underfilledDocs}`);
  console.log(`Documentation Coverage: ${Math.round(((files.length - missingDocs) / getTotalExpectedDocs()) * 100)}%`);
  
  if (missingDocs > 0 || underfilledDocs > 0) {
    console.log(chalk.yellow("\nRecommended Actions:"));
    if (missingDocs > 0) {
      console.log(chalk.yellow("- Create missing documentation pages using:"));
      console.log(chalk.dim("  npm run docs:generate"));
    }
    if (underfilledDocs > 0) {
      console.log(chalk.yellow("- Expand underfilled documents to improve quality"));
      console.log(chalk.dim("  Look for documents marked with ⚠️ above"));
    }
  }
}

function getTotalExpectedDocs() {
  return Object.values(expectedDocs).reduce((sum, slugs) => sum + slugs.length, 0);
}

// Run the generator
generateDocsMap(); 