import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import '../styles/CameraTest.css';
import logo from '../public/logo.png';
import toast from 'react-hot-toast';

const CameraTest: React.FC = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraWorking, setIsCameraWorking] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  useEffect(() => {
    const initializeCameras = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        setHasCameraAccess(videoDevices.length > 0);
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Erro ao carregar câmeras:', error);
        setHasCameraAccess(false);
      }
    };

    initializeCameras();
  }, []);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16/9
        }
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setIsCameraWorking(true);
      }
    } catch (error) {
      console.error('Erro ao iniciar câmera:', error);
      setIsCameraWorking(false);
      
      if (error instanceof DOMException && error.name === 'NotReadableError') {
        toast.error('Câmera em uso por outro aplicativo. Por favor, feche outros programas que possam estar usando a câmera.');
      } else {
        toast.error('Não foi possível iniciar a câmera. Verifique as permissões.');
      }
    }
  };

  useEffect(() => {
    if (selectedCamera) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera]);

  const handleContinue = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    sessionStorage.setItem('cameraTestPassed', 'true');
    navigate(`/video/${entrevistaId}`);
  };

  return (
    <div className="camera-test-container">
      <img src={logo} alt="Logo" className="logo" />

      <div className="test-content">
        <h1 className="welcome-title">Configuração da Câmera</h1>
        
        <p className="test-instruction">
          Vamos garantir que sua câmera esteja funcionando perfeitamente
        </p>

        <div className="test-area">
          <div className="camera-preview">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
          </div>

          <div className="controls-section">
            <h2 className="test-subtitle">Ajustes da Câmera</h2>
            
            <p className="verification-text">
              Certifique-se de que você está:
            </p>

            <ul className="camera-checklist">
              <li>Bem iluminado e claramente visível</li>
              <li>Centralizado no quadro</li>
              <li>Com o rosto totalmente visível</li>
              <li>Em um ambiente silencioso</li>
            </ul>

            <div className="camera-selector">
              <label>Selecione sua câmera:</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Câmera ${cameras.indexOf(camera) + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="refresh-button"
              onClick={startCamera}
            >
              <RefreshCw size={18} />
              Reiniciar Câmera
            </button>
          </div>
        </div>

        {isCameraWorking && hasCameraAccess && (
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

export default CameraTest;