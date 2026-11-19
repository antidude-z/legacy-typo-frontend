# Tester 6 — Reports, documents and payroll

## How to test

URL: http://192.168.0.104:8080. Ask coordinator for approved QA data/account,
calculated orders of all four types, bills and a trusted payroll example. Work
only on `QA-T6-` records; never mark a genuine payroll paid. Coordinate bill and
order IDs with Testers 2/3/5. Downloaded historical documents may be confidential.

Statuses: `Not tested`, `Passed`, `Failed`, `Blocked`. Record file name, record
ID, expected/actual amounts, URL/time, viewer/browser and evidence/issue link in
Notes. Missing expected business values or printer means Blocked, not Passed.
Append retests without erasing initial failures. Do not attach private documents
to public issues. Record absent controls/reports as failures unless explicitly
excluded below. Permanent deletion requires approval.

Tester: ______  Date: ______  Backend/frontend revisions: ______ / ______
Browser/role: ______  Environment: ______  Spreadsheet/PDF viewer: ______

| ID | Scenario / page | What to do | Expected result | Status | Notes / issue |
|---|---|---|---|---|---|
| D01 | Report discovery | Open calculated QA order/bill; inspect report actions. | Applicable reports present; prohibited/unsupported reports explained. | Not tested | |
| D02 | Transcript | Open calculation transcript for fixed example. | Components, quantities, totals and markup agree with approved calculation. | Not tested | |
| D03 | Passport PDF | Generate book/poly/souvenir passports; inspect all production fields. | Correct order/customer/dates/quantity/materials; readable Russian and signatures. | Not tested | |
| D04 | Wide passport | Generate wide order passport with known dimensions/material. | Correct area/dimensions/process information; no clipped content. | Not tested | |
| D05 | Economy XLS | Generate regular and wide economies; verify component sum and per-item value. | Correct markup/rounding; wide blank cost counted once; sale total remains separate. | Not tested | |
| D06 | Design XLS | Generate QA design order with known design cost. | Correct metadata/checklist and approved design-cost rule; no missing required field. | Not tested | |
| D07 | Payment form/XLS | On QA bill enter institute/customer and generate; repeat with blanks. | Submitted text and configured signatories shown; documented fallback behavior. | Not tested | |
| D08 | Payment totals | Use two QA linked orders with known quantities/sale totals, including zero quantity. | Correct row unit prices and overall total; no division error. | Not tested | |
| D09 | Shipping form/PDF | Choose accountant and generate QA multi-order bill shipping document. | Selected accountant, configured signatories, rows and total correct. | Not tested | |
| D10 | Linked-order documents | Open bill's order-document collection, follow each link. | Each PDF/XLS belongs to intended linked order; no unrelated/deleted order. | Not tested | |
| D11 | `/options/reports` | On QA copy/configuration edit supported format/orientation/download and parameter defaults; generate; revert. | Configured values reflected; filenames and open/download behavior correct. | Not tested | |
| D12 | Output handling | Open files in team viewers; compare Russian text, symbols, dates and decimals; print representative PDF/XLS pages. | Correct sheets, margins, page breaks, signatures/legal text, no clipping or repair warning. | Not tested | |
| D13 | Missing/deleted data | Generate empty QA bill; missing calculation order; deleted bill; status-blocked order. | Empty output or clear documented error; no crash or misleading successful document. | Not tested | |
| D14 | `/reports/payrolls/create` | Select QA manager/month/year; reopen same period. | Intended statement created/reused; eligible orders belong to expected scope. | Not tested | |
| D15 | Payroll eligibility | With coordinator prepare active/deleted QA orders and paid/closed/filed bill combinations. | Only expected eligible records included; no unexplained historical entry. | Not tested | |
| D16 | Payroll amounts | Use approved materials/works/contractor costs; set percentage and salary; save/reopen. | Per-order and monthly totals agree with trusted manual arithmetic. | Not tested | |
| D17 | Paid snapshot | Mark disposable QA statement paid; attempt edit; export repeatedly. | Paid values immutable; repeated read/export preserves snapshot. | Not tested | |
| D18 | Payroll XLS | Export calc and paid QA statements; compare rows, sums, salary and monthly total. | Workbook agrees with statement and trusted totals. | Not tested | |
| D19 | Permissions/failures | Try exports/settings/payroll writes with limited role; network failure during generation. | Correct denial/feedback; no false success, duplicate save or leaked unrelated data. | Not tested | |

Payment PDF is intentionally inactive; supported payment output is XLS. Physical
printing and business/signatory approval are essential; automated tests cannot
approve them. Revert QA report settings. Remaining QA records/files/issues:
______. Business document/payroll approver and verdict: ______.