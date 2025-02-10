import React, { useState, useRef, useEffect } from 'react';
import { FiCamera, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import './CameraButton.css';

interface CameraButtonProps {
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
}

const CameraButton: React.FC<CameraButtonProps> = ({ selectedLabel, setSelectedLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadCameras = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          if (err.name === 'NotReadableError') {
            toast.error('A câmera está sendo usada por outro aplicativo. Por favor, feche outros programas que possam estar usando a câmera.');
            return;
          }
          throw err;
        });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const availableCameras = devices.filter(device => device.kind === 'videoinput');
      
      if (availableCameras.length === 0) {
        toast.error('Nenhuma câmera encontrada');
        return;
      }

      setCameras(availableCameras);
      
      // Atualiza o label da primeira câmera disponível automaticamente
      if (selectedLabel === 'Câmera Padrão' && availableCameras.length > 0) {
        const defaultCamera = availableCameras[0];
        const cameraLabel = defaultCamera.label || `Câmera ${defaultCamera.deviceId.slice(0, 5)}`;
        setSelectedLabel(cameraLabel);
        
        // Tenta acessar a câmera padrão
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: defaultCamera.deviceId } }
          });
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error('Erro ao acessar câmera padrão:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao acessar dispositivos de câmera:', error);
      toast.error('Erro ao acessar câmera. Verifique as permissões do navegador.');
    }
  };

  useEffect(() => {
    loadCameras();
    
    const handleDeviceChange = async () => {
      await loadCameras();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCameraSelect = async (camera: MediaDeviceInfo) => {
    try {
      // Tenta acessar a câmera selecionada
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: camera.deviceId }
        }
      });
      
      stream.getTracks().forEach(track => track.stop());
      setSelectedLabel(camera.label || `Câmera ${camera.deviceId.slice(0, 5)}`);
      setIsOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotReadableError') {
          toast.error('Esta câmera está sendo usada por outro aplicativo');
          
          // Tenta encontrar outra câmera disponível
          const availableCameras = cameras.filter(c => c.deviceId !== camera.deviceId);
          if (availableCameras.length > 0) {
            toast.loading('Tentando usar outra câmera disponível...');
            
            // Tenta cada câmera disponível até encontrar uma que funcione
            for (const alternativeCamera of availableCameras) {
              try {
                const altStream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    deviceId: { exact: alternativeCamera.deviceId }
                  }
                });
                
                altStream.getTracks().forEach(track => track.stop());
                setSelectedLabel(alternativeCamera.label || `Câmera ${alternativeCamera.deviceId.slice(0, 5)}`);
                toast.dismiss();
                toast.success('Câmera alternativa selecionada com sucesso');
                setIsOpen(false);
                return;
              } catch (altError) {
                continue; // Continua tentando com a próxima câmera
              }
            }
            
            toast.error('Nenhuma câmera alternativa disponível');
          }
        } else if (error.name === 'NotAllowedError') {
          toast.error('Permissão para usar a câmera foi negada');
        } else {
          toast.error('Não foi possível acessar esta câmera');
        }
      }
      console.error('Erro ao selecionar câmera:', error);
    }
  };

  return (
    <div className="camera-button-container" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}   
        className={`camera-button ${isOpen ? 'active' : ''}`}
      >
        <div className="button-content">
          <FiCamera size={20} />
          <span>{selectedLabel}</span>
          <FiChevronDown 
            size={16} 
            className={`dropdown-icon ${isOpen ? 'open' : ''}`}
          />
        </div>
      </button>

      {isOpen && cameras.length > 0 && (
        <div className="camera-list">
          {cameras.map((camera) => (
            <button
              key={camera.deviceId}
              onClick={() => handleCameraSelect(camera)}
              className="camera-option"
            >
              {camera.label || `Câmera ${camera.deviceId.slice(0, 5)}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CameraButton;