import React from 'react';
import { recordingOverlayStyles } from '../../design/components/RecordingOverlay';

interface RecordingOverlayProps {
  isRecording: boolean;
  timeRemaining?: number | null;
  showWarning?: boolean;
}

const RecordingOverlay: React.FC<RecordingOverlayProps> = ({ 
  isRecording, 
  timeRemaining,
  showWarning = false
}) => {
  if (!isRecording) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div css={recordingOverlayStyles.container}>
      <div css={recordingOverlayStyles.indicator} className={showWarning ? 'warning' : ''}>
        <div css={recordingOverlayStyles.dot} />
        <div css={recordingOverlayStyles.text}>
          Gravando
          {timeRemaining !== null && (
            <span css={recordingOverlayStyles.timeRemaining}>
              {formatTime(timeRemaining || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingOverlay;