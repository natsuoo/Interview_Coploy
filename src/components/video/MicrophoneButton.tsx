import React, { useState, useRef, useEffect } from 'react';
import { FiMic, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import './MicrophoneButton.css';

interface MicrophoneButtonProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ setEnabled, selectedLabel, setSelectedLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadMicrophones = async () => {
    try {
      // Primeiro tenta obter as permissões
      let hasPermission = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        hasPermission = true;
        setEnabled(true);
      } catch (permissionError) {
        if (permissionError instanceof Error) {
          if (permissionError.name === 'NotAllowedError') {
            toast.error('Por favor, permita o acesso ao microfone para continuar');
            setEnabled(false);
            return;
          } else if (permissionError.name === 'NotFoundError') {
            toast.error('Nenhum microfone encontrado no dispositivo');
            setEnabled(false);
            return;
          }
        }
        throw permissionError;
      }

      // Se tiver permissão, enumera os dispositivos
      if (hasPermission) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphoneDevices = devices.filter(device => device.kind === 'audioinput');
        
        if (microphoneDevices.length === 0) {
          toast.error('Nenhum microfone encontrado');
          setEnabled(false);
          return;
        }

        setMicrophones(microphoneDevices);

        // Seleciona o primeiro microfone disponível
        const defaultMic = microphoneDevices[0];
        if (defaultMic) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: { deviceId: { exact: defaultMic.deviceId } }
            });
            stream.getTracks().forEach(track => track.stop());
            
            setEnabled(true);
            setSelectedLabel(defaultMic.label || `Microfone ${defaultMic.deviceId.slice(0, 5)}`);
          } catch (error) {
            if (error instanceof Error) {
              if (error.name === 'NotReadableError') {
                toast.error('O microfone está sendo usado por outro aplicativo');
                // Tenta o próximo microfone disponível
                for (const mic of microphoneDevices.slice(1)) {
                  try {
                    const altStream = await navigator.mediaDevices.getUserMedia({
                      audio: { deviceId: { exact: mic.deviceId } }
                    });
                    altStream.getTracks().forEach(track => track.stop());
                    setEnabled(true);
                    setSelectedLabel(mic.label || `Microfone ${mic.deviceId.slice(0, 5)}`);
                    break;
                  } catch (altError) {
                    continue;
                  }
                }
              }
            }
            console.error('Erro ao acessar microfone padrão:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao acessar dispositivos de áudio:', error);
      toast.error('Erro ao acessar microfone. Verifique as permissões do navegador.');
      setEnabled(false);
    }
  };

  const handleMicrophoneSelect = async (microphone: MediaDeviceInfo) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: microphone.deviceId }
        }
      });
      
      stream.getTracks().forEach(track => track.stop());
      setEnabled(true);
      setSelectedLabel(microphone.label || `Microfone ${microphone.deviceId.slice(0, 5)}`);
      setIsOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotReadableError') {
          toast.error('Este microfone está sendo usado por outro aplicativo');
          
          // Tenta encontrar outro microfone disponível
          const availableMicrophones = microphones.filter(m => m.deviceId !== microphone.deviceId);
          if (availableMicrophones.length > 0) {
            toast.loading('Tentando usar outro microfone disponível...');
            
            for (const alternativeMic of availableMicrophones) {
              try {
                const altStream = await navigator.mediaDevices.getUserMedia({
                  audio: {
                    deviceId: { exact: alternativeMic.deviceId }
                  }
                });
                
                altStream.getTracks().forEach(track => track.stop());
                setEnabled(true);
                setSelectedLabel(alternativeMic.label || `Microfone ${alternativeMic.deviceId.slice(0, 5)}`);
                toast.dismiss();
                toast.success('Microfone alternativo selecionado com sucesso');
                setIsOpen(false);
                return;
              } catch (altError) {
                continue;
              }
            }
            
            toast.error('Nenhum microfone alternativo disponível');
          }
        } else if (error.name === 'NotAllowedError') {
          toast.error('Permissão para usar o microfone foi negada');
        } else {
          toast.error('Não foi possível acessar este microfone');
        }
      }
      console.error('Erro ao selecionar microfone:', error);
    }
  };

  useEffect(() => {
    loadMicrophones();
    
    const handleDeviceChange = async () => {
      await loadMicrophones();
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

  return (
    <div className="microphone-button-container" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}   
        className={`microphone-button ${isOpen ? 'active' : ''}`}
      >
        <div className="button-content">
          <FiMic size={20} />
          <span>{selectedLabel}</span>
          <FiChevronDown 
            size={16} 
            className={`dropdown-icon ${isOpen ? 'open' : ''}`}
          />
        </div>
      </button>

      {isOpen && microphones.length > 0 && (
        <div className="microphone-list">
          {microphones.map((microphone) => (
            <button
              key={microphone.deviceId}
              onClick={() => handleMicrophoneSelect(microphone)}
              className="microphone-option"
            >
              {microphone.label || `Microfone ${microphone.deviceId.slice(0, 5)}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MicrophoneButton;