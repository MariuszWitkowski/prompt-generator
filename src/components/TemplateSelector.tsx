import React from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Template } from '../lib/utils';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ templates: propTemplates, selectedTemplate, onSelect }: TemplateSelectorProps) {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [newTemplateContent, setNewTemplateContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [templates, setTemplates] = React.useState<Template[]>([]);

  // Load custom templates from localStorage and combine with prop templates
  React.useEffect(() => {
    const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
    setTemplates([...propTemplates, ...customTemplates]);
  }, [propTemplates]);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim()) {
      setError('Template name is required');
      return;
    }

    if (!newTemplateContent.trim()) {
      setError('Template content is required');
      return;
    }

    let content = newTemplateContent;

    // Check if the content is a GitHub Gist URL
    if (newTemplateContent.includes('gist.github.com') || newTemplateContent.includes('gist.githubusercontent.com')) {
      try {
        setIsLoading(true);
        setError('');
        
        // Extract the gist ID from the URL
        const gistIdMatch = newTemplateContent.match(/gist\.(?:github|githubusercontent)\.com\/(?:[^\/]+\/)?([a-f0-9]+)/i);
        if (!gistIdMatch) {
          throw new Error('Invalid Gist URL');
        }
        
        const gistId = gistIdMatch[1];
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Gist');
        }
        
        const gistData = await response.json();
        const fileNames = Object.keys(gistData.files);
        
        if (fileNames.length === 0) {
          throw new Error('No files found in Gist');
        }
        
        // Use the content of the first file
        content = gistData.files[fileNames[0]].content;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Gist');
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Create a new template
    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: newTemplateName,
      content: content
    };

    // Get existing custom templates
    const existingTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
    
    // Add the new template
    const updatedTemplates = [...existingTemplates, newTemplate];
    
    // Save to localStorage
    localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));
    
    // Update state
    setTemplates([...propTemplates, ...updatedTemplates]);
    
    // Reset form
    setNewTemplateName('');
    setNewTemplateContent('');
    setIsModalOpen(false);
    
    // Select the new template
    onSelect(newTemplate);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-2 flex items-center justify-center rounded-lg border border-gray-300 p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          title="Add new template"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 z-10">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {template.name}
            </button>
          ))}
        </div>
      )}

      {/* Modal for adding new template */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Template</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Content or Gist URL
                </label>
                <textarea
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 min-h-[150px]"
                  placeholder="Paste template content or GitHub Gist URL"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You can paste a GitHub Gist URL to automatically fetch the content
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTemplate}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Add Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}