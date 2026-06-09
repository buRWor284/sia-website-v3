/**
 * Tiny concurrency + rate limiter for source adapters.
 *
 * A scan fans out ~18 seeds × several sources at once. Strict feeds — SEC EDGAR
 * (10 req/s, and we make 2 calls per seed), GDELT (slow timelinevol), arXiv —
 * start dropping/timing out under that burst, which is the main cause of the
 * "some sources timed out" notice (and of coverage collapsing to neutral).
 *
 * createLimiter caps how many calls run at once and (optionally) spaces their
 * starts. Limiters are module-level so they're shared across a scan and reused
 * on warm serverless instances. Queue waiting does NOT count against a request's
 * own timeout — the AbortController in http.ts only starts once the call runs.
 */
export function createLimiter(opts: { concurrency: number; minIntervalMs?: number }) {
  const concurrency = Math.max(1, opts.concurrency);
  const minIntervalMs = Math.max(0, opts.minIntervalMs ?? 0);
  let active = 0;
  let nextAllowed = 0;
  const queue: (() => void)[] = [];

  const pump = (): void => {
    if (active >= concurrency || queue.length === 0) return;
    const now = Date.now();
    if (now < nextAllowed) {
      setTimeout(pump, nextAllowed - now);
      return;
    }
    nextAllowed = now + minIntervalMs;
    active++;
    const job = queue.shift()!;
    job();
    pump(); // try to start (or schedule) the next one too
  };

  return function run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        Promise.resolve()
          .then(fn)
          .then(resolve, reject)
          .finally(() => {
            active--;
            pump();
          });
      });
      pump();
    });
  };
}
