// frontend/src/components/ui/Select.jsx
import React from 'react';

function extractSelectParts(children) {
  const result = {
    placeholder: undefined,
    options: [],
    triggerClassName: undefined,
  };

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const { type, props } = child;

    if (type === SelectTrigger) {
      if (props?.className) {
        result.triggerClassName = props.className;
      }
      const nested = extractSelectParts(props.children);
      if (nested.placeholder) result.placeholder = nested.placeholder;
      result.options.push(...nested.options);
      if (nested.triggerClassName && !result.triggerClassName) {
        result.triggerClassName = nested.triggerClassName;
      }
      return;
    }

    if (type === SelectContent || type === React.Fragment) {
      const nested = extractSelectParts(props.children);
      if (nested.placeholder) result.placeholder = nested.placeholder;
      result.options.push(...nested.options);
      if (nested.triggerClassName && !result.triggerClassName) {
        result.triggerClassName = nested.triggerClassName;
      }
      return;
    }

    if (type === SelectValue) {
      result.placeholder = props.placeholder;
      return;
    }

    if (type === SelectItem) {
      const optionKey = child.key ?? props.value ?? result.options.length;
      result.options.push(
        <option key={optionKey} value={props.value}>
          {props.children}
        </option>
      );
      return;
    }

    if (type === 'option') {
      const optionKey = child.key ?? props?.value ?? result.options.length;
      result.options.push(
        React.cloneElement(child, { key: optionKey })
      );
    }
  });

  return result;
}

// Basic Select component
export function Select({ children, value, onValueChange }) {
  const normalizedValue = value ?? "";
  const { placeholder, options, triggerClassName } = extractSelectParts(children);

  return (
    <select
      className={`block h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-sm transition-all hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ${triggerClassName ?? ""}`}
      value={normalizedValue}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
    >
      {placeholder ? (
        <option value="" disabled={normalizedValue !== ""} hidden={normalizedValue !== ""}>
          {placeholder}
        </option>
      ) : null}
      {options}
    </select>
  );
}

export function SelectTrigger() {
  return null;
}

export function SelectValue() {
  return null;
}

export function SelectContent() {
  return null;
}

// SelectItem (for individual options)
export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
