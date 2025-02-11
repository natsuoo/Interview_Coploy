import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-hot-toast";
import { Play, Square } from "lucide-react";
import { InterviewSession } from "../../types/interview";
import AudioSpectrum from "./AudioSpectrum";
import CameraButton from "./CameraButton";
import MicrophoneButton from "./MicrophoneButton";
import RecordingOverlay from "./RecordingOverlay";
import { videoContainerStyles } from "../../design/components/VideoContainer";
import { Button } from "../common";
import axios from "axios";
import logo from "../../public/logo.png";

const VideoRecording: React.FC = () => {
  // ... estados e refs permanecem iguais ...

  return (
    <div className="video-recorder" ref={containerRef}>
      <img src={logo} alt="Logo" />
      <div className="top-text">
        {session?.pergunta_atual?.texto || 'Carregando pergunta...'}
      </div>
      <div css={videoContainerStyles.container}>
        <Webcam 
          ref={webcamRef} 
          audio={false} 
          css={videoContainerStyles.preview}
          videoConstraints={isMobile ? { facingMode: 'user' } : undefined}
        />
        <RecordingOverlay isRecording={isRecording} timeRemaining={timeRemaining} />
        
        <div css={videoContainerStyles.controls}>
          {!isMobile && (
            <div className="device-controls">
              <CameraButton
                selectedLabel={selectedCameraLabel}
                setSelectedLabel={setSelectedCameraLabel}
              />
              <MicrophoneButton
                enabled={isMicEnabled}
                setEnabled={setIsMicEnabled}
                selectedLabel={selectedMicLabel}
                setSelectedLabel={setSelectedMicLabel}
              />
            </div>
          )}
          
          {!isRecording && !isConverting && session && (
            <Button 
              variant="primary"
              size="lg"
              onClick={startRecording}
            >
              <Play size={18} />
              Iniciar
            </Button>
          )}
          
          {isRecording && !isConverting && (
            <Button 
              variant="secondary"
              size="lg"
              onClick={stopRecording}
            >
              <Square size={18} />
              Parar
            </Button>
          )}
        </div>
      </div>
      
      {!isMobile && isMicEnabled && streamRef.current && (
        <AudioSpectrum audioStream={streamRef.current} />
      )}
    </div>
  );
};

export default VideoRecording;