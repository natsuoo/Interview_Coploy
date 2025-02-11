import { css } from '@emotion/react';
import { colors, radius, shadows } from '../tokens';

export const audioSpectrumStyles = {
  container: css`
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background-color: transparent;
    z-index: 10;
    border-radius: ${radius.xl};
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  `,

  wrapper: css`
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(
        circle at center,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.1) 50%,
        transparent 70%
      );
      pointer-events: none;
    }
  `,

  canvas: css`
    width: 100%;
    height: 100%;
  `
};