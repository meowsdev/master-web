import Image from 'next/image';
import { AppStoreBadge, GooglePlayBadge } from './StoreBadges';

/* Left 500×500 welcome card: "Download Mobile App" promo with store badges. */
export function MobileAppPromoCard() {
  return (
    <div className="relative size-[500px] shrink-0 overflow-clip rounded-[12px] border border-[#e5e5e5] bg-white">
      {/* Photo is wider than the card on purpose; the card crops it like in Figma */}
      <div className="absolute left-[-136.55px] top-[-1px] h-[500px] w-[749.634px]">
        <Image
          src="/welcome/man-with-phone.jpg"
          alt=""
          fill
          sizes="750px"
          priority
          className="pointer-events-none object-cover"
        />
      </div>

      <Image
        src="/welcome/orange-blob.svg"
        alt=""
        width={263}
        height={263}
        className="absolute left-[-69px] top-[257px] max-w-none"
      />

      <div className="absolute left-[-1px] top-[-1px] h-[500px] w-[244px] overflow-clip bg-gradient-to-b from-white/20 to-white/50">
        <div className="absolute left-[32px] top-[156px] flex flex-col items-end justify-center gap-[114px]">
          <div className="flex w-[180px] flex-col items-start">
            <span className="flex items-center justify-center rounded-[18.947px] bg-black px-[11.368px] py-[3.789px] text-[18.947px] font-normal tracking-[-0.3789px] text-white">
              Download
            </span>
            <p className="w-min min-w-full whitespace-nowrap text-[34.105px] font-extrabold leading-[79.84%] tracking-[-0.6821px] text-black">
              Mobile App
            </p>
          </div>

          <div className="flex w-[180px] flex-col items-start gap-[23px]">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
        </div>
      </div>

      <div className="absolute left-[31.45px] top-[31px] flex items-center gap-[5.333px]">
        <Image src="/welcome/brand-mark-small.svg" alt="" width={32} height={32} />
        <p className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.32px] text-[#202939]">
          SupeerApp
        </p>
      </div>
    </div>
  );
}
