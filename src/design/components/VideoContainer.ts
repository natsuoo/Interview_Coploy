import { css } from '@emotion/react';
import { colors, radius, shadows } from '../tokens';

export const videoContainerStyles = {
  container: css`
    position: relative;
    width: 100%;
    max-width: 1600px;
    aspect-ratio: 16/9;
    border-radius: ${radius.xl};
    overflow: hidden;
    background: ${colors.background.dark};
    box-shadow: ${shadows.lg};
  `,

  preview: css`
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    top: 0;
    left: 0;
  `,

  controls: css`
    position: absolute;
    bottom: 24px;
    left: 24px;
    right: 24px;
    width: calc(100% - 48px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
  `
};