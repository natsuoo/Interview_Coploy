import { css } from '@emotion/react';
import { colors, typography, radius, animations } from '../tokens';

export const recordingOverlayStyles = {
  container: css`
    position: absolute;
    top: 24px;
    left: 108px;
    z-index: 100;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      top: 45px;
      left: 80px;
    }
  `,

  indicator: css`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(0, 0, 0, 0.349);
    padding: 8px 14px;
    border-radius: ${radius.md};
    transition: all 0.3s ease;

    &.warning {
      background-color: rgba(255, 0, 0, 0.2);
      animation: warning 1s ease-in-out infinite;
    }

    ${animations.warning}
  `,

  dot: css`
    width: 8px;
    height: 8px;
    background-color: ${colors.status.error};
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;

    ${animations.pulse}
  `,

  text: css`
    color: ${colors.text.light};
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.regular};
    font-family: ${typography.fontFamily.primary};
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 768px) {
      font-size: ${typography.fontSize.xs};
    }
  `,

  timeRemaining: css`
    font-family: ${typography.fontFamily.primary};
    color: ${colors.text.light};
    opacity: 0.8;
  `
};