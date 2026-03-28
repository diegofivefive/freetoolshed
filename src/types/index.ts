export interface Tool {
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  paidAlternative?: string;
  badge?: string;
}

export interface ToolCategory {
  name: string;
  slug: string;
  tools: Tool[];
}
