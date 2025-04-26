import { FeatureCard } from "@/components/ui/feature-card";

const features = [
  {
    href: "/docs/1-getting-started/quick-start",
    title: "Quick Start",
    description: "Get up and running with CommitStudio in minutes with this straightforward guide."
  },
  {
    href: "/docs/2-usage/standard-mode",
    title: "Standard Mode",
    description: "Learn how to use CommitStudio's standard mode for thorough code reviews and analysis."
  },
  {
    href: "/docs/2-usage/yolo-mode",
    title: "YOLO Mode",
    description: "Discover the faster, streamlined YOLO mode for quick feedback on your changes."
  },
  {
    href: "/docs/3-configuration/options",
    title: "Configuration Options",
    description: "Customize CommitStudio with various configuration options to match your workflow."
  },
  {
    href: "/docs/6-troubleshooting/faq",
    title: "FAQ",
    description: "Find answers to frequently asked questions about CommitStudio."
  },
  {
    href: "/docs/6-troubleshooting/common-issues",
    title: "Common Issues",
    description: "Solutions to common problems and troubleshooting tips for CommitStudio."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-4 md:py-6 lg:py-8">
      <div className="container space-y-10">
       
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.href}
              href={feature.href}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
} 