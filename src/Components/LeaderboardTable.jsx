import React from "react";
import "./LeaderboardTable.css";

export default function LeaderboardTable({ players = [], showMovement = false, maxWidth, subtitle }) {
  if (!players || players.length === 0) return null;

  const containerStyle = maxWidth !== undefined ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : undefined;

  return (
    <div className="leaderboard-table" style={containerStyle}>
      <table className="leaderboard">
        <thead>
          <tr>
            <th className="col-rank">Rank</th>
            <th className="col-player">Player</th>
            <th className="col-resources">Resources</th>
            <th className="col-last">Last Hour</th>
            <th className="col-diff">
              <div className="diff-header">
                <div>Difference</div>
                {subtitle ? (
                  <div className="diff-subtitle">{subtitle}</div>
                ) : null}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            let arrow = null;
            if (showMovement && !p.isNew && p.previousRank !== null && p.previousRank !== undefined) {
              if (p.previousRank > i + 1) arrow = "up";
              else if (p.previousRank < i + 1) arrow = "down";
            }

            return (
              <tr key={i}>
                <td className="col-rank">{i + 1}</td>
                <td className="col-player">
                  {showMovement && p.isNew && (
                    <span className="arrow new">New</span>
                  )}
                  {showMovement && arrow && (
                    <span className={`arrow ${arrow}`}>
                      {arrow === "up" ? "↑" : "↓"}
                    </span>
                  )}
                  {p.player}
                </td>
                <td className="col-resources">{typeof p.resources === 'number' ? p.resources.toLocaleString() : p.resources}</td>
                <td className="col-last">
                  {typeof p.lastHour === "number"
                    ? p.lastHour.toLocaleString()
                    : p.lastHour}
                </td>
                <td className={`col-diff ${typeof p.diff === "string" ? "waiting" : "positive"}`}>
                  {typeof p.diff === "string" ? p.diff : p.diff.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
