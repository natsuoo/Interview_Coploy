import { css } from '@emotion/react';
import { colors, typography, radius } from '../tokens';

export const inputStyles = css`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${colors.border.light};
  border-radius: ${radius.md};
  background-color: ${colors.background.card};
  color: ${colors.text.primary};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.base};
  transition: all 0.2s ease;

  &:focus {
    border-color: ${colors.primary.main};
    outline: none;
  }

  &::placeholder {
    color: ${colors.text.secondary};
  }
`;