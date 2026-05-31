import featuredImage from "@/assets/blog/ai-system-workspace.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  readingTime: string;
  datePublished: string;
  dateModified: string;
  image: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "20-ai-system-small-business-10-hours",
    title: "The $20 AI System That Can Save Small Business Owners 10 Hours a Week",
    subtitle: "A simple, practical workflow you can set up today without hiring a team",
    excerpt:
      "Most small business owners don't need more tools. They need fewer repetitive tasks. Here is the $20 AI workflow that quietly buys back 10 hours every week.",
    category: "AI for Small Business",
    readingTime: "7 min read",
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    image: featuredImage,
    author: "Coach Kay",
  },
];

export const getPostBySlug = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);