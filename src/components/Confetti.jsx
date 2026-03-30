import { useEffect, useState } from "react";

const COLORS = ["#f5a623", "#e8453c", "#7b61ff", "#2ecc71", "#4ecdc4", "#e91e8f", "#3498db"];

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const p = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 6,
      shape: Math.random() > 0.5 ? "circle" : "square",
    }));
    setPieces(p);
    const t = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(t);
  }, [active]);

  if (!pieces.length) return null;

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
