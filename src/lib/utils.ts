import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export type FieldType = 'text' | 'number' | 'text array';

export interface Field {
  type: FieldType;
  label: string;
  id: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
}

function parseMarkdownTemplate(content: string, filename: string): Template {
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

const templateFiles = {
  'default.md': '/templates/default.md',
  'code-review.md': '/templates/code-review.md',
  'bug-report.md': '/templates/bug-report.md',
};

export async function loadTemplates(): Promise<Template[]> {
  const templates: Template[] = [];
  
  try {
    // Load each template file from the public directory
    for (const [filename, path] of Object.entries(templateFiles)) {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${filename}`);
      }
      const content = await response.text();
      templates.push(parseMarkdownTemplate(content, filename));
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    // Fallback to default template if loading fails
    templates.push({
      id: 'default',
      name: 'Default Template',
      content: `As a {{role}} create {{task}} using {{technologies}}.
Prepare {{field "number" "How many tests?"}} test cases.
Examples:
{{field "text array" "Examples"}}`
    });
  }

  return templates;
}