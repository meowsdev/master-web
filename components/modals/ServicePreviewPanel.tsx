'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Service } from '@/types/service.types';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { AuthPrimaryButton } from '@/components/modals/auth/AuthDrawerShell';

interface ServicePreviewPanelProps {
  service: Service | null;
  onClose: () => void;
  /** Guests: "Contact Now" (log in, then chat). Signed in: "Book Service". */
  primaryActionLabel: string;
  onPrimaryAction: (service: Service) => void;
}

/* Hero photo, or a soft green block with the category icon until the service has one. */
function ServiceHero({ service }: { service: Service }) {
  if (service.imageUrl) {
    return (
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-[12px] bg-[#f7f5f3]">
        <Image src={service.imageUrl} alt={service.name} fill sizes="530px" unoptimized className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex aspect-[2/1] w-full items-center justify-center rounded-[12px] bg-gradient-to-b from-[#d7fdd2] to-[#f7f5f3] text-[72px]">
      {service.category?.iconUrl && !service.category.iconUrl.startsWith('http') ? service.category.iconUrl : '🛠️'}
    </div>
  );
}

/*
 * THE "Service info" panel (Figma "AC Repair & Service"), used by everyone: guests see it
 * when they pick a service, signed-in users open it from the chat header. It only
 * presents the service record; chatting and booking stay behind login.
 */
export function ServicePreviewPanel({ service, onClose, primaryActionLabel, onPrimaryAction }: ServicePreviewPanelProps) {
  if (!service) return null;
  const features = service.features ?? [];

  return (
    // The list beside the panel stays clickable (AGENTS.md §9): picking another service swaps the details.
    <SidePanelShell title={service.name} onClose={onClose}>
      <div className="flex flex-col gap-[24px]">
        <ServiceHero service={service} />

        <h2 className="border-l-[4px] border-[#1daa61] pl-[12px] text-[24px] font-semibold leading-tight tracking-[-0.48px] text-[#202939]">
          {service.nameBn || service.name}
        </h2>

        {service.description && (
          <p className="text-[16px] font-medium leading-relaxed text-[#202939]">{service.description}</p>
        )}

        {features.length > 0 && (
          <ul className="grid grid-cols-1 gap-x-[24px] gap-y-[20px] sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-[8px] text-[14px] font-medium text-[#202939]">
                <ChevronRight className="size-[16px] shrink-0 text-[#202939]" strokeWidth={1.5} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center pt-[8px]">
          <AuthPrimaryButton type="button" onClick={() => onPrimaryAction(service)}>
            {primaryActionLabel}
          </AuthPrimaryButton>
        </div>
      </div>
    </SidePanelShell>
  );
}
