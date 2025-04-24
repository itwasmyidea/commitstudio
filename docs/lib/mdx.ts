import path from "path";
import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

const rootDirectory = path.join(process.cwd(), "content");

export interface Metadata {
  title: string;
  description: string;
  date?: string;
  published?: boolean;
  featured?: boolean;
  toc?: boolean;
  [key: string]: any;
}

export interface Doc {
  slug: string;
  metadata: Metadata;
  content: string;
}

export async function getDocFromSlug(slug: string): Promise<Doc> {
  console.log("Getting doc from slug:", slug);
  
  // Try with MDX extension first
  let filePath = path.join(rootDirectory, `${slug}.mdx`);
  
  // If not found, try with MD extension
  if (!fs.existsSync(filePath)) {
    filePath = path.join(rootDirectory, `${slug}.md`);
  }
  
  // If still not found, throw error
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    throw new Error(`Could not find document: ${slug}`);
  }
  
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(fileContents);
  
  return {
    slug: slug,
    metadata: data as Metadata,
    content,
  };
}

export async function getAllDocs(directory: string): Promise<Doc[]> {
  // Create the full directory path
  const dirPath = path.join(rootDirectory, directory);
  
  // Make sure the directory exists
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    return [];
  }
  
  // Read files from the directory
  const files = fs.readdirSync(dirPath, { recursive: true });
  
  const docs = await Promise.all(
    files
      .filter((file) => 
        typeof file === 'string' && (file.endsWith(".mdx") || file.endsWith(".md"))
      )
      .map(async (file) => {
        const filePathWithoutExt = (file as string).replace(/\.(mdx|md)$/, "");
        const fullPath = path.join(directory, filePathWithoutExt);
        
        return getDocFromSlug(fullPath);
      })
  );
  
  return docs.filter(doc => 
    doc.metadata.published !== false
  ).sort((a, b) => {
    if (a.metadata.date && b.metadata.date) {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    }
    return 0;
  });
}

export async function processMDX(content: string) {
  const { content: processedContent, frontmatter } = await compileMDX({
    source: content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              properties: {
                className: ["subheading-anchor"],
                ariaLabel: "Link to section",
              },
            },
          ],
        ],
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return {
    content: processedContent,
    frontmatter: frontmatter as Metadata,
  };
} 