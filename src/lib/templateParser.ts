import { FieldType, Field, Template } from './types';

export function parseTemplate(template: string): { fields: Field[] } {
  const fieldRegex = /{{([^{}]+)}}/g;
  const specialFieldRegex = /{{field\s+"([^"]+)"\s+"([^"]+)"}}/g;
  const fields: Field[] = [];
  let match;

  // First, process special fields (field helper)
  while ((match = specialFieldRegex.exec(template)) !== null) {
    fields.push({
      type: match[1] as FieldType,
      label: match[2],
      id: match[2].toLowerCase().replace(/\s+/g, '-'),
    });
  }

  // Then, process regular fields
  let tempTemplate = template.replace(specialFieldRegex, ''); // Remove already processed fields
  while ((match = fieldRegex.exec(tempTemplate)) !== null) {
    const fieldName = match[1].trim();
    if (!fields.some(f => f.id === fieldName) && !fieldName.startsWith('field ')) {
      fields.push({
        type: 'text',
        label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        id: fieldName,
      });
    }
  }

  return { fields };
}

export function parseMarkdownTemplate(content: string, filename: string): Template {
  const [frontmatter, ...contentParts] = content.split('---\n').filter(Boolean);
  const nameMatch = frontmatter.match(/name:\s*(.+)/);

  if (!nameMatch) {
    throw new Error(`Invalid frontmatter in template: ${filename}`);
  }

  return {
    id: filename.replace('.md', ''),
    name: nameMatch[1].trim(),
    content: contentParts.join('---\n').trim(),
  };
}
