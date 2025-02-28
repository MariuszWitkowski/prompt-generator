import React from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { TemplateSelector } from './components/TemplateSelector';
import { PromptForm } from './components/PromptForm';
import { parseTemplate, loadTemplates, type Template } from './lib/utils';
import Handlebars from 'handlebars';
import { Copy, Check, Settings } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    loadTemplates().then(loadedTemplates => {
      setTemplates(loadedTemplates);
      const savedId = localStorage.getItem('selectedTemplateId');
      const initialTemplate = loadedTemplates.find(t => t.id === savedId) || loadedTemplates[0];
      setSelectedTemplate(initialTemplate);
    });
  }, []);

  React.useEffect(() => {
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplateId', selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setGeneratedPrompt('');
  };

  const handleGenerate = (values: any) => {
    if (!selectedTemplate) return;

    // Register the field helper
    Handlebars.registerHelper('field', function(type: string, label: string) {
      const id = label.toLowerCase().replace(/\s+/g, '-');
      if (type === 'text array' && Array.isArray(values[id])) {
        return values[id].join('\n');
      }
      return values[id] || '';
    });

    try {
      const template = Handlebars.compile(selectedTemplate.content);
      const result = template(values);
      setGeneratedPrompt(result);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setGeneratedPrompt('Error generating prompt. Please check the template and values.');
    } finally {
      // Unregister the helper to prevent memory leaks
      Handlebars.unregisterHelper('field');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // Get existing custom templates
    const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
    
    // Filter out the template to delete
    const updatedTemplates = customTemplates.filter((t: Template) => t.id !== templateId);
    
    // Save back to localStorage
    localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));
    
    // Update the templates state
    loadTemplates().then(loadedTemplates => {
      setTemplates(loadedTemplates);
      
      // If the deleted template was selected, select the first available template
      if (selectedTemplate && selectedTemplate.id === templateId) {
        const newSelectedTemplate = loadedTemplates[0];
        setSelectedTemplate(newSelectedTemplate);
        localStorage.setItem('selectedTemplateId', newSelectedTemplate.id);
      }
    });
  };

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading templates...</p>
        </div>
      </div>
    );
  }

  const { fields } = parseTemplate(selectedTemplate.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Generator</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="mb-8">
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <PromptForm
              template={selectedTemplate}
              fields={fields}
              onGenerate={handleGenerate}
            />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Prompt</h2>
              {generatedPrompt && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <pre className="min-h-[200px] rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-700">
              {generatedPrompt || selectedTemplate.content}
            </pre>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          templates={templates.filter(t => t.id.startsWith('custom-'))}
          onDeleteTemplate={handleDeleteTemplate}
        />
      )}
    </div>
  );
}

export default App;