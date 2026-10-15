export function fadeInSteps(target: number, durationMs: number, stepMs: number): number[] {
  const count = Math.max(1, Math.round(durationMs / stepMs));
  return Array.from({ length: count }, (_, index) => {
    const progress = (index + 1) / count;
    return Number((target * progress * progress).toFixed(4));
  });
}
