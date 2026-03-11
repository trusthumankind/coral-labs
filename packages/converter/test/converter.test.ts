import { describe, it, expect } from 'vitest';
import { convertConfluenceToMarkdown } from '../src/converter.js';

// Helper to trim trailing whitespace from each line for comparison
function trim(s: string): string {
  return s.split('\n').map(l => l.trimEnd()).join('\n').trim();
}

describe('convertConfluenceToMarkdown', () => {

  // --- Front matter ---
  it('generates front matter with title and confluence_id', async () => {
    const { markdown } = await convertConfluenceToMarkdown(
      '<p>Hello</p>',
      { title: 'My Page', confluenceId: '12345' }
    );
    expect(markdown).toContain('---');
    expect(markdown).toContain('title: "My Page"');
    expect(markdown).toContain('confluence_id: "12345"');
    expect(markdown).toContain('Hello');
  });

  it('omits front matter when no options given', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<p>Hello</p>');
    expect(markdown).not.toContain('---');
    expect(trim(markdown)).toBe('Hello');
  });

  // --- Headings ---
  it('converts headings h1-h6', async () => {
    const input = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('# H1');
    expect(markdown).toContain('## H2');
    expect(markdown).toContain('### H3');
    expect(markdown).toContain('#### H4');
    expect(markdown).toContain('##### H5');
    expect(markdown).toContain('###### H6');
  });

  // --- Paragraphs ---
  it('converts paragraphs', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<p>First</p><p>Second</p>');
    expect(trim(markdown)).toContain('First');
    expect(trim(markdown)).toContain('Second');
  });

  // --- Inline formatting ---
  it('converts bold', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<p><strong>bold</strong></p>');
    expect(markdown).toContain('**bold**');
  });

  it('converts italic', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<p><em>italic</em></p>');
    expect(markdown).toContain('_italic_');
  });

  it('converts underline to HTML', async () => {
    // Markdown has no underline, typically preserved as HTML or skipped
    const { markdown } = await convertConfluenceToMarkdown('<p><u>underline</u></p>');
    // rehype-remark may output the text; underline has no MD equivalent
    expect(markdown).toContain('underline');
  });

  it('converts strikethrough', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<p><del>deleted</del></p>');
    expect(markdown).toContain('~~deleted~~');
  });

  // --- Inline code ---
  it('converts inline code', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<p>Use <code>npm install</code> here</p>');
    expect(markdown).toContain('`npm install`');
  });

  // --- Code blocks ---
  it('converts code block macro with language', async () => {
    const input = `
      <ac:structured-macro ac:name="code">
        <ac:parameter ac:name="language">javascript</ac:parameter>
        <ac:plain-text-body><![CDATA[const x = 1;]]></ac:plain-text-body>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('```javascript');
    expect(markdown).toContain('const x = 1;');
    expect(markdown).toContain('```');
  });

  it('converts code block macro without language', async () => {
    const input = `
      <ac:structured-macro ac:name="code">
        <ac:plain-text-body><![CDATA[hello world]]></ac:plain-text-body>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('```');
    expect(markdown).toContain('hello world');
  });

  // --- Lists ---
  it('converts unordered lists', async () => {
    const input = '<ul><li>One</li><li>Two</li><li>Three</li></ul>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('- One');
    expect(markdown).toContain('- Two');
    expect(markdown).toContain('- Three');
  });

  it('converts ordered lists', async () => {
    const input = '<ol><li>First</li><li>Second</li></ol>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('1. First');
    expect(markdown).toContain('2. Second');
  });

  it('converts nested lists', async () => {
    const input = '<ul><li>Parent<ul><li>Child</li></ul></li></ul>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('- Parent');
    expect(markdown).toContain('Child');
  });

  // --- Tables ---
  it('converts tables', async () => {
    const input = `
      <table>
        <tr><th>Name</th><th>Value</th></tr>
        <tr><td>A</td><td>1</td></tr>
        <tr><td>B</td><td>2</td></tr>
      </table>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('Name');
    expect(markdown).toContain('Value');
    expect(markdown).toContain('|');
    expect(markdown).toContain('---');
  });

  // --- Links ---
  it('converts external links', async () => {
    const input = '<p><a href="https://example.com">Example</a></p>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('[Example](https://example.com)');
  });

  it('converts internal Confluence links (ac:link)', async () => {
    const input = `
      <ac:link>
        <ri:page ri:content-title="My Other Page" />
        <ac:plain-text-link-body><![CDATA[Link Text]]></ac:plain-text-link-body>
      </ac:link>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('[');
    expect(markdown).toContain(']');
  });

  // --- Images ---
  it('converts ac:image with attachment', async () => {
    const input = `
      <ac:image>
        <ri:attachment ri:filename="diagram.png" />
      </ac:image>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('![');
    expect(markdown).toContain('diagram.png');
  });

  // --- Horizontal rule ---
  it('converts horizontal rules', async () => {
    const { markdown } = await convertConfluenceToMarkdown('<hr/>');
    expect(markdown).toContain('---');
  });

  // --- Panels ---
  it('converts info panel to blockquote', async () => {
    const input = `
      <ac:structured-macro ac:name="info">
        <ac:rich-text-body><p>This is important info.</p></ac:rich-text-body>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('>');
    expect(markdown).toContain('Info');
    expect(markdown).toContain('important info');
  });

  it('converts warning panel to blockquote', async () => {
    const input = `
      <ac:structured-macro ac:name="warning">
        <ac:rich-text-body><p>Danger ahead!</p></ac:rich-text-body>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('>');
    expect(markdown).toContain('Warning');
    expect(markdown).toContain('Danger ahead');
  });

  it('converts note panel to blockquote', async () => {
    const input = `
      <ac:structured-macro ac:name="note">
        <ac:rich-text-body><p>Take note.</p></ac:rich-text-body>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('>');
    expect(markdown).toContain('Note');
  });

  // --- Graceful degradation ---
  it('preserves unknown macros as HTML comments', async () => {
    const input = `
      <ac:structured-macro ac:name="fancy-chart">
        <ac:parameter ac:name="type">pie</ac:parameter>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('<!-- Unsupported macro: fancy-chart -->');
  });

  it('preserves unknown ac: elements as HTML comments', async () => {
    const input = '<ac:task-list><ac:task><ac:task-body>Do thing</ac:task-body></ac:task></ac:task-list>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('<!-- Unsupported element:');
  });

  // --- TOC macro is skipped ---
  it('skips toc macro', async () => {
    const input = '<ac:structured-macro ac:name="toc"></ac:structured-macro><p>Content</p>';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).not.toContain('toc');
    expect(markdown).toContain('Content');
  });

  // --- Emoticons ---
  it('converts emoticons', async () => {
    const input = '<ac:emoticon ac:name="smile" />';
    const { markdown } = await convertConfluenceToMarkdown(input);
    expect(markdown).toContain('😊');
  });

  // --- Combined / realistic ---
  it('handles a realistic Confluence page', async () => {
    const input = `
      <h1>Project Overview</h1>
      <p>This is the <strong>Riffle</strong> project, a <em>Confluence sync</em> tool.</p>
      <ac:structured-macro ac:name="info">
        <ac:rich-text-body><p>Beta version</p></ac:rich-text-body>
      </ac:structured-macro>
      <h2>Features</h2>
      <ul>
        <li>Sync pages</li>
        <li>Convert formats</li>
      </ul>
      <ac:structured-macro ac:name="code">
        <ac:parameter ac:name="language">typescript</ac:parameter>
        <ac:plain-text-body><![CDATA[const riffle = new Riffle();]]></ac:plain-text-body>
      </ac:structured-macro>
    `;
    const { markdown } = await convertConfluenceToMarkdown(input, {
      title: 'Project Overview',
      confluenceId: '98765',
    });

    expect(markdown).toContain('title: "Project Overview"');
    expect(markdown).toContain('# Project Overview');
    expect(markdown).toContain('**Riffle**');
    expect(markdown).toContain('_Confluence sync_');
    expect(markdown).toContain('> **Info:**');
    expect(markdown).toContain('## Features');
    expect(markdown).toContain('- Sync pages');
    expect(markdown).toContain('```typescript');
  });
});
