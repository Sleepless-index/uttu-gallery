const STAGGER_MS = 20;
const STAGGER_CAP_MS = 200;

export function searchResultDelayStyle(index: number): React.CSSProperties {
  const delay = Math.min(index * STAGGER_MS, STAGGER_CAP_MS);
  return { "--search-result-delay": `${delay}ms` } as React.CSSProperties;
}
