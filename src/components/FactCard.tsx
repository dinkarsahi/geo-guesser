interface FactCardProps {
  /** What was being guessed (city, country or station name). */
  title: string;
  fact: string;
}

/** The revealed fact, shown in the map overlay with a "Did you know?" lead-in. */
export default function FactCard({ title, fact }: FactCardProps) {
  return (
    <div className="fact">
      <strong className="fact-title">{title}</strong>
      <p className="fact-body">
        <span className="fact-dyk">Did you know?</span> {fact}
      </p>
    </div>
  );
}
