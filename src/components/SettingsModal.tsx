import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Template } from '../lib/types';

interface SettingsModalProps {
  onClose: () => void;
  templates: Template[];
  onDeleteTemplate: (id: string) => void;
}

export function SettingsModal({ onClose, templates, onDeleteTemplate }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Custom Templates</h3>
            {templates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No custom templates yet.</p>
            ) : (
              <ul className="space-y-2">
                {templates.map((template) => (
                  <li key={template.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="text-gray-800 dark:text-gray-200">{template.name}</span>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Prompt Generator v1.0.0
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              A tool for creating and managing prompt templates for AI assistants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}