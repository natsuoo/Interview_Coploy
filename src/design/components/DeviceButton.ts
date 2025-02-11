import { css } from '@emotion/react';
import { colors, typography, radius } from '../tokens';

export const deviceButtonStyles = {
  button: css`
    background: transparent;
    backdrop-filter: blur(8px);
    border: 1px solid ${colors.border.light};
    border-radius: ${radius.full};
    padding: 8px 16px;
    cursor: pointer;
    width: 250px;
    transition: all 0.2s ease;
    font-family: ${typography.fontFamily.primary};

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: ${colors.primary.main};
    }
  `,

  content: css`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${colors.text.light};
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.light};
  `
};