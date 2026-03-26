export function PageLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center h-[calc(100dvh-52px)] bg-slate-900 gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="페이지를 불러오는 중입니다"
    >
      <div className="w-10 h-10 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" aria-hidden="true" />
      <p className="text-sm text-slate-500">불러오는 중...</p>
    </div>
  )
}
