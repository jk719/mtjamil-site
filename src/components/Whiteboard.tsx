"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Point = { x: number; y: number };
type Stroke = {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
};

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#171717");
  const [history, setHistory] = useState<Stroke[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      // Use logical (CSS) coordinates - ctx is already scaled by devicePixelRatio
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const drawStrokes = useCallback(
    (ctx: CanvasRenderingContext2D, strokesToDraw: Stroke[]) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      strokesToDraw.forEach((stroke) => {
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.isEraser ? "#ffffff" : stroke.color;
        ctx.lineWidth = stroke.isEraser ? stroke.width * 3 : stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
    },
    []
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const allStrokes = currentStroke
      ? [...strokes, currentStroke]
      : [...strokes];
    drawStrokes(ctx, allStrokes);
  }, [strokes, currentStroke, drawStrokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      drawStrokes(ctx, strokes);
    }
  }, [strokes, drawStrokes]);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const step = historyStep;
      return prev.slice(0, step + 1).concat([[...strokes]]);
    });
    setHistoryStep((prev) => prev + 1);
  }, [strokes, historyStep]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;

    const newStroke: Stroke = {
      points: [point],
      color: strokeColor,
      width: strokeWidth,
      isEraser: tool === "eraser",
    };
    setCurrentStroke(newStroke);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentStroke) return;
    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, point] } : null
    );
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentStroke) return;
    if (currentStroke.points.length > 1) {
      saveToHistory();
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (historyStep < 0) return;
    setStrokes(history[historyStep]);
    setHistoryStep((prev) => prev - 1);
  };

  const handleClear = () => {
    if (strokes.length === 0 && !currentStroke) return;
    saveToHistory();
    setStrokes([]);
    setCurrentStroke(null);
  };

  const canUndo = historyStep >= 0 || strokes.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tool === "pen"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Pen
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tool === "eraser"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Eraser
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border border-neutral-200 p-0.5"
            disabled={tool === "eraser"}
          />
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700"
          >
            <option value={1}>Thin</option>
            <option value={2}>Medium</option>
            <option value={4}>Thick</option>
          </select>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            Clear
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 rounded-b-lg border border-t-0 border-neutral-200 bg-neutral-100 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="block w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}
