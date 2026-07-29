# FactcheckIQ grade-model comparison

Generated: 2026-07-29T11:09:33.554Z

- Model A: `claude-opus-4-8` (Opus 4.8)
- Model B: `claude-sonnet-5` (Sonnet 5)
- Claim set: 6 claim(s): wb-05, seo-01, seo-07, seo-10, planted-03, planted-04

Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.

## Per-claim verdicts

| Claim | Golden | Opus 4.8 | match | Sonnet 5 | match |
| --- | --- | --- | --- | --- | --- |
| wb-05 | misleading | verified | MISS | verified | MISS |
| seo-01 * | unverifiable | unverifiable | ok | check_failed | skip |
| seo-07 * | inaccurate | partly_accurate | MISS | check_failed | skip |
| seo-10 * | verified | misleading | MISS | check_failed | skip |
| planted-03 * | inaccurate | verified | MISS | check_failed | skip |
| planted-04 * | fabricated | misleading | MISS | check_failed | skip |

`*` marks claims where the two models disagree with each other.

## Totals

| Model | Accuracy vs golden | Web searches | Est. cost |
| --- | --- | --- | --- |
| Opus 4.8 (`claude-opus-4-8`) | 1/6 (17%) | 24 | $1.1702 |
| Sonnet 5 (`claude-sonnet-5`) | 0/1 (0%) | 4 | $0.1146 |

Incomplete (check_failed, excluded from accuracy): Opus 4.8 0, Sonnet 5 5.

## Token usage

| Model | Input | Cache read | Cache write | Output | Web searches |
| --- | --- | --- | --- | --- | --- |
| Opus 4.8 | 4078 | 524466 | 41776 | 15459 | 24 |
| Sonnet 5 | 779 | 30425 | 18682 | 2022 | 4 |

- Opus 4.8 price: $5/$25 per MTok
- Sonnet 5 price: $2/$10 per MTok (intro pricing thru 2026-08-31; standard $3/$15 after)
