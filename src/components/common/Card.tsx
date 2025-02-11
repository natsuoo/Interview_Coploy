import React from 'react';
import { css } from '@emotion/react';
import { cardStyles } from '../../design/components/Card';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div css={cardStyles} className={className}>
      {children}
    </div>
  );
};