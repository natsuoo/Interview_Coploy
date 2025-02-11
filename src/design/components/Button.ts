import { css } from '@emotion/react';
import { colors, typography, radius, shadows } from '../tokens';

export const buttonStyles = {
  base: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: ${typography.fontFamily.primary};
    font-weight: ${typography.fontWeight.medium};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  `,
  
  variants: {
    primary: css`
      background: ${colors.primary.main};
      color: ${colors.primary.text};
      
      &:hover {
        background: ${colors.primary.hover};
        color: ${colors.text.light};
        transform: translateY(-1px);
        box-shadow: ${shadows.md};
      }
    `,
    
    secondary: css`
      background: ${colors.secondary.main};
      color: ${colors.secondary.text};
      
      &:hover {
        background: ${colors.secondary.hover};
        transform: translateY(-1px);
        box-shadow: ${shadows.md};
      }
    `,
  },
  
  sizes: {
    sm: css`
      padding: 0.5rem 1rem;
      font-size: ${typography.fontSize.sm};
      border-radius: ${radius.md};
    `,
    
    md: css`
      padding: 0.75rem 1.5rem;
      font-size: ${typography.fontSize.base};
      border-radius: ${radius.md};
    `,
    
    lg: css`
      padding: 1rem 2rem;
      font-size: ${typography.fontSize.lg};
      border-radius: ${radius.md};
    `,
  },
};