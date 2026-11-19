# Tester 5 — Accounting

## How to test

URL: http://192.168.0.104:8080. Obtain approved accounting-edit and read-only
accounts/database. Create `QA-T5-` payers/bills/orders only; never change genuine
payments or financial status flags. Coordinate QA order IDs with Tester 2.

Statuses: `Not tested`, `Passed`, `Failed`, `Blocked`. Record amounts, IDs,
actual results, URL/time and screenshot/issue links in Notes. Missing setup means
Blocked. Append dated retest results without deleting original failures. Never
include credentials, real bank details or private personal data in evidence.
Delete only disposable records; permanent deletion needs approval.

Tester: ______  Date: ______  Backend/frontend revisions: ______ / ______
Browser/roles: ______  Approved environment: ______

| ID | Scenario / page | What to do | Expected result | Status | Notes / issue |
|---|---|---|---|---|---|
| B01 | `/accounting/payers` | Create/edit QA payer: name, commission, INN with leading zeros, contacts and notes. | Values persist; numeric/schema validation clear. | Not tested | |
| B02 | Payer lifecycle | Delete/restore QA payer; compare privileged/limited views; approved permanent-delete copy. | Correct lifecycle visibility and permissions. | Not tested | |
| B03 | `/accounting/bills` | Inspect approved historical examples; sort/page. | Bill/payer/manager/date/amount/currency/status agree with trusted record. | Not tested | |
| B04 | Bill filters | Number, manager, payer, date range; refresh; reset; submit reversed dates. | Correct persistent results; invalid dates rejected without corrupting prior filter. | Not tested | |
| B05 | New bill | Create QA bill with manager, payer, date, number, currency and amount. | Save/reopen retains all values; no duplicate creation. | Not tested | |
| B06 | Bill editing | Change amount and paid/closed/filed flags independently; reopen. | Each flag remains independent of payment total. | Not tested | |
| B07 | Payment totals | Add 100.25 and 49.75 payments to QA bill; edit second to 59.75. | Totals 150.00 then 160.00, with correct dates and precision. | Not tested | |
| B08 | Payment navigation | Change bill field then open payment from editor; repeat with invalid unsaved bill. | Valid bill saved before navigation; invalid save blocks navigation and retains values. | Not tested | |
| B09 | Payment lifecycle | Delete 59.75 payment; restore it; approved permanent deletion. | Total changes to 100.25 then 160.00; deleted rows excluded. | Not tested | |
| B10 | Ownership | Ask coordinator for two QA bills; attempt to open payment using the wrong parent URL. | Not found/denied; no payment moved or changed. | Not tested | |
| B11 | Linked orders | Link two QA orders with sale totals 100 and 200 using order bill search. | Bill shows both; linked-order sum 300 independently of bill/payment totals. | Not tested | |
| B12 | Order return navigation | Open linked order, edit QA field, save/back. | Correct order and return to intended bill page. | Not tested | |
| B13 | Read-only bill | Open detail and edit routes as read-only user. | Permitted view works; writes/mutation controls denied appropriately. | Not tested | |
| B14 | Missing parents | Inspect approved orphan bill; edit disposable copy without changing missing payer/manager. | Unavailable selections visible and retained; no new fake parent. | Not tested | |
| B15 | Bill lifecycle | Soft-delete/restore QA bill; test deleted linked bill handling. | Permission-correct behavior; no unexpected deletion of orders. | Not tested | |
| B16 | Reports entry points | Open payment/shipping forms and linked-order documents; coordinate output approval with Tester 6. | Correct bill/order IDs and usable links; blocked reports explained. | Not tested | |
| B17 | Failure/navigation | Invalid payment date/amount, offline save, refresh/deep link, narrow screen. | Clear error, preserved values, readable two-decimal amounts and usable navigation. | Not tested | |

Remove only QA payments/orders/bills in approved dependency order. Bills select
payers globally; no customer-specific payer editor is expected. Remaining QA
IDs/issues: ______. Module verdict: ______.