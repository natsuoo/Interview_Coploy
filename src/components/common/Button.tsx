import React from 'react';
import { css } from '@emotion/react';
import { buttonStyles } from '../../design/components/Button';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <button
      css={[
        buttonStyles.base,
        buttonStyles.variants[variant],
        buttonStyles.sizes[size]
      ]}
      {...props}
    >
      {children}
    </button>
  );
};