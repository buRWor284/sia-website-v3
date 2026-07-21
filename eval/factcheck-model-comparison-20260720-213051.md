# FactcheckIQ grade-model comparison

Generated: 2026-07-20T16:30:51.342Z

- Model A: `claude-opus-4-8` (Opus 4.8)
- Model B: `claude-sonnet-5` (Sonnet 5)
- Claim set: 5 claim(s): wb-01, wb-08, seo-01, seo-10, planted-01

Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.

## Per-claim verdicts

| Claim | Golden | Opus 4.8 | match | Sonnet 5 | match |
| --- | --- | --- | --- | --- | --- |
| wb-01 | verified | check_failed | skip | check_failed | skip |
| wb-08 | unverifiable | check_failed | skip | check_failed | skip |
| seo-01 | unverifiable | check_failed | skip | check_failed | skip |
| seo-10 | verified | check_failed | skip | check_failed | skip |
| planted-01 | fabricated | fabricated | ok | fabricated | ok |

`*` marks claims where the two models disagree with each other.

## Totals

| Model | Accuracy vs golden | Web searches | Est. cost |
| --- | --- | --- | --- |
| Opus 4.8 (`claude-opus-4-8`) | 1/1 (100%) | 0 | n/a |
| Sonnet 5 (`claude-sonnet-5`) | 1/1 (100%) | 0 | n/a |

Incomplete (check_failed, excluded from accuracy): Opus 4.8 4, Sonnet 5 4.

## Token usage

| Model | Input | Cache read | Cache write | Output | Web searches |
| --- | --- | --- | --- | --- | --- |
| Opus 4.8 | 0 | 0 | 0 | 0 | 0 |
| Sonnet 5 | 0 | 0 | 0 | 0 | 0 |

- Opus 4.8 price: $5/$25 per MTok
- Sonnet 5 price: $2/$10 per MTok (intro pricing thru 2026-08-31; standard $3/$15 after)
