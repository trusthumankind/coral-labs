import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import { confluenceHandlers } from './handlers.js';

export interface ConvertOptions {
  /** Page title for front matter */
  title?: string;
  /** Confluence page ID for front matter */
  confluenceId?: string;
  /** Base URL for resolving internal links */
  baseUrl?: string;
}

export interface ConvertResult {
  /** The generated Markdown string */
  markdown: string;
}

/**
 * Convert Confluence storage format (XHTML) to Markdown.
 */
export async function convertConfluenceToMarkdown(
  storageFormat: string,
  options: ConvertOptions = {}
): Promise<ConvertResult> {
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark, { handlers: confluenceHandlers })
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '_',
      strong: '*',
      rule: '-',
      listItemIndent: 'one',
    });

  const file = await processor.process(storageFormat);
  let markdown = String(file);

  // Generate front matter
  if (options.title || options.confluenceId) {
    const fm: string[] = ['---'];
    if (options.title) fm.push(`title: "${options.title.replace(/"/g, '\\"')}"`);
    if (options.confluenceId) fm.push(`confluence_id: "${options.confluenceId}"`);
    fm.push('---', '');
    markdown = fm.join('\n') + markdown;
  }

  return { markdown };
}
