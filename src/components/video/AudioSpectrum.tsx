import React, { useEffect, useRef } from 'react';
import { audioSpectrumStyles } from '../../design/components/AudioSpectrum';

interface AudioSpectrumProps {
  audioStream: MediaStream;
}

const AudioSpectrum: React.FC<AudioSpectrumProps> = ({ audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;
      
      const barWidth = (2 * Math.PI) / bufferLength;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (radius * 0.5);
        const angle = i * barWidth;
        
        const x1 = centerX + (radius * Math.cos(angle));
        const y1 = centerY + (radius * Math.sin(angle));
        const x2 = centerX + ((radius + barHeight) * Math.cos(angle));
        const y2 = centerY + ((radius + barHeight) * Math.sin(angle));
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      animationFrameId.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      audioContext.close();
    };
  }, [audioStream]);

  return (
    <div css={audioSpectrumStyles.container}>
      <div css={audioSpectrumStyles.wrapper}>
        <canvas 
          ref={canvasRef} 
          width={200} 
          height={200} 
          css={audioSpectrumStyles.canvas}
        />
      </div>
    </div>
  );
};

export default AudioSpectrum;