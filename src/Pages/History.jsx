import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Graph from "../Components/Graph";
import LeaderboardTable from "../Components/LeaderboardTable";
import Modal from "../Components/Modal";
import "./History.css";

export default function History() {
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState({ open: false, title: "", message: "", variant: "info", onConfirm: null, onCancel: null });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");

    const savedHistory = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory(savedHistory.reverse());
  }, []);

  const handleDelete = (timestamp) => {
    setModal({
      open: true,
      title: "Delete snapshot",
      message: "Are you sure you want to delete this snapshot?",
      variant: "confirm",
      onCancel: () => setModal((m) => ({ ...m, open: false })),
      onConfirm: () => {
        setModal((m) => ({ ...m, open: false }));
        const updated = history.filter((h) => h.timestamp !== timestamp);
        setHistory(updated);
        localStorage.setItem("history", JSON.stringify(updated.reverse()));
      },
    });
  };

  const handleClearAll = () => {
    setModal({
      open: true,
      title: "Clear history",
      message: "This will remove all saved snapshots. Continue?",
      variant: "confirm",
      onCancel: () => setModal((m) => ({ ...m, open: false })),
      onConfirm: () => {
        setModal((m) => ({ ...m, open: false }));
        setHistory([]);
        localStorage.removeItem("history");
      },
    });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Chart state and helpers removed; charts now use shared Graph component

  // Helper functions removed; Graph encapsulates chart logic

  return (
    <div
      className={`app-container ${darkMode ? "dark" : "light"}`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="content history-content">
        <h1>History</h1>

        {history.length === 0 ? (
          <p className="empty-msg">No snapshots saved yet.</p>
        ) : (
          <>
            <button className="clear-all-btn" onClick={handleClearAll}>
              🗑 Clear All
            </button>

            <div className="history-list">
              {history.map((snap, i) => (
                <div key={snap.timestamp} className="history-card">
                  <div
                    className="history-header"
                    onClick={() =>
                      setExpanded(expanded === i ? null : i)
                    }
                  >
                    <div>
                      <strong>{formatDate(snap.timestamp)}</strong> —{" "}
                      {snap.raidTime}
                      <div className="saved-time">
                        Saved at {formatTime(snap.timestamp)}
                      </div>
                    </div>
                    <div className="history-buttons">
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(snap.timestamp);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expanded === i && (
                    <div className="snapshot-details">
                      <LeaderboardTable players={snap.players} showMovement={false} />

                      <Graph players={snap.players} darkMode={darkMode} maxWidth="100%" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.variant === 'confirm' ? 'Confirm' : 'OK'}
        cancelText={"Cancel"}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}
