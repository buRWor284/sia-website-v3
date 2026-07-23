# FactcheckIQ grade-model comparison

Generated: 2026-07-22T17:16:09.419Z

- Model A: `claude-opus-4-8` (Opus 4.8)
- Model B: `claude-sonnet-5` (Sonnet 5) — extended thinking DISABLED
- Claim set: 1 claim(s): seo-09

Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.

## Per-claim verdicts

| Claim | Golden | Opus 4.8 | match | Sonnet 5 | match |
| --- | --- | --- | --- | --- | --- |
| seo-09 * | verified | misleading | MISS | check_failed | skip |

`*` marks claims where the two models disagree with each other.

## Totals

| Model | Accuracy vs golden | Web searches | Est. cost |
| --- | --- | --- | --- |
| Opus 4.8 (`claude-opus-4-8`) | 0/1 (0%) | 4 | $0.1768 |
| Sonnet 5 (`claude-sonnet-5`) | 0/0 (n/a) | 0 | n/a |

Incomplete (check_failed, excluded from accuracy): Opus 4.8 0, Sonnet 5 1.

## Token usage

| Model | Input | Cache read | Cache write | Output | Web searches |
| --- | --- | --- | --- | --- | --- |
| Opus 4.8 | 700 | 76727 | 4011 | 2795 | 4 |
| Sonnet 5 | 0 | 0 | 0 | 0 | 0 |

- Opus 4.8 price: $5/$25 per MTok
- Sonnet 5 price: $2/$10 per MTok (intro pricing thru 2026-08-31; standard $3/$15 after)
