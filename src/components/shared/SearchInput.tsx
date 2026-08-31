import React from 'react';
import { AppIcon } from './AppIcon';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChangeValue,
  placeholder = 'Search...',
  className = '',
  ...rest
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <AppIcon
        name="ti-search"
        size={16}
        className="pointer-events-none absolute left-3 text-text-3"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-sm text-text placeholder-text-3 transition-colors focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChangeValue('')}
          className="absolute right-2.5 text-text-3 hover:text-text"
        >
          <AppIcon name="ti-close" size={14} />
        </button>
      )}
    </div>
  );
}
