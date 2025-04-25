import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocFromSlug } from "@/lib/mdx";
import { getTableOfContents } from "@/lib/utils";
import { DocPage } from "@/components/docs/doc-page";
import { Mdx } from "@/components/mdx/mdx-components";

// Define the parameter type
interface Params {
  slug: string[];
}

// Type for search params
type SearchParams = Record<string, string | string[] | undefined>;

// Interface following Next.js 15 requirements
interface PageProps {
  params: Promise<Params> | undefined;
  searchParams: Promise<SearchParams> | undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Ensure params is resolved
  const resolvedParams = await (params || Promise.resolve({ slug: [] }));
  const slug = resolvedParams?.slug || [];
  
  try {
    const doc = await getDocFromSlug(`docs/${slug.join("/")}`);
    return {
      title: doc.metadata.title,
      description: doc.metadata.description,
    };
  } catch {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  // Ensure params is resolved
  const resolvedParams = await (params || Promise.resolve({ slug: [] }));
  const slug = resolvedParams?.slug || [];
  const fullSlug = `docs/${slug.join("/")}`;
  
  try {
    const doc = await getDocFromSlug(fullSlug);
    const headings = getTableOfContents(doc.content);
    
    // Use the Mdx component as a server component
    const mdxContent = await Mdx({ code: doc.content });

    return (
      <DocPage 
        mdxContent={mdxContent} 
        metadata={doc.metadata} 
        slug={fullSlug} 
        headings={headings} 
      />
    );
  } catch (error) {
    console.error("Error loading doc:", error);
    notFound();
  }
} 