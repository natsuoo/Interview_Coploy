import React, { useEffect, useRef } from 'react';
import './AudioTestSpectrum.css';

interface AudioSpectrumProps {
  audioStream: MediaStream;
}

const AudioSpectrum: React.FC<AudioSpectrumProps> = ({ audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioStream || !containerRef.current) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    
    analyserRef.current = analyser;
    source.connect(analyser);
    
    // Reduzido para ter menos barras, mas mais largas
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const updateCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);
    
    const ctx = canvas.getContext('2d')!;
    
    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const CENTER = WIDTH / 2;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Limpa o canvas com fundo transparente
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      // Aumentado a largura das barras e o espaçamento
      const barWidth = 3;
      const spacing = 4;
      let barHeight;
      
      // Desenha da esquerda para o centro
      for (let i = 0; i < bufferLength / 2; i++) {
        barHeight = (dataArray[i] / 255) * (HEIGHT / 1.5); // Aumentado a altura máxima
        const y = (HEIGHT / 2) - (barHeight / 2);
        
        const x = CENTER - (i * (barWidth + spacing));
        
        // Rosa mais vibrante e menos transparente
        ctx.fillStyle = 'rgba(244, 114, 182, 0.8)';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      
      // Desenha do centro para a direita (espelhado)
      for (let i = 0; i < bufferLength / 2; i++) {
        barHeight = (dataArray[i] / 255) * (HEIGHT / 1.5);
        const y = (HEIGHT / 2) - (barHeight / 2);
        
        const x = CENTER + (i * (barWidth + spacing));
        
        ctx.fillStyle = 'rgba(244, 114, 182, 0.8)';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };
    
    draw();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      audioContext.close();
    };
  }, [audioStream]);

  return (
    <div className="audio-spectrum-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="audio-spectrum-canvas"
      />
    </div>
  );
};

export default AudioSpectrum;