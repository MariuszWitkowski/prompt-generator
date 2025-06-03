import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Field } from '../lib/types'; // Corrected path
import { Minus, Plus } from 'lucide-react';

interface ArrayFieldProps {
  field: Field;
  control: Control<any>; // Can be more specific if the form type is known
  register: UseFormRegister<any>; // Can be more specific
}

export function ArrayField({ field, control, register }: ArrayFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.id,
  });

  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-2">
          <input
            {...register(`${field.id}.${index}` as const)}
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
        onClick={() => append({ value: '' })} // react-hook-form typically expects an object for append
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}
