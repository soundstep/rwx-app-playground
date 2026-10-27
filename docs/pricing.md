# RWX pricing notes

Notes for the demo, recorded 2026-10-27. Sources are the RWX docs (`rwx docs pull /pricing`, `/self-hosted`, `/runner`) unless stated otherwise. Rates change, so re-check before quoting them.

## Is it expensive?

Per minute, RWX is higher than GitHub Actions at list price. The total depends on how many minutes you actually run, and caching is meant to reduce that.

| | Per minute | Source |
|---|---|---|
| RWX 2 vCPU, 8 GB (the default runner) | $0.0084 | Computed: 2 x $0.00007 per vCPU-second x 60 |
| RWX 4 vCPU, 16 GB | $0.0168 | Same formula |
| RWX 8 vCPU, 32 GB | $0.0336 | Same formula |
| GitHub Actions Linux 2-core | $0.006 | **Unverified.** Third-party pages quoting the [GitHub runner pricing reference](https://docs.github.com/en/billing/reference/actions-runner-pricing), September 2026. The GitHub excerpt I saw only showed the 1-core rate ($0.002). |

At the same size RWX is about 40% higher per minute.

Billing granularity also differs:

- RWX bills compute per second, with a 1-minute minimum per runner size per run.
- GitHub rounds each job up to the next minute.

## RWX rate card

| Item | Rate |
|---|---|
| Compute, general purpose (4 GB per vCPU) | $0.00007 per vCPU-second |
| Compute, compute optimized (2 GB per vCPU) | $0.000062 per vCPU-second |
| Compute, memory optimized (8 GB per vCPU) | $0.000092 per vCPU-second |
| Disk | 50 GB free, then $0.000005 per second per 100 GB increase (60 second minimum per task) |
| Cache storage | 100 GB free, plus 2 GB per compute hour. Beyond that, $0.00164 per GB per day. Cache is kept 7 days. |
| Artifact storage | 10 GB free, plus 250 MB per compute hour. Beyond that, $0.00164 per GB per day. Kept 14 days by default. |
| External data transfer | 25 GB per month free, plus 500 MB per compute hour. Beyond that, $0.15 per GB. |
| Logs | Free within 28 days and 5 MiB per task. Longer retention $0.00164 per GB per day. |
| Static IPs | $100 per month flat, optional |
| SSO | $100 per month |
| SCIM directory sync | $100 per month per mapped directory |

## What decides the total

- **Executed minutes.** A cache hit runs no task, so it costs no compute. In the runs measured for this demo, `pnpm-install`, `test-guides` and `test-reference` were cache hits on the pushed runs. If caching cuts executed minutes by more than about 30%, RWX is cheaper than GitHub at the rates above. That break-even is arithmetic ($0.006 / $0.0084 is about 0.71), not a measurement of your pipelines.
- **Failed pushed runs.** An agent that runs CI before pushing means fewer failed runs in CI. That saves minutes only if you count them.
- **Runner sizes.** Each runner size used in a run has its own 1-minute minimum, so many differently sized tasks can raise the bill.

## Self-hosted runners

- **Not documented:** how self-hosted runners are priced, whether compute is discounted or free, and whether there is a platform fee. The pricing page does not mention them, and `/docs/self-hosted` only says to contact RWX to enable the feature.
- **What the docs say stays in RWX:** the orchestration and data planes (`/docs/runner`).
- **Inference, unconfirmed:** the separately billed items above (cache, artifacts, data transfer, logs, SSO) likely still apply, and you would also pay AWS for the runner instances.

## What is not known

- Whether RWX has a free compute allowance. The pricing page lists free allowances for cache, artifacts, data transfer and logs, but I did not see one for compute.
- The real executed-minutes ratio for a larger pipeline. This repo is too small to be representative.
- The exact GitHub Actions rate for your runner sizes and plan, including included minutes on private repos.

## How to get real numbers

1. Take current GitHub Actions minutes per month for a few real pipelines, and the share spent on repeated work.
2. Run the same pipelines on RWX with filters in place, and compare executed minutes. `rwx billing` shows usage.
3. Ask RWX support (https://www.rwx.com/support) how self-hosted runners are priced and what the platform fee is.
