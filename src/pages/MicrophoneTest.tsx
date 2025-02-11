import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, Play } from 'lucide-react';
import '../styles/MicrophoneTest.css';
import AudioTestSpectrum from '../components/video/AudioTestSpectrum';
import logo from '../public/logo.png';

const MicrophoneTest: React.FC = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined
        } 
      });
      setAudioStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const initializeMicrophones = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        setMicrophones(audioDevices);
        setHasMicrophoneAccess(audioDevices.length > 0);
        
        if (audioDevices.length > 0) {
          setSelectedMicrophone(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Erro ao carregar microfones:', error);
        setHasMicrophoneAccess(false);
      }
    };

    initializeMicrophones();
  }, []);

  const handleContinue = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    navigate(`/teste-camera/${entrevistaId}`);
  };

  return (
    <div className="microphone-test-container">
      <img src={logo} alt="Logo" className="logo" />

      <div className="test-content">
        <h1 className="welcome-title">Configuração do Microfone</h1>
        
        <p className="test-instruction">
          Vamos verificar se seu microfone está funcionando corretamente
        </p>

        <div className="test-area">
          <div className="audio-visualizer">
            {audioStream && (
              <AudioTestSpectrum audioStream={audioStream} />
            )}
          </div>

          <div className="controls-section">
            <h2 className="test-subtitle">Teste seu Microfone</h2>
            
            <p className="verification-text">
              Grave uma amostra de áudio e reproduza para verificar a qualidade
            </p>

            <div className="microphone-selector">
              <label>Selecione seu microfone:</label>
              <select 
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
              >
                {microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microfone ${microphones.indexOf(mic) + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="button-group">
              <button 
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic size={18} />
                {isRecording ? 'Parar' : 'Gravar'}
              </button>

              {audioUrl && (
                <button 
                  className="play-button"
                  onClick={() => {
                    const audio = new Audio(audioUrl);
                    audio.play();
                  }}
                >
                  <Play size={18} />
                  Reproduzir
                </button>
              )}
            </div>
          </div>
        </div>

        {audioUrl && hasMicrophoneAccess && (
          <div className="continue-section">
            <button 
              className="continue-button"
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicrophoneTest;