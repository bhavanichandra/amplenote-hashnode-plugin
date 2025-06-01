export const mockHashnodePublications = {
  "data": {
    "publication": {
      "title": "Sample Developer Blog",
      "posts": {
        "edges": [
          {
            "node": {
              "id": "1234567890abcdef12345678",
              "title": "Sample Blog Post A",
              "brief": "This is a short summary of the blog post A. It gives readers an idea of what the blog is about in a few lines.",
              "url": "https://sampleblog.dev/sample-blog-post-a",
              "slug": "sample-blog-post-a",
              "series": null,
              "content": {
                "markdown": "## Introduction\n\nThis is the introductory section of the blog post. It explains the motivation and sets the context.\n\n## Main Content\n\nDetails of the implementation, code snippets, or walkthrough go here.\n\n## Conclusion\n\nFinal thoughts, learnings, and a thank you note to the reader."
              }
            }
          },
          {
            "node": {
              "id": "abcdef1234567890abcdef12",
              "title": "Sample Blog Post B",
              "brief": "Another brief description for blog post B. It outlines the main theme or takeaway of the article.",
              "url": "https://sampleblog.dev/sample-blog-post-b",
              "slug": "sample-blog-post-b",
              "series": {
                "name": "Sample Series",
                "slug": "sample-series"
              },
              "content": {
                "markdown": "## Introduction\n\nHere's a quick explanation of why this blog exists and what it covers.\n\n## Approach\n\nBreakdown of methods used, challenges faced, and solutions implemented.\n\n## Final Notes\n\nClosing words and possibly links to further resources."
              }
            }
          }
        ],
        "totalDocuments": 10
      }
    }
  }
}
