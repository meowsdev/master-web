'use client';

import { useEffect, useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';

type IconLibrary = Record<string, unknown>;

interface IconGridProps {
  onChoose: (name: string, elements: unknown) => void;
  isBusy: boolean;
}

const MAX_SHOWN = 72;

/*
 * Search the Hugeicons free set (hugeicons.com) and pick one. The library is large, so it is only loaded
 * here, when an admin opens the picker; customers and providers never download it.
 */
export function IconGrid({ onChoose, isBusy }: IconGridProps) {
  const [library, setLibrary] = useState<IconLibrary | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let isActive = true;
    import('@hugeicons/core-free-icons').then((loaded) => isActive && setLibrary(loaded as unknown as IconLibrary));
    return () => {
      isActive = false;
    };
  }, []);

  const names = useMemo(() => (library ? Object.keys(library).filter((name) => name.endsWith('Icon') && Array.isArray(library[name])) : []), [library]);
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/\s+/g, '');
    return (needle ? names.filter((name) => name.toLowerCase().includes(needle)) : names).slice(0, MAX_SHOWN);
  }, [names, query]);

  return (
    <div className="mt-[10px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[10px]">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={library ? `Search ${names.length.toLocaleString()} icons (wrench, home, car...)` : 'Loading icons...'}
        disabled={!library}
        className="h-[36px] w-full rounded-[8px] border border-[#cecece] bg-white px-[10px] text-[14px] text-[#202939] outline-none focus:border-[#1daa61]"
      />
      <div className={`mt-[8px] grid max-h-[240px] grid-cols-6 gap-[6px] overflow-y-auto ${isBusy ? 'pointer-events-none opacity-50' : ''}`}>
        {library &&
          shown.map((name) => (
            <button
              key={name}
              type="button"
              title={name.replace(/Icon$/, '')}
              onClick={() => onChoose(name.replace(/Icon$/, ''), library[name])}
              className="flex aspect-square cursor-pointer items-center justify-center rounded-[8px] bg-white text-[#202939] hover:bg-[#d7fdd2]"
            >
              <HugeiconsIcon icon={library[name] as never} size={22} />
            </button>
          ))}
        {library && shown.length === 0 && <p className="col-span-6 p-[12px] text-center text-[13px] font-medium text-[#697586]">No icon matches.</p>}
      </div>
      <p className="mt-[8px] text-[11px] font-medium text-[#697586]">Icons by Hugeicons. Showing the first {MAX_SHOWN}; search to narrow down.</p>
    </div>
  );
}
