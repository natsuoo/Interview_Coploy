import { css } from '@emotion/react';
import { colors, radius, shadows } from '../tokens';

export const cardStyles = css`
  background: ${colors.background.card};
  border-radius: ${radius.lg};
  border: 1px solid ${colors.border.light};
  box-shadow: ${shadows.md};
  overflow: hidden;
`;