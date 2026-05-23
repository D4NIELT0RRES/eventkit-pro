import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
  label?: string;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function SignaturePad({
  onSave,
  onClear,
  label = 'Assinatura Digital',
  disabled = false,
  width = 500,
  height = 200,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '2px dashed #e2ded4';
    canvas.style.borderRadius = '6px';
    canvas.style.backgroundColor = '#fff';
    canvas.style.cursor = disabled ? 'not-allowed' : 'crosshair';
    canvas.style.touchAction = 'none';

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 2;
      context.strokeStyle = '#1c1b18';
      contextRef.current = context;
    }
  }, [width, height, disabled]);

  // Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  // Touch events (for mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    contextRef.current?.lineTo(x, y);
    contextRef.current?.stroke();
    setHasSignature(true);
  };

  const handleTouchEnd = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onClear?.();
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signatureData = canvas.toDataURL('image/png');
      onSave(signatureData);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{label}</div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-full"
      />

      <div className="flex gap-2 justify-end text-xs text-muted-foreground">
        {!hasSignature && 'Assine acima'}
        {hasSignature && '✓ Assinatura capturada'}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={!hasSignature || disabled}
          className="flex-1"
        >
          <Trash2 className="h-3 w-3 mr-2" />
          Limpar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!hasSignature || disabled}
          className="flex-1"
        >
          Confirmar Assinatura
        </Button>
      </div>
    </div>
  );
}
