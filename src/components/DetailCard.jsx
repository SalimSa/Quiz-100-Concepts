import { useState } from "react";
import { catColors, conceptDetails } from "../data/quizData.js";
import { getDetail } from "../data/utils.js";

const circleColors = ["#e8453c", "#f5a623", "#2ecc71", "#7b61ff"];

export default function DetailCard({ q }) {
  const [open, setOpen] = useState(false);
  const d = getDetail(conceptDetails, q);
  const themeColor = catColors[q.theme];

  if (!open) {
    return (
      <button className="detail-toggle" onClick={() => setOpen(true)}>
        <span style={{ fontSize: 18 }}>{d.visual.split("")[0]}</span>
        <span>Details & visuel explicatif</span>
        <span style={{ fontSize: 11 }}>▼</span>
      </button>
    );
  }

  return (
    <div
      className="detail-card animate-in"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
        border: `1px solid ${themeColor}33`,
      }}
    >
      <div
        className="detail-header"
        onClick={() => setOpen(false)}
        style={{ background: `${themeColor}15` }}
      >
        <div className="detail-header-left">
          <span className="detail-visual">{d.visual}</span>
          <span className="detail-title">{d.title}</span>
        </div>
        <span className="detail-close">▲ fermer</span>
      </div>

      <div className="detail-body">
        <p className="detail-text">{d.detail}</p>

        {d.diagram && (
          <div className="diagram">
            {d.diagramType === "flow" && (
              <div className="diagram-flow">
                {d.diagram.map((item, i) => (
                  <div key={i}>
                    <div
                      className="diagram-flow-item"
                      style={{
                        background: `${themeColor}18`,
                        border: `1px solid ${themeColor}40`,
                      }}
                    >
                      {item}
                    </div>
                    {i < d.diagram.length - 1 && (
                      <div className="diagram-arrow">↓</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {d.diagramType === "levels" && (
              <div className="diagram-levels">
                {d.diagram.map((item, i) => (
                  <div
                    key={i}
                    className="diagram-level-item"
                    style={{
                      background: `rgba(255,255,255,${0.03 + i * 0.03})`,
                      border: `1px solid rgba(255,255,255,${0.08 + i * 0.05})`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {d.diagramType === "4circles" && (
              <div className="diagram-4circles">
                {d.diagram.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: `${circleColors[i]}15`,
                      border: `1px solid ${circleColors[i]}40`,
                      borderRadius: 10,
                      padding: 10,
                      fontSize: 12,
                      color: "#ddd",
                      textAlign: "center",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {d.diagramType === "grid" && (
              <div className="diagram-grid">
                {d.diagram.map((item, i) => (
                  <div key={i} className="diagram-grid-item">
                    {item}
                  </div>
                ))}
              </div>
            )}

            {d.diagramType === "vs" && (
              <div className="diagram-vs">
                {d.diagram.map((item, i) => (
                  <div
                    key={i}
                    className="diagram-vs-item"
                    style={{
                      background:
                        i === 0
                          ? "rgba(232,69,60,0.1)"
                          : "rgba(46,204,113,0.1)",
                      border: `1px solid ${i === 0 ? "rgba(232,69,60,0.3)" : "rgba(46,204,113,0.3)"}`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {d.diagramType === "circles" && (
              <div className="diagram-circles">
                {d.diagram.map((item, i) => (
                  <div
                    key={i}
                    className="diagram-circle-item"
                    style={{
                      width: `${60 + i * 12}%`,
                      background: `${themeColor}${15 - i * 3}`,
                      border: `1px solid ${themeColor}40`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {q.url && (
          <a
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-link"
            style={{ color: themeColor }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            En savoir plus sur {q.concept || q.answer || q.intrus}
          </a>
        )}
      </div>
    </div>
  );
}
