import React from 'react';
import './RecordingOverlay.css';

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
    <div className="recording-overlay">
      <div className={`recording-indicator ${showWarning ? 'warning' : ''}`}>
        <div className="recording-dot"></div>
        <span className="recording-text">
          Gravando
          {timeRemaining !== null && (
            <div className="time-remaining">
              {formatTime(timeRemaining || 0)}
            </div>
          )}
        </span>
      </div>
    </div>
  );
};

export default RecordingOverlay;