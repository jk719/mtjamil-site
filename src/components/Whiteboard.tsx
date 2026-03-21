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
    <path d="M3 7v6h6" />
    <path d="M3 13a9 9 0 0 1 15.36-6.36" />
  </svg>
);

const RedoIcon = () => (
  <svg {...svgProps}>
    <path d="M21 7v6h-6" />
    <path d="M21 13a9 9 0 0 0-15.36-6.36" />
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
  const pointsRef = useRef<Point[]>([]); // Use ref for performance during drawing
  const strokesRef = useRef<Stroke[]>([]); // Ref for resize handler to avoid recreating observer
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  // Default stroke color matches --foreground CSS variable
  const [strokeColor, setStrokeColor] = useState("#171717");
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
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
      const canvas = ctx.canvas;
      // Use logical dimensions (CSS pixels), not physical pixels
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // Clear to transparent
      ctx.clearRect(0, 0, width, height);

      // Draw all strokes on transparent background
      strokesToDraw.forEach((stroke) => {
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.isEraser) {
          // Use destination-out to truly erase pixels
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
          ctx.lineWidth = stroke.width * 5;
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width;
        }

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });

      // Draw white background BEHIND all content
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
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

  // Keep strokesRef in sync with strokes state
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Resize handler uses ref to avoid recreating observer on every stroke change
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
      drawStrokes(ctx, strokesRef.current);
    }
  }, [drawStrokes]);

  // ResizeObserver only created once on mount
  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const saveToHistory = useCallback((newStrokes: Stroke[]) => {
    // Use functional updates to avoid stale closure issues
    setHistoryIndex((currentIndex) => {
      setHistory((prev) => {
        // Truncate any future history and add new state
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newStrokes);
        return newHistory;
      });
      return currentIndex + 1;
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer to track even when leaving canvas
    canvas.setPointerCapture(e.pointerId);

    const point = getCanvasPoint(e);
    if (!point) return;

    pointsRef.current = [point];
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
    const point = getCanvasPoint(e);

    // Update cursor position when over canvas or when drawing (pointer captured)
    if (point) {
      setCursorPos({ x: e.clientX, y: e.clientY });
    }

    if (!isDrawing || !currentStroke || !point) return;

    // Use ref for performance - avoid spreading array on every move
    pointsRef.current.push(point);

    // Update state to trigger redraw - use ref directly to avoid stale closure
    setCurrentStroke({
      ...currentStroke,
      points: pointsRef.current,
    });
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerLeave = () => {
    setCursorPos(null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (!isDrawing || !currentStroke) return;

    const finalPoints = pointsRef.current;
    if (finalPoints.length >= 1) {
      const finalStroke = { ...currentStroke, points: finalPoints };
      const newStrokes = [...strokes, finalStroke];
      setStrokes(newStrokes);
      saveToHistory(newStrokes);
    }

    pointsRef.current = [];
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setStrokes(history[newIndex]);
  }, [historyIndex, history]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setStrokes(history[newIndex]);
  }, [historyIndex, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (modifier && e.key === "y") ||
        (modifier && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleClear = () => {
    if (strokes.length === 0) return;
    const newStrokes: Stroke[] = [];
    setStrokes(newStrokes);
    saveToHistory(newStrokes);
    setCurrentStroke(null);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-neutral-200 bg-white sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
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
        <div className="flex items-center gap-1 sm:gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border border-neutral-200 p-0.5"
            disabled={tool === "eraser"}
            aria-label="Stroke color"
            title="Stroke color"
          />
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700"
            aria-label="Stroke width"
          >
            <option value={1}>Thin</option>
            <option value={2}>Medium</option>
            <option value={4}>Thick</option>
          </select>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:scale-105 hover:bg-neutral-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent"
          >
            <UndoIcon />
            Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:scale-105 hover:bg-neutral-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent"
          >
            <RedoIcon />
            Redo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:scale-105 hover:bg-neutral-100 active:scale-95"
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
            className="pointer-events-none fixed z-[100]"
            style={
              tool === "pen"
                ? {
                    left: cursorPos.x - 2.5,
                    top: cursorPos.y - 26,
                    transformOrigin: "2.5px 26px",
                  }
                : {
                    left: cursorPos.x,
                    top: cursorPos.y,
                  }
            }
          >
            {tool === "pen" ? (
              <>
                {/* Ink dot that appears when drawing */}
                <div
                  className="absolute transition-all duration-100"
                  style={{
                    left: 2.5,
                    top: 26,
                    width: isDrawing ? strokeWidth * 2 + 2 : 0,
                    height: isDrawing ? strokeWidth * 2 + 2 : 0,
                    backgroundColor: strokeColor,
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: isDrawing ? 0.6 : 0,
                  }}
                />
                <svg
                  {...svgProps}
                  width={28}
                  height={28}
                  className={`block transition-all duration-100 ${
                    isDrawing ? "text-neutral-900" : "text-neutral-700"
                  }`}
                  style={{
                    flexShrink: 0,
                    transform: isDrawing
                      ? "rotate(-25deg) scale(0.95)"
                      : "rotate(-20deg) scale(1)",
                    filter: isDrawing
                      ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                  }}
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </>
            ) : (
              <>
                {/* Eraser dust particles when erasing */}
                {isDrawing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute w-1 h-1 rounded-full bg-neutral-400 animate-ping"
                      style={{ left: -4, top: 8, animationDuration: "0.6s" }}
                    />
                    <div
                      className="absolute w-1 h-1 rounded-full bg-neutral-300 animate-ping"
                      style={{
                        left: 8,
                        top: -4,
                        animationDuration: "0.8s",
                        animationDelay: "0.2s",
                      }}
                    />
                    <div
                      className="absolute w-0.5 h-0.5 rounded-full bg-neutral-400 animate-ping"
                      style={{
                        left: 12,
                        top: 6,
                        animationDuration: "0.5s",
                        animationDelay: "0.1s",
                      }}
                    />
                  </div>
                )}
                <svg
                  {...svgProps}
                  width={28}
                  height={28}
                  className={`block transition-all duration-75 ${
                    isDrawing ? "text-neutral-800" : "text-neutral-600"
                  }`}
                  style={{
                    flexShrink: 0,
                    transform: isDrawing
                      ? "translate(-50%, -50%) translate(4px, 0) rotate(-8deg) scale(1.1)"
                      : "translate(-50%, -50%) translate(4px, 0) rotate(0deg) scale(1)",
                    filter: isDrawing
                      ? "drop-shadow(0 2px 6px rgba(0,0,0,0.25))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                    animation: isDrawing ? "eraserWiggle 0.15s ease-in-out infinite" : "none",
                  }}
                >
                  {/* Filled eraser shape - closed path */}
                  <path
                    d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z"
                    fill="currentColor"
                    fillOpacity={0.15}
                  />
                  {/* Stroke outline */}
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z" />
                  {/* Diagonal separator line */}
                  <path d="m5 11 9 9" />
                </svg>
              </>
            )}
          </div>
        )}
        {/* CSS animation for eraser wiggle */}
        <style jsx>{`
          @keyframes eraserWiggle {
            0%, 100% { transform: translate(-50%, -50%) translate(4px, 0) rotate(-6deg) scale(1.1); }
            50% { transform: translate(-50%, -50%) translate(4px, 0) rotate(6deg) scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
}
