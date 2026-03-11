/**
 * Custom rehype-remark handlers for Confluence storage format elements.
 *
 * These handle Atlassian-specific XHTML elements (ac:*, ri:*) and map them
 * to appropriate Markdown AST nodes.
 */

import type { Element } from 'hast';
import type { Node as MdastNode } from 'mdast';

type State = any;
type Handle = any;

// Helper: extract text content recursively from hast node
function textContent(node: any): string {
  if (node.type === 'text') return node.value || '';
  if (node.type === 'comment') {
    // CDATA sections are parsed as comments: [CDATA[...]]
    const val: string = node.value || '';
    const match = val.match(/^\[CDATA\[([\s\S]*)\]\]$/);
    if (match) return match[1];
    return '';
  }
  if (node.children) return node.children.map(textContent).join('');
  return '';
}

// Helper: find a child element by tag name (supports namespaced names)
function findChild(node: Element, tagName: string): Element | undefined {
  return (node.children as any[])?.find(
    (c: any) => c.type === 'element' && c.tagName === tagName
  );
}

// Helper: find all children by tag name
function findChildren(node: Element, tagName: string): Element[] {
  return (node.children as any[])?.filter(
    (c: any) => c.type === 'element' && c.tagName === tagName
  ) || [];
}

/**
 * Handle ac:structured-macro — the big one.
 * Covers code blocks, panels (info/warning/note/tip), and unknown macros.
 */
function handleStructuredMacro(state: State, node: Element): MdastNode | MdastNode[] {
  const macroName = (node.properties as any)?.['ac:name'] ||
    (node.properties as any)?.name ||
    (node.properties as any)?.['acName'] || '';

  // Code block macro
  if (macroName === 'code') {
    const langParam = findChildren(node, 'ac:parameter').find(
      (p: Element) => (p.properties as any)?.['ac:name'] === 'language' ||
        (p.properties as any)?.name === 'language' ||
        (p.properties as any)?.['acName'] === 'language'
    );
    const language = langParam ? textContent(langParam) : '';
    const body = findChild(node, 'ac:plain-text-body') || findChild(node, 'ac:rich-text-body');
    const code = body ? textContent(body) : '';

    return {
      type: 'code',
      lang: language || null,
      value: code.replace(/^\n|\n$/g, ''),
    } as any;
  }

  // Panel macros → blockquote with label
  if (['info', 'warning', 'note', 'tip', 'expand'].includes(macroName)) {
    const body = findChild(node, 'ac:rich-text-body');
    const children = body ? state.all(body as any) : [];
    const label = macroName.charAt(0).toUpperCase() + macroName.slice(1);

    return {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'strong', children: [{ type: 'text', value: `${label}:` }] },
            { type: 'text', value: ' ' },
            // Flatten children: if first child is paragraph, inline its children
            ...(children.length > 0 && (children[0] as any).type === 'paragraph'
              ? (children[0] as any).children
              : children),
          ],
        },
        ...children.slice(1),
      ],
    } as any;
  }

  // TOC macro — skip
  if (macroName === 'toc') {
    return [] as any;
  }

  // Unknown macro → HTML comment
  return {
    type: 'html',
    value: `<!-- Unsupported macro: ${macroName} -->`,
  } as any;
}

/**
 * Handle ac:image — Confluence image elements.
 */
function handleImage(state: State, node: Element): MdastNode {
  const attachment = findChild(node, 'ri:attachment');
  const url = findChild(node, 'ri:url');

  let src = '';
  let alt = (node.properties as any)?.alt ||
    (node.properties as any)?.['ac:alt'] || '';

  if (attachment) {
    const filename = (attachment.properties as any)?.['ri:filename'] ||
      (attachment.properties as any)?.filename || '';
    src = filename;
    if (!alt) alt = filename;
  } else if (url) {
    src = (url.properties as any)?.['ri:value'] ||
      (url.properties as any)?.value || '';
  }

  return {
    type: 'image',
    url: src,
    alt: alt,
    title: null,
  } as any;
}

/**
 * Handle ac:link — Confluence internal links.
 */
function handleLink(state: State, node: Element): MdastNode {
  const page = findChild(node, 'ri:page');
  const attachment = findChild(node, 'ri:attachment');
  const user = findChild(node, 'ri:user');
  const linkBody = findChild(node, 'ac:link-body') || findChild(node, 'ac:plain-text-link-body');

  let href = '';
  let text = '';

  if (page) {
    const title = (page.properties as any)?.['ri:content-title'] ||
      (page.properties as any)?.contentTitle || '';
    href = title;
    text = linkBody ? textContent(linkBody) : title;
  } else if (attachment) {
    const filename = (attachment.properties as any)?.['ri:filename'] ||
      (attachment.properties as any)?.filename || '';
    href = filename;
    text = linkBody ? textContent(linkBody) : filename;
  } else if (user) {
    text = linkBody ? textContent(linkBody) : 'user';
    href = '#';
  } else {
    text = linkBody ? textContent(linkBody) : '';
    href = '#';
  }

  return {
    type: 'link',
    url: href,
    title: null,
    children: [{ type: 'text', value: text }],
  } as any;
}

/**
 * Handle ac:emoticon
 */
function handleEmoticon(state: State, node: Element): MdastNode {
  const name = (node.properties as any)?.['ac:name'] ||
    (node.properties as any)?.name ||
    (node.properties as any)?.['acName'] || '';
  const emojiMap: Record<string, string> = {
    smile: '😊', sad: '😢', tick: '✅', cross: '❌',
    warning: '⚠️', information: 'ℹ️', plus: '➕', minus: '➖',
    question: '❓', 'thumbs-up': '👍', 'thumbs-down': '👎',
    star_yellow: '⭐', heart: '❤️', light_on: '💡',
  };
  return { type: 'text', value: emojiMap[name] || `(:${name}:)` } as any;
}

/**
 * Fallback for any unrecognized element → HTML comment.
 */
function handleUnknown(tagName: string): (state: State, node: Element) => MdastNode {
  return (_state, node) => ({
    type: 'html',
    value: `<!-- Unsupported element: ${tagName} -->`,
  } as any);
}

// Build the handlers map. rehype-remark looks up handlers by tagName.
const confluenceElements: Record<string, Handle> = {
  'ac:structured-macro': handleStructuredMacro as Handle,
  'ac:image': handleImage as Handle,
  'ac:link': handleLink as Handle,
  'ac:emoticon': handleEmoticon as Handle,
};

// Common unknown Confluence elements that should degrade gracefully
const unknownAcElements = [
  'ac:task-list', 'ac:task', 'ac:task-body', 'ac:task-id',
  'ac:placeholder', 'ac:layout', 'ac:layout-section', 'ac:layout-cell',
  'ac:inline-comment-marker',
];

// Build the full handlers map
export const confluenceHandlers: Record<string, Handle> = {
  ...confluenceElements,
};

// Add handlers for unknown elements
for (const tag of unknownAcElements) {
  confluenceHandlers[tag] = handleUnknown(tag) as Handle;
}
