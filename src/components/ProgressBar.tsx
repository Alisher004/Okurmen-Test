import React from "react";

interface Props {
  percent: number;
}

export default function ProgressBar({ percent }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const color = clamped < 40 ? "red" : clamped < 70 ? "orange" : "green";

  const barStyle: React.CSSProperties = {
    width: "30px",
    height: "30px",
    background: color,
    borderRadius: "100%",
  };

  return (
    <div>
      <div style={barStyle} />
    </div>
  );
}
