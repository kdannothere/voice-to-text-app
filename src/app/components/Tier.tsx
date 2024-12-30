export default function Tier({
  price,
  chooseTier,
  active,
}: {
  price: number;
  chooseTier: () => void;
  active: boolean;
}) {
  return (
    <div
      onClick={chooseTier}
      className={`mx-4 p-2 flex-1 text-center rounded-lg cursor-pointer hover:bg-blue-300 ${
        active ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      <p>
        <span>$</span>
        <span>{price}</span>
      </p>
    </div>
  );
}
