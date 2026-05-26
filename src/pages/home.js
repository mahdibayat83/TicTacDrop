import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tic Toc Drop</h1>

      <div style={styles.languageSection}>
        <button style={styles.languageBtn}>🇮🇷 فارسی</button>
        <button style={styles.languageBtn}>en English</button>
      </div>

      <div style={styles.playSection}>
        <Link to={"/game?mode=offline"} style={styles.playBtn}>
          👥 play local
        </Link>
        <Link to={"/game?mode=online"} style={styles.playBtn}>
          🌐 play online
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(to right, #141e30, #243b55)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "Vazirmatn, sans-serif",
    padding: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 48,
    marginBottom: 40,
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  },
  languageSection: {
    display: "flex",
    gap: 20,
    marginBottom: 40,
  },
  languageBtn: {
    padding: "10px 20px",
    fontSize: 18,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#00c6ff",
    color: "#000",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    transition: "0.2s ease",
  },
  playSection: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  playBtn: {
    textDecoration: "none",
    padding: "15px 30px",
    fontSize: 20,
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#ff416c",
    color: "#fff",
    boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
    transition: "0.2s ease",
  },
};
