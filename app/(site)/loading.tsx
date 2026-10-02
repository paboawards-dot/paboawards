export default function Loading() {
  return (
    <div className="container-x py-10" role="status" aria-label="Chargement">
      <div className="skeleton h-12 w-2/3 rounded-2xl" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[4/5] rounded-3xl" />)}
      </div>
    </div>
  );
}
