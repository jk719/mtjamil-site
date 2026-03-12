"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 18,
  height: 18,
  style: { flexShrink: 0 },
};

const PencilIcon = ({ className = "" }: { className?: string }) => (
  <svg {...svgProps} className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const EraserIcon = ({ className = "" }: { className?: string }) => (
  <svg {...svgProps} className={className}>
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  </svg>
);

const UndoIcon = () => (
  <svg {...svgProps}>
    <path d="M3 10h10a5 5 0 0 1 5 5v2" />
    <path d="M3 10 8 5" />
    <path d="M3 10v5" />
  </svg>
);

const TrashIcon = () => (
  <svg {...svgProps}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

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
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

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
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (!isDrawing || !currentStroke) return;
    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, point] } : null
    );
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerLeave = () => {
    setCursorPos(null);
    handlePointerUp();
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
            className={`group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
              tool === "pen"
                ? "bg-neutral-900 text-white shadow-md"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <PencilIcon
              className={`transition-transform duration-200 group-hover:rotate-[-12deg] ${
                tool === "pen" ? "rotate-[-8deg]" : ""
              }`}
            />
            Pen
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
              tool === "eraser"
                ? "bg-neutral-900 text-white shadow-md"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <EraserIcon
              className={`transition-transform duration-200 group-hover:translate-x-1 ${
                tool === "eraser" ? "translate-x-0.5" : ""
              }`}
            />
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
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:scale-105 hover:bg-neutral-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <UndoIcon />
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:scale-105 hover:bg-neutral-100 active:scale-95"
          >
            <TrashIcon />
            Clear
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 rounded-b-lg border border-t-0 border-neutral-200 bg-neutral-100 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerEnter={handlePointerEnter}
          className="block w-full h-full touch-none"
          style={{
            touchAction: "none",
            cursor: cursorPos ? "none" : "crosshair",
          }}
        />
        {/* Floating pen/eraser cursor - only over canvas */}
        {cursorPos && (
          <div
            className="pointer-events-none fixed z-[100] transition-transform duration-75"
            style={
              tool === "pen"
                ? {
                    left: cursorPos.x - 2.5,
                    top: cursorPos.y - 26,
                    transform: "rotate(-20deg)",
                    transformOrigin: "2.5px 26px",
                  }
                : {
                    left: cursorPos.x,
                    top: cursorPos.y,
                    transform: "translate(-50%, -50%) translate(4px, 0)",
                  }
            }
          >
            {tool === "pen" ? (
              <svg
                {...svgProps}
                width={28}
                height={28}
                className="block text-neutral-800"
                style={{ flexShrink: 0 }}
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            ) : (
              <svg
                {...svgProps}
                width={28}
                height={28}
                className="block text-neutral-600"
                style={{ flexShrink: 0 }}
              >
                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                <path d="M22 21H7" />
                <path d="m5 11 9 9" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
