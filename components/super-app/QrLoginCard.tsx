import Image from 'next/image';

interface QrLoginCardProps {
  onOtpLogin: () => void;
}

/* Right 500×500 welcome card: QR login with an OTP fallback link. */
export function QrLoginCard({ onOtpLogin }: QrLoginCardProps) {
  return (
    <div className="relative size-[500px] shrink-0 overflow-clip rounded-[12px] bg-white">
      {/* Soft brand-green wash rising from the bottom edge */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1daa61]/10 to-[#1daa61]/0" />

      <div className="absolute left-1/2 top-[calc(50%+0.5px)] flex w-[250px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[12px]">
        <Image
          src="/welcome/login-qr.png"
          alt="QR code to log in from the mobile app"
          width={250}
          height={250}
          className="pointer-events-none aspect-square w-full"
        />

        <div className="flex w-full flex-col items-center gap-[12px] text-center text-[18px]">
          <p className="w-full font-semibold tracking-[-0.36px] text-[#202939]">
            Login with QR from <span className="text-[#1daa61]">Mobile App</span>
          </p>
          <p className="w-full font-medium text-[#697586]">or</p>
          <button
            type="button"
            onClick={onOtpLogin}
            className="w-full cursor-pointer font-semibold tracking-[-0.36px] text-[#697586] underline"
          >
            OTP Login
          </button>
        </div>
      </div>
    </div>
  );
}
