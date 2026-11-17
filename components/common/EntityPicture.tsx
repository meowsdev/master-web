const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/**
 * A service or main service picture inside whatever circle or box the caller draws: the image when the
 * stored value is a link (an upload or a chosen Hugeicon), otherwise the text it holds (an emoji).
 */
export function EntityPicture({ source, fallback = '🛠️' }: { source?: string | null; fallback?: string }) {
  if (source && isImageSource(source)) {
    // eslint-disable-next-line @next/next/no-img-element -- picture links come from the backend's uploads or any host
    return <img src={source} alt="" className="size-full object-cover" />;
  }
  return <span aria-hidden>{source || fallback}</span>;
}
