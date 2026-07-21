# FactcheckIQ grade-model comparison

Generated: 2026-07-20T16:12:36.761Z

- Model A: `claude-opus-4-8` (Opus 4.8)
- Model B: `claude-sonnet-5` (Sonnet 5)
- Claim set: 1 claim(s): planted-01

Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.

## Per-claim verdicts

| Claim | Golden | Opus 4.8 | match | Sonnet 5 | match |
| --- | --- | --- | --- | --- | --- |
| planted-01 | fabricated | fabricated | ok | fabricated | ok |

`*` marks claims where the two models disagree with each other.

## Totals

| Model | Accuracy vs golden | Web searches | Est. cost |
| --- | --- | --- | --- |
| Opus 4.8 (`claude-opus-4-8`) | 1/1 (100%) | 0 | n/a |
| Sonnet 5 (`claude-sonnet-5`) | 1/1 (100%) | 0 | n/a |

## Token usage

| Model | Input | Cache read | Cache write | Output | Web searches |
| --- | --- | --- | --- | --- | --- |
| Opus 4.8 | 0 | 0 | 0 | 0 | 0 |
| Sonnet 5 | 0 | 0 | 0 | 0 | 0 |

- Opus 4.8 price: $5/$25 per MTok
- Sonnet 5 price: $2/$10 per MTok (intro pricing thru 2026-08-31; standard $3/$15 after)
