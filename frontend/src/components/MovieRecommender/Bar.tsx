// component simple that mimicks stockfish bar but only for values between -1, 1.
interface BarProps {
  value: number | undefined; // should be between -1 and 1
}

function Bar({ value }: BarProps) {
  if (value === undefined) {
    return null;
  }

  // Normalize value to be between -1 and 1
  let normalized = Math.max(-1, Math.min(1, value));

  // Convert normalized value to percentage
  // -1 => 0%, 0 => 50%, 1 => 100%
  const percent = ((normalized + 1) / 2) * 100;

  return (
    <div
      style={{
        width: "100%",
        height: "24px",
        background: "#eee",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #ccc",
        position: "relative",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          background: normalized >= 0 ? "#4caf50" : "#f44336",
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

export default Bar;
