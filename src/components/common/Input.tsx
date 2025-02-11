import React from 'react';
import { css } from '@emotion/react';
import { inputStyles } from '../../design/components/Input';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div>
      {label && (
        <label
          css={css`
            display: block;
            margin-bottom: 0.5rem;
            color: ${error ? '#ff4b4b' : '#000000'};
          `}
        >
          {label}
        </label>
      )}
      <input css={inputStyles} {...props} />
      {error && (
        <span
          css={css`
            color: #ff4b4b;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
          `}
        >
          {error}
        </span>
      )}
    </div>
  );
};