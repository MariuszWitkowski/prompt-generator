import { Template } from './types';
import { parseMarkdownTemplate } from './templateParser';

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
