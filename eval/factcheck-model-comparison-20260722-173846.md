# FactcheckIQ grade-model comparison

Generated: 2026-07-22T12:38:46.373Z

- Model A: `claude-opus-4-8` (Opus 4.8)
- Model B: `claude-sonnet-5` (Sonnet 5)
- Claim set: 5 claim(s): wb-08, wb-09, seo-04, seo-09, planted-01

Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.

## Per-claim verdicts

| Claim | Golden | Opus 4.8 | match | Sonnet 5 | match |
| --- | --- | --- | --- | --- | --- |
| wb-08 * | unverifiable | verified | MISS | unverifiable | ok |
| wb-09 * | verified | verified | ok | check_failed | skip |
| seo-04 * | verified | verified | ok | check_failed | skip |
| seo-09 * | verified | verified | ok | check_failed | skip |
| planted-01 | fabricated | fabricated | ok | fabricated | ok |

`*` marks claims where the two models disagree with each other.

## Totals

| Model | Accuracy vs golden | Web searches | Est. cost |
| --- | --- | --- | --- |
| Opus 4.8 (`claude-opus-4-8`) | 4/5 (80%) | 16 | $0.7991 |
| Sonnet 5 (`claude-sonnet-5`) | 2/2 (100%) | 4 | $0.1327 |

Incomplete (check_failed, excluded from accuracy): Opus 4.8 0, Sonnet 5 3.

## Token usage

| Model | Input | Cache read | Cache write | Output | Web searches |
| --- | --- | --- | --- | --- | --- |
| Opus 4.8 | 2972 | 321827 | 31804 | 10584 | 16 |
| Sonnet 5 | 754 | 18222 | 24832 | 2545 | 4 |

- Opus 4.8 price: $5/$25 per MTok
- Sonnet 5 price: $2/$10 per MTok (intro pricing thru 2026-08-31; standard $3/$15 after)
