import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocFromSlug, processMDX } from "@/lib/mdx";
import { getTableOfContents } from "@/lib/utils";
import { DocPage } from "@/components/docs/doc-page";
import { Mdx } from "@/components/mdx/mdx-components";

interface DocPageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata(props: DocPageProps): Promise<Metadata> {
  // Use props to access params in Next.js 15
  const params = await Promise.resolve(props.params);
  const slug = params?.slug || [];
  
  try {
    const doc = await getDocFromSlug(`docs/${slug.join("/")}`);
    return {
      title: doc.metadata.title,
      description: doc.metadata.description,
    };
  } catch (error) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    };
  }
}

export default async function Page(props: DocPageProps) {
  // Use props to access params in Next.js 15
  const params = await Promise.resolve(props.params);
  const slug = params?.slug || [];
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