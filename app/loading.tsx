export default function Loading() {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]"
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#25D366] border-t-transparent" />
    </div>
  );
}
