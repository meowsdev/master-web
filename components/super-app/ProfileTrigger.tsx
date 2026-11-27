'use client';

import { createContext, ReactNode, useContext } from 'react';

/** Opens the Edit Profile panel on the right: the same action as the rail's profile picture. Set in app/page.tsx. */
const OpenProfileContext = createContext<(() => void) | null>(null);

export const OpenProfileProvider = OpenProfileContext.Provider;

/**
 * Makes a sidebar header's photo or name open the profile panel, like the rail's profile icon.
 * Outside the provider it renders the children unchanged, so a header never breaks without it.
 */
export function ProfileTrigger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const openProfile = useContext(OpenProfileContext);
  if (!openProfile) return <>{children}</>;
  return (
    <button type="button" onClick={openProfile} title="Profile" className={`cursor-pointer text-left ${className}`}>
      {children}
    </button>
  );
}
