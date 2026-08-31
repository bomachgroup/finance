import { useState, type ChangeEvent, type FC } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatDisplayLabel } from '../../data/helpers';
import { Button } from './Button';
import { ModalDialog } from './ModalDialog';

export type CreateField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  fields: CreateField[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<{ error?: string } | void>;
};

export const CreateRecordModal: FC<Props> = ({ open, title, subtitle, fields, onClose, onSubmit }) => {
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    if (!submitting) {
      setValues({});
      onClose();
    }
  };

  const submit = async () => {
    const missing = fields.find((field) => field.required && !values[field.name]?.trim());
    if (missing) {
      showToast(`${missing.label} is required`, 'error');
      return;
    }
    setSubmitting(true);
    try {
      const result = await onSubmit(values);
      if (result?.error) {
        showToast(result.error, 'error');
        return;
      }
      showToast(`${title} created successfully`, 'success');
      setValues({});
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalDialog
      isOpen={open}
      onClose={close}
      title={title}
      subtitle={subtitle}
      footer={<><Button variant="outline" onClick={close} disabled={submitting}>Cancel</Button><Button loading={submitting} onClick={() => void submit()}>Create</Button></>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => {
          const common = {
            value: values[field.name] || '',
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((current) => ({ ...current, [field.name]: event.target.value })),
            required: field.required,
            placeholder: field.placeholder,
            className: 'mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy',
          };
          return (
            <label key={field.name} className={`text-xs font-semibold text-text ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
              {field.label}
              {field.type === 'textarea' ? <textarea {...common} className={`${common.className} h-20 py-2`} /> : field.type === 'select' ? <select {...common}><option value="">Select...</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{formatDisplayLabel(option.label)}</option>)}</select> : <input {...common} type={field.type || 'text'} />}
            </label>
          );
        })}
      </div>
    </ModalDialog>
  );
};
