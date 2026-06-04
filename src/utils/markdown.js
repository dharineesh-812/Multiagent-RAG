/**
 * A lightweight, safe Markdown to HTML parser for rendering agent responses.
 * Supports bold, inline code, fenced code blocks, headers, bullet lists, and line breaks.
 */
export function renderMarkdown(text) {
  if (!text) return "";
  
  // Escape HTML tags to prevent injection while allowing our own tags
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Code blocks: ```language ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });
  
  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  
  // Bold: **text**
  html = html.replace(/\*\*([^\*\n]+)\*\*/g, "<strong>$1</strong>");
  
  // Italic: *text*
  html = html.replace(/\*([^\*\n]+)\*/g, "<em>$1</em>");
  
  // Headers
  html = html.replace(/^#### (.*?)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
  
  // Bullet lists (detect starting with - or * or •)
  html = html.replace(/^\s*[-*•]\s+(.*?)$/gm, "<li>$1</li>");
  
  // Wrap list items in <ul>. We can match consecutive <li> tags
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  // Clean up duplicate overlapping <ul> tags created by the regex
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Paragraphs: Split by double newlines, wrap in <p> unless it starts with layout tags
  const blocks = html.split("\n\n");
  const parsedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("<h") || 
      trimmed.startsWith("<pre") || 
      trimmed.startsWith("<ul>") || 
      trimmed.startsWith("<li>") || 
      trimmed.startsWith("<code>")
    ) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
  });
  
  return parsedBlocks.join("\n");
}
