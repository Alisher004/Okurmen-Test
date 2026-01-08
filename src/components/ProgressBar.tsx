import React from "react";

interface Props {
  percent: number;
}

export default function ProgressBar({ percent }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const color = clamped < 40 ? "#ef4444" : clamped < 70 ? "#f59e0b" : "#10b981";

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "30px",
    backgroundColor: "#e5e7eb",
    borderRadius: "15px",
    overflow: "hidden",
    marginTop: "20px",
  };

  const barStyle: React.CSSProperties = {
    width: `${clamped}%`,
    height: "100%",
    backgroundColor: color,
    transition: "width 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <div style={barStyle} />
    </div>
  );
}
