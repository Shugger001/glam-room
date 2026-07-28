export type ShopCapacityRow = {
  id: string;
  area: string;
  count: number;
  max: number;
  fullyBooked: boolean;
};

export function ShopCapacityStrip({ shops }: { shops: ShopCapacityRow[] }) {
  if (shops.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {shops.map((shop) => (
        <div
          key={shop.id}
          className={`rounded-2xl border px-4 py-3 backdrop-blur-sm ${
            shop.fullyBooked
              ? "border-amber-400/40 bg-amber-500/10"
              : "border-white/10 bg-black/20"
          }`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-glam-accent">
            {shop.area} today
          </p>
          <p className="mt-2 text-lg text-white">
            {shop.count}
            <span className="text-sm text-white/45"> / {shop.max}</span>
          </p>
          <p className="mt-1 text-xs text-white/50">
            {shop.fullyBooked ? "Fully booked" : `${shop.max - shop.count} openings left`}
          </p>
        </div>
      ))}
    </div>
  );
}
