import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';

interface TactileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  leading?: ReactNode;
  trailing?: ReactNode;
  mono?: boolean;
  accent?: 'teal' | 'default';
  maskWhenBlurred?: boolean;
  containerClassName?: string;
}

export const TactileInput = forwardRef<HTMLInputElement, TactileInputProps>(
  function TactileInput(
    {
      leading,
      trailing,
      mono = false,
      accent = 'default',
      maskWhenBlurred = false,
      containerClassName = '',
      className = '',
      type = 'text',
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const effectiveType = maskWhenBlurred && !focused ? 'password' : type;

    return (
      <div
        className={`group flex h-11 items-center gap-2 rounded-xl border border-zinc-200/90 bg-zinc-100/75 px-3.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all focus-within:border-teal-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-teal-500/15 hover:border-zinc-300 dark:border-zinc-700/90 dark:bg-zinc-950/90 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] dark:focus-within:border-teal-400 dark:focus-within:bg-zinc-950 dark:focus-within:ring-teal-400/15 dark:hover:border-zinc-600 ${containerClassName}`}
      >
        {leading && (
          <span className="shrink-0 text-zinc-400 transition-colors group-focus-within:text-teal-500 dark:text-zinc-500">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          type={effectiveType}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          className={`w-full min-w-0 border-0 bg-transparent p-0 text-base outline-none placeholder:font-sans placeholder:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
            mono ? 'font-mono font-semibold tracking-tight' : 'font-sans'
          } ${
            accent === 'teal'
              ? 'text-teal-800 dark:text-teal-300'
              : 'text-zinc-900 dark:text-zinc-100'
          } ${className}`}
        />
        {trailing && <span className="shrink-0">{trailing}</span>}
      </div>
    );
  },
);
