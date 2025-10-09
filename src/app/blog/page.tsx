import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - API Monitoring Insights & Guides",
  description:
    "Learn about API monitoring, testing strategies, and developer tools. Comparisons, tutorials, and best practices for building reliable APIs.",
  openGraph: {
    title: "WatchAPI Blog - API Monitoring Insights",
    description:
      "Expert guides on API monitoring, testing, and developer tools.",
  },
};

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "simple-postman-alternatives-2025",
    title: "5 Simple Postman Alternatives for API Testing in 2025",
    description:
      "Looking for a lightweight Postman alternative? Explore modern API testing and monitoring tools that are simpler, more affordable, and better suited for small teams.",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "Comparisons",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
          Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights on API monitoring, testing strategies, and developer tools.
        </p>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="border rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>

            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                {post.title}
              </h2>
            </Link>

            <p className="text-muted-foreground mb-4">{post.description}</p>

            <Link href={`/blog/${post.slug}`}>
              <Button variant="ghost" className="group">
                Read more
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </article>
        ))}
      </div>

      {/* Empty State (when more posts are added, this can be removed) */}
      {blogPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            More posts coming soon. Stay tuned!
          </p>
        </div>
      )}
    </div>
  );
}
