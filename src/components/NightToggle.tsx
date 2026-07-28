interface NightToggleProps {
  night: boolean;
  onToggle: () => void;
}

export default function NightToggle({ night, onToggle }: NightToggleProps) {
  return (
    <button
      className="btn btn-ghost night-toggle"
      onClick={onToggle}
      aria-pressed={night}
      title="Toggle day / night"
    >
      {night ? "☀️ Day" : "🌙 Night"}
    </button>
  );
}
