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
