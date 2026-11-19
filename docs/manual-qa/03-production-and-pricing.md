# Tester 3 — Blanks, operations and pricing

## How to test

URL: http://192.168.0.104:8080. Ask coordinator for approved QA accounts,
disposable orders of all four types, production references and expected costs.
Prefix new records `QA-T3-`. Never change genuine reference prices: changes can
affect many orders. Use dedicated QA references/price histories only.

Statuses: `Not tested`, `Passed`, `Failed`, `Blocked`. Put actual results, input
numbers, URL, time and screenshot/issue links in Notes. Missing trusted expected
costs mean Blocked, not Passed. Keep first failure when appending a retest.
Permanent deletion requires approval. No credentials/private data in this file.

Tester: ______  Date: ______  Backend/frontend revisions: ______ / ______
Browser/role: ______  Environment: ______  QA order IDs: ______

| ID | Scenario / page | What to do | Expected result | Status | Notes / issue |
|---|---|---|---|---|---|
| P01 | Order blank | Add/edit QA blank with title, dimensions, quantity structure, colors and comments; reopen. | Values persist and belong only to chosen order. | Not tested | |
| P02 | Dependent paper choices | Change paper type, format and weight sequentially. | Options narrow correctly; selected paper matches all choices. | Not tested | |
| P03 | Printer choices | Change printer, process and field/cutting preset. | Production-compatible options and dimensions; stale choice not silently reused. | Not tested | |
| P04 | Imagesetter | Use printer requiring plates; edit count/self-print/fixed settings available in UI. | State persists; applicable cost explained. Record absent required control. | Not tested | |
| P05 | Afterprint parameters | Add text/select parameters and quantity; save/edit/reopen. | Assignment and parameter values retained. | Not tested | |
| P06 | Blank copy/lifecycle | Copy blank, change copy; delete/restore; test approved permanent-delete flow. | Independent copied settings; lifecycle obeys permissions. | Not tested | |
| P07 | Prepress/redaction | Add, edit decimal quantities, remove and restore QA work. | Decimal values retained; correct operation/reference and costs. | Not tested | |
| P08 | Compilation | Add work with fitting flag; edit quantity; recalculate. | Fitting and quantity reflected in production calculation. | Not tested | |
| P09 | Other work | Create/edit contractor work and assigned price through available controls. | Correct quantity/price persisted and included in total; unsupported workflow reported. | Not tested | |
| P10 | Copy nested order | Inspect Tester 2 copied order including blanks, parameters, operations and markups. | Active children copied independently; deleted children excluded. | Not tested | |
| P11 | Price catalogs | Open `/prices/paper`, `/prices/print`, `/prices/materials`, `/prices/prepress`, `/prices/redaction`, `/prices/afterprint`, `/prices/compile`, `/prices/compiles`, `/prices/services`. | Each catalog and item history loads with meaningful labels. | Not tested | |
| P12 | QA price history | Add effective date, threshold, currency and amount; edit/cancel; delete with confirmation. | History/order/navigation correct; cancellation/draft behavior understood. | Not tested | |
| P13 | Calculation by type | For book/poly/wide/souvenir enter coordinator's fixed example and recalculate. | Components, total and per-item price equal trusted expectations. | Not tested | |
| P14 | Markups/sale total | Toggle component markups, use fractional percentage; set manual sale total; recalculate twice. | Active rules applied; sale total unchanged; repeat result stable. | Not tested | |
| P15 | Boundaries/currency | Use approved zero/fractional/rounding, one/two-pass and RUB/USD/EUR examples. | No exception; expected tiers, exchange rates and rounding. | Not tested | |
| P16 | Missing data | Use disposable missing-price/process/material case. | Explicit missing-data feedback; no fabricated successful result. | Not tested | |
| P17 | Refresh/permissions | Mutate work/blank; check refreshed calculation; retry pricing as limited user. | Updated breakdown; restricted writes denied without affecting stored price. | Not tested | |

Expected-value worksheet/evidence links: ______. Remaining QA records: ______.
Module verdict: ______.