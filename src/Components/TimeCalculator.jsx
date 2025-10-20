import React, { useState, useMemo } from "react";

export default function TimeCalculator() {
  // base time
  const [bh, setBh] = useState(0);
  const [bm, setBm] = useState(0);
  const [bs, setBs] = useState(0);

  // delta time
  const [dh, setDh] = useState(0);
  const [dm, setDm] = useState(0);
  const [ds, setDs] = useState(0);

  const [op, setOp] = useState("add"); // 'add' | 'sub'

  const baseTotal = useMemo(() => Math.max(0, (parseInt(bh) || 0) * 3600 + (parseInt(bm) || 0) * 60 + (parseInt(bs) || 0)), [bh, bm, bs]);
  const deltaTotal = useMemo(() => Math.max(0, (parseInt(dh) || 0) * 3600 + (parseInt(dm) || 0) * 60 + (parseInt(ds) || 0)), [dh, dm, ds]);

  const result = useMemo(() => {
    const t = op === "add" ? baseTotal + deltaTotal : baseTotal - deltaTotal;
    const clamped = Math.max(0, t);
    const nh = Math.floor(clamped / 3600);
    const nm = Math.floor((clamped % 3600) / 60);
    const ns = Math.floor(clamped % 60);
    return { total: t, clamped, h: nh, m: nm, s: ns };
  }, [baseTotal, deltaTotal, op]);

  const fmt2 = (n) => n.toString().padStart(2, "0");

  const setNumber = (setter) => (e) => {
    const v = e.target.value.replace(/[^0-9]/g, "");
    setter(v === "" ? 0 : parseInt(v, 10));
  };

  return (
    <div>
      <h1>Time Calculator</h1>

      <div className="panel">
        <div className="section">
          <h2>Base time</h2>
          <div className="triple-input">
            <label className="field">
              <span className="field-label">Hours</span>
              <input type="text" inputMode="numeric" value={bh} onChange={setNumber(setBh)} />
            </label>
            <label className="field">
              <span className="field-label">Minutes</span>
              <input type="text" inputMode="numeric" value={bm} onChange={setNumber(setBm)} />
            </label>
            <label className="field">
              <span className="field-label">Seconds</span>
              <input type="text" inputMode="numeric" value={bs} onChange={setNumber(setBs)} />
            </label>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section">
          <h2>Adjust by (add or subtract)</h2>
          <div className="triple-input">
            <label className="field">
              <span className="field-label">Hours</span>
              <input type="text" inputMode="numeric" value={dh} onChange={setNumber(setDh)} />
            </label>
            <label className="field">
              <span className="field-label">Minutes</span>
              <input type="text" inputMode="numeric" value={dm} onChange={setNumber(setDm)} />
            </label>
            <label className="field">
              <span className="field-label">Seconds</span>
              <input type="text" inputMode="numeric" value={ds} onChange={setNumber(setDs)} />
            </label>
          </div>

          <div className="op-toggle">
            <button className={op === "add" ? "active" : ""} onClick={() => setOp("add")}>
              + Add
            </button>
            <button className={op === "sub" ? "active" : ""} onClick={() => setOp("sub")}>
              − Subtract
            </button>
          </div>
        </div>
      </div>

      <div className="result-display">{fmt2(result.h)}:{fmt2(result.m)}:{fmt2(result.s)}</div>

      {result.total < 0 && (
        <div className="warn">Subtraction was negative; clamped to 0.</div>
      )}
    </div>
  );
}
