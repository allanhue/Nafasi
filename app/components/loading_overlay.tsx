type LoadingOverlayProps = {
  isLoading: boolean;
  label?: string;
};

export default function LoadingOverlay({
  isLoading,
  label = "Loading... Please wait"
}: LoadingOverlayProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#20231f]/25 backdrop-blur-sm pointer-events-auto">
      <div className="flex min-w-44 flex-col items-center gap-3 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] px-6 py-5 shadow-xl">
        <span className="h-9 w-9 animate-spin rounded-full border-4 border-[#d8ddd0] border-t-[#1d3d35]" />
        <span className="text-sm font-semibold text-[#1d3d35]">{label}</span>
      </div>
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

type LoadingCardProps = {
  label?: string;
};

export function LoadingCard({ label = "Loading..." }: LoadingCardProps) {
  return (
    <div className="rounded-lg border border-[#e1e5db] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#d8ddd0] border-t-[#1d3d35]"
        />
        <span className="text-sm font-semibold text-[#1d3d35]">{label}</span>
      </div>
    </div>
  );
}
