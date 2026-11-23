/* Round photo, or the first letter of the name on a mint circle until they have a photo. */
export function SupportAvatar({ name, photo, sizeClass = 'size-[44px]' }: { name: string; photo: string | null; sizeClass?: string }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
    return <img src={photo} alt="" className={`${sizeClass} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-secondary text-[18px] font-semibold text-ink`}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}
