# FactcheckIQ grade-model comparison

Generated: 2026-07-21T10:36:35.327Z

- Model A: `claude-opus-4-8` (Opus 4.8)
- Model B: `claude-sonnet-5` (Sonnet 5)
- Claim set: 5 claim(s): wb-01, wb-08, seo-01, seo-10, planted-01

Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.

## Per-claim verdicts

| Claim | Golden | Opus 4.8 | match | Sonnet 5 | match |
| --- | --- | --- | --- | --- | --- |
| wb-01 | verified | verified | ok | verified | ok |
| wb-08 | unverifiable | verified | MISS | verified | MISS |
| seo-01 | unverifiable | check_failed | skip | check_failed | skip |
| seo-10 * | verified | misleading | MISS | check_failed | skip |
| planted-01 | fabricated | fabricated | ok | fabricated | ok |

`*` marks claims where the two models disagree with each other.

## Totals

| Model | Accuracy vs golden | Web searches | Est. cost |
| --- | --- | --- | --- |
| Opus 4.8 (`claude-opus-4-8`) | 2/4 (50%) | 11 | $0.5780 |
| Sonnet 5 (`claude-sonnet-5`) | 2/3 (67%) | 14 | $0.4550 |

Incomplete (check_failed, excluded from accuracy): Opus 4.8 1, Sonnet 5 2.

## Token usage

| Model | Input | Cache read | Cache write | Output | Web searches |
| --- | --- | --- | --- | --- | --- |
| Opus 4.8 | 2315 | 200876 | 27440 | 7380 | 11 |
| Sonnet 5 | 3133 | 307181 | 51436 | 11866 | 14 |

- Opus 4.8 price: $5/$25 per MTok
- Sonnet 5 price: $2/$10 per MTok (intro pricing thru 2026-08-31; standard $3/$15 after)
