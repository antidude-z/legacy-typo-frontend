# Tester 2 — Orders and navigation

## How to test

URL: http://192.168.0.104:8080. Obtain approved test accounts and test database
from the coordinator. Historical data is present: create `QA-T2-<name>` records,
never alter genuine orders. Arrange reference customer/manager/bill choices first.

Statuses: `Not tested`, `Passed`, `Failed`, `Blocked`. Complete every expected
check before passing. For failures put URL, time, inputs, actual result and
screenshot/issue link in Notes; missing prerequisites mean Blocked. Never record
passwords or private customer information. Append retest results; keep failures.
Delete only your disposable records; permanent deletion requires approval.

Tester: ______  Date: ______  Backend/frontend revisions: ______ / ______
Browser/OS: ______  Role: ______  Approved environment: ______

| ID | Scenario / page | What to do | Expected result | Status | Notes / issue |
|---|---|---|---|---|---|
| O01 | `/orders` | Compare several approved historical rows to trusted records. | IDs, title, dates, customer, manager, status, quantity and totals agree. | Not tested | |
| O02 | Filters | Exercise each available status, date, number, bill, manager, customer, type and title filter; refresh; reset. | Correct matching rows; persisted filters; reset restores list. | Not tested | |
| O03 | Sorting/pagination | Toggle each sortable header; change pages with filters active. | Stable sort and correct counts/pages; no lost filters. | Not tested | |
| O04 | New book | Use New order menu; set format, title, quantity and volume; save/reopen. | Book values/type persist; format suggestions allow free text. | Not tested | |
| O05 | New poly | Create poly QA order with custom format and quantity; reopen. | Correct type, format and quantity. | Not tested | |
| O06 | New wide | Create wide QA order; set dimensions and quantity; save/reopen. | Numeric dimensions persist without server error. | Not tested | |
| O07 | New souvenir | Create souvenir QA order; save/edit/reopen. | Type-specific form and values work. | Not tested | |
| O08 | General detail | Edit title, dates, deadline, comments, files text, status and sale total. | Exact saved values return after refresh; files field is not falsely treated as upload. | Not tested | |
| O09 | Selectors | Change manager/customer; search and select QA bill, then clear it. | Correct references persist; clear removes bill association. | Not tested | |
| O10 | Copy each type | Copy all four QA order types; edit title; inspect children with Tester 3. | New ID; original unchanged; active nested work copied; bill/status defaults verified. | Not tested | |
| O11 | Tabs | Switch general, design, blanks, compilation, other works and history; refresh/back. | Correct panels; no unintended saves or missing content. | Not tested | |
| O12 | History | Change title/quantity/status; inspect history. | Actor, time and meaningful change recorded; no unrelated history. | Not tested | |
| O13 | Validation/failure | Submit invalid required/numeric fields; simulate offline save and retry. | Clear failure; input retained; no duplicate order or false success. | Not tested | |
| O14 | Lifecycle | Delete QA order; compare limited/privileged visibility; restore; permanently delete approved disposable copy. | Lifecycle and permissions correct; genuine orders untouched. | Not tested | |
| O15 | Historical missing parents | Coordinator selects orphan order; inspect without editing genuine data; edit disposable copy. | Missing references displayed honestly; unrelated save does not silently replace IDs. | Not tested | |
| O16 | Return links | Open order from QA bill and list with filters; save/cancel/back. | Returns to intended same-site page; filters remain usable. | Not tested | |
| O17 | Device/keyboard | Repeat create/edit at narrow width; navigate by keyboard. | Fields/actions usable; no whole-page overflow or trapped focus. | Not tested | |

Remaining QA IDs/issues: ______. Coordinate shared QA order IDs with Testers 3,
5 and 6. Module verdict: ______.