import Image from 'next/image';

/*
 * The store badges are exported from Figma as pieces that are stored flipped
 * and pre-scaled (hence the negative Y scale), so they are placed with the
 * exact offsets from the design to stay pixel-identical.
 */
export function AppStoreBadge() {
  return (
    <div className="relative h-[52px] w-[180px] shrink-0">
      <Image
        src="/welcome/appstore-outline.svg"
        alt=""
        width={178}
        height={50.038}
        className="absolute left-px top-[0.98px] max-w-none"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/welcome/appstore-bg.svg"
          alt=""
          width={143.656}
          height={41.989}
          className="max-w-none flex-none"
          style={{ transform: 'scale(1.25, -1.24)' }}
        />
      </div>
      <Image
        src="/welcome/appstore-apple.svg"
        alt=""
        width={27.675}
        height={33.165}
        className="absolute left-[17.06px] top-[8.08px] max-w-none"
      />
      <Image
        src="/welcome/appstore-name.svg"
        alt=""
        width={106.328}
        height={22.637}
        className="absolute left-[56.55px] top-[23.4px] max-w-none"
      />
      <Image
        src="/welcome/appstore-caption.svg"
        alt=""
        width={103.375}
        height={9.079}
        className="absolute left-[58.23px] top-[8.52px] max-w-none"
      />
      <span className="sr-only">Download on the App Store</span>
    </div>
  );
}

export function GooglePlayBadge() {
  return (
    <div className="flex h-[52px] w-[179.753px] shrink-0 items-center justify-center">
      <Image
        src="/welcome/googleplay.svg"
        alt="Get it on Google Play"
        width={143.802}
        height={41.6}
        className="max-w-none flex-none"
        style={{ transform: 'scale(1.25, -1.25)' }}
      />
    </div>
  );
}
