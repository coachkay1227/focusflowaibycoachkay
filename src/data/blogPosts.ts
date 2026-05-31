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
  /** Optional <title> override for SEO/social. Falls back to `title`. */
  seoTitle?: string;
  /** Optional meta description override. Falls back to `excerpt`. */
  seoDescription?: string;
  /** Optional absolute OG image URL. Falls back to bundled `image`. */
  ogImage?: string;
  /** Optional keyword list for <meta name="keywords">. */
  keywords?: string[];
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
    seoTitle:
      "The $20 AI System That Saves Small Business Owners 10 Hours a Week",
    seoDescription:
      "A practical $20/month AI workflow for small business owners — replies, follow-ups, content, scheduling, and admin. Built by Coach Kay (FocusFlow AI).",
    keywords: [
      "AI for small business",
      "ChatGPT for small business",
      "Claude AI workflows",
      "AI tools Columbus",
      "Coach Kay",
      "FocusFlow AI",
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);