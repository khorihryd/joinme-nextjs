import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  className?: string;
  fill?: boolean;
}

export function Icon({
  name,
  size = 20,
  className = '',
  fill = false,
  style,
  ...props
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        fontVariationSettings: fill
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        verticalAlign: 'middle',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  );
}
