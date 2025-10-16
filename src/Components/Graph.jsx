import React, { useEffect, useState } from "react";
import "./Graph.css";

export default function Graph({ players = [], darkMode = true, maxWidth }) {
  const [prefs, setPrefs] = useState({ res: true, diff: true });
  const [hover, setHover] = useState(null); // { x, y, text, idx, type, cw, ch }
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load saved graph preferences once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('graphPrefs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.res === 'boolean' || typeof parsed.diff === 'boolean') {
          setPrefs((p) => ({
            res: typeof parsed.res === 'boolean' ? parsed.res : p.res,
            diff: typeof parsed.diff === 'boolean' ? parsed.diff : p.diff,
          }));
        }
      }
    } catch {}
  }, []);

  // Persist graph preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('graphPrefs', JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  // Utilities copied from History.jsx
  const formatCompact = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)}b`;
    if (abs >= 1_000_000) return `${Math.round(n / 1_000_000)}m`;
    if (abs >= 1_000) return `${Math.round(n / 1_000)}k`;
    return n.toString();
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const hexToRgb = (hex) => {
    const m = hex.replace('#','');
    return {
      r: parseInt(m.substring(0,2),16),
      g: parseInt(m.substring(2,4),16),
      b: parseInt(m.substring(4,6),16)
    };
  };
  const rgbToHex = ({r,g,b}) => `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
  const lerpColor = (startHex, endHex, t) => {
    const s = hexToRgb(startHex), e = hexToRgb(endHex);
    return rgbToHex({
      r: Math.round(lerp(s.r, e.r, t)),
      g: Math.round(lerp(s.g, e.g, t)),
      b: Math.round(lerp(s.b, e.b, t))
    });
  };

  // Prepare data (mirror History.jsx logic)
  const list = (players || []).filter(p => typeof p.resources === 'number');
  if (list.length === 0) return null;
  const limit = 20;
  const top10 = [...list].slice(0, limit).reverse(); // 10..1
  const diffs = top10.map(p => (typeof p.diff === 'number' ? p.diff : null));
  const resources = top10.map(p => (typeof p.resources === 'number' ? p.resources : 0));
  const maxRes = Math.max(...resources, 1);
  const numericDiffs = diffs.filter((d) => typeof d === 'number');
  const hasNumericDiffs = numericDiffs.length > 0;
  const maxDiff = Math.max(...(hasNumericDiffs ? numericDiffs : [1]));
  const labels = top10.map((p, idx) => ({ rank: top10.length - idx, name: p.player }));

  const width = 800, height = 340, m = { t: 56, r: 66, b: 84, l: 60 };
  const cw = width - m.l - m.r;
  const ch = height - m.t - m.b;
  const n = top10.length;
  const slot = cw / n;
  const barW = Math.max(10, slot * 0.6);
  const xFor = (idx) => idx * slot + (slot - barW) / 2;
  const startBar = '#a8cf6d';
  const endBar = '#476629';
  const baseDotR = vw <= 600 ? 9 : 6; // slightly smaller on desktop
  const hoverDotR = baseDotR + 1;

  // Line points
  const points = diffs
    .map((v, idx) => (typeof v === 'number' ? { idx, v } : null))
    .filter(Boolean)
    .map(({ idx, v }) => {
      const x = idx * slot + slot / 2;
      const y = ch - Math.max(2, (v / maxDiff) * ch);
      return { x, y, idx };
    });
  const pathD = points.reduce((acc, p, j) => acc + (j === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');

  const containerStyle = maxWidth !== undefined ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : undefined;

  return (
    <div className="diff-chart" style={containerStyle} onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="chart"
        onMouseMove={(e) => {
          if (!hover) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setHover((h) => h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top, cw: rect.width, ch: rect.height } : null);
        }}
      >
        <defs>
          <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fbb3f" stopOpacity="1" />
            <stop offset="100%" stopColor="#476629" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="gradLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3f5b20" />
            <stop offset="100%" stopColor="#74a143" />
          </linearGradient>
          <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#476629" floodOpacity="0.7" />
          </filter>
        </defs>
        <g transform={`translate(${m.l},${m.t})`}>
          {/* Grid lines only */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, k) => {
            const y = ch - t * ch;
            return (
              <line key={k} x1={0} y1={y} x2={cw} y2={y} className="grid" />
            );
          })}

          {/* Left axis labels: Resources */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, k) => {
            const y = ch - t * ch;
            const v = Math.round(maxRes * t);
            return (
              <text key={`yl-${k}`} x={-18} y={y} className="y-label y-label-left" textAnchor="end" dominantBaseline="middle">{formatCompact(v)}</text>
            );
          })}

          {/* Right axis labels: Difference */}
          {hasNumericDiffs && [0, 0.25, 0.5, 0.75, 1].map((t, k) => {
            const y = ch - t * ch;
            const v = Math.round(maxDiff * t);
            return (
              <text key={`yr-${k}`} x={cw + 18} y={y} className="y-label y-label-right" textAnchor="start" dominantBaseline="middle">{formatCompact(v)}</text>
            );
          })}

          {/* Axis titles */}
          {prefs.res && (
            <text x={-m.l + 8} y={-m.t + 28} className="axis-title axis-title-left" textAnchor="start">Resources (bars)</text>
          )}
          {prefs.diff && hasNumericDiffs && (
            <text x={cw + m.r - 8} y={-m.t + 28} className="axis-title axis-title-right" textAnchor="end">Difference (line)</text>
          )}

          {/* Bars for Resources */}
          {prefs.res && resources.map((v, idx) => {
            const x = xFor(idx);
            const h = Math.max(2, (v / maxRes) * ch);
            const y = ch - h;
            const t = n > 1 ? idx / (n - 1) : 0;
            const fill = lerpColor(startBar, endBar, t);
            const isHover = hover && hover.type === 'bar' && hover.idx === idx;
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barW}
                height={h}
                fill={fill}
                stroke={isHover ? '#9cc45a' : 'none'}
                strokeWidth={isHover ? 1 : 0}
                filter={isHover ? 'url(#hoverGlow)' : undefined}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: `${v.toLocaleString()} resources`, idx, type: 'bar', cw: rect.width, ch: rect.height });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}

          {/* Line + points for Difference */}
          {prefs.diff && hasNumericDiffs && (
            <>
              <path d={pathD} fill="none" stroke={darkMode ? '#ffffff' : '#000000'} strokeOpacity="0.8" strokeWidth="1.5" className="diff-line" />
              {points.map((p) => {
                const isHover = hover && hover.type === 'diff' && hover.idx === p.idx;
                return (
                  <g key={p.idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHover ? hoverDotR : baseDotR}
                      fill={darkMode ? '#ffffff' : '#000000'}
                      stroke={isHover ? '#9cc45a' : 'none'}
                      strokeWidth={isHover ? 1 : 0}
                      filter={isHover ? 'url(#hoverGlow)' : undefined}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                        setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: `${(diffs[p.idx] || 0).toLocaleString()} diff`, idx: p.idx, type: 'diff', cw: rect.width, ch: rect.height });
                      }}
                      onMouseLeave={() => setHover(null)}
                    />
                  </g>
                );
              })}
            </>
          )}
          {prefs.diff && !hasNumericDiffs && (
            <g>
              {/* Placeholder note if no numeric diffs; keep layout consistent */}
            </g>
          )}

          {/* X labels with rank and name */}
          {labels.map((l, idx) => {
            const x = idx * slot + slot / 2;
            const y = ch + 26;
            const nameDy = idx % 2 === 0 ? 16 : 30; // slightly closer to rank
            const fullName = l.name;
            return (
              <text key={idx} x={x} y={y} className="x-label" textAnchor="middle">
                <tspan x={x}>{l.rank}</tspan>
                <tspan x={x} dy={nameDy}>{fullName}</tspan>
              </text>
            );
          })}

          <line x1={0} y1={ch} x2={cw} y2={ch} className="axis" />
        </g>
      </svg>

      {hover && (() => {
        const padX = 12, padY = 12;
        const flipX = hover.cw && (hover.x + 160 > hover.cw);
        const flipY = hover.ch && (hover.y + 48 > hover.ch);
        const left = (hover.x + (flipX ? -padX : padX));
        const top = (hover.y + (flipY ? -padY : padY));
        const style = { left, top, transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})` };
        return (
          <div className="chart-tooltip" style={style}>
            {hover.text}
          </div>
        );
      })()}

      <div className="chart-meta">
        <div className="chart-controls">
          <label className="checkbox-item">
            <input type="checkbox" checked={prefs.res} onChange={() => togglePref('res')} />
            <span>Resources</span>
          </label>
          <label className="checkbox-item">
            <input type="checkbox" checked={prefs.diff} onChange={() => togglePref('diff')} />
            <span>Difference</span>
          </label>
        </div>
      </div>
    </div>
  );
}
