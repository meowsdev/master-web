'use client';

import { useEffect } from 'react';

// Replaces the root layout, so it carries its own <html>, <body> and styles.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <style>{`
          body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
            background:#efeae2;color:#111b21}
          .card{max-width:28rem;margin:1rem;padding:2rem;border-radius:1rem;background:#fff;
            text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.12)}
          h1{font-size:1.5rem;margin:0 0 .5rem}
          p{margin:0 0 1.5rem;font-size:.875rem;line-height:1.6;color:#667781}
          button{border:0;border-radius:999px;background:#008069;color:#fff;
            padding:.65rem 1.4rem;font-size:.875rem;font-weight:500;cursor:pointer}
          button:hover{background:#006e5a}
          small{display:block;margin-top:1rem;font-size:.75rem;color:#667781}
          @media (prefers-color-scheme:dark){
            body{background:#0b141a;color:#e9edef}
            .card{background:#202c33}
            p,small{color:#8696a0}
          }
        `}</style>
        <div className="card" role="alert">
          <h1>Something went wrong</h1>
          <p>
            The application hit a critical error. Please try again, and if it
            keeps happening, contact support.
          </p>
          <button type="button" onClick={() => retry()}>
            Try again
          </button>
          {error.digest && <small>Reference: {error.digest}</small>}
        </div>
      </body>
    </html>
  );
}
