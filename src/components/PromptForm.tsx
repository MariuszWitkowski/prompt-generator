import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Field, Template } from '../lib/utils';
import { Plus, Minus, Copy } from 'lucide-react';

interface PromptFormProps {
  template: Template;
  fields: Field[];
  onGenerate: (values: any) => void;
}

export function PromptForm({ template, fields, onGenerate }: PromptFormProps) {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: JSON.parse(localStorage.getItem(`form-${template.id}`) || '{}')
  });

  const formValues = watch();

  React.useEffect(() => {
    localStorage.setItem(`form-${template.id}`, JSON.stringify(formValues));
  }, [formValues, template.id]);

  const onSubmit = (data: any) => {
    onGenerate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </label>
          {field.type === 'text array' ? (
            <ArrayField field={field} control={control} register={register} />
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              {...register(field.id)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Generate Prompt
      </button>
    </form>
  );
}

function ArrayField({ field, control, register }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.id,
  });

  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-2">
          <input
            {...register(`${field.id}.${index}`)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append('')}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}