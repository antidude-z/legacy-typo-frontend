# Tester 4 — Reference directories

## How to test

URL: http://192.168.0.104:8080. Obtain approved test accounts/database. Prefix
everything `QA-T4-`. Never modify production printers, papers, definitions or
shared units: these affect historical and newly calculated orders.

Statuses: `Not tested`, `Passed`, `Failed`, `Blocked`. For each failure record
route, record ID, inputs, actual result, timestamp and screenshot/issue link.
Blocked means a prerequisite is unavailable. Append retest result/date rather
than erasing failures. Do not write secrets or personal customer information.
For each directory, refresh after save and test list sorting/pagination where
present. Delete only QA records; permanent deletion needs coordinator approval.

Tester: ______  Date: ______  Backend/frontend revisions: ______ / ______
Browser/role: ______  Approved environment: ______

| ID | Scenario / page | What to do | Expected result | Status | Notes / issue |
|---|---|---|---|---|---|
| R01 | `/options/paper-type` | Create/edit QA type; cancel an edit; refresh list. | Saved text persists; cancel doesn't alter existing value. | Not tested | |
| R02 | `/options/paper-format` | Create/edit QA format dimensions; invalid numeric input. | Valid dimensions persist; invalid data rejected. | Not tested | |
| R03 | `/options/measures` | Add unit and abbreviation including harmless punctuation. | Correct text rendering, sorting and validation. | Not tested | |
| R04 | `/references/paper` | Add paper with QA type/format/density; edit; reopen. | Generated title and selected properties agree. | Not tested | |
| R05 | `/references/materials` | Add material, unit, work type, production flags/description; use filters then reset. | Data persists; filters survive refresh and reset correctly. | Not tested | |
| R06 | `/references/printers` | Create QA printer; edit production/imagesetter flags. | Correct flags and child navigation. | Not tested | |
| R07 | Printer fields | Add/edit field dimensions, cut dimensions/count and paper format. | Parent retained; valid dimensions saved; other printer untouched. | Not tested | |
| R08 | Printer processes | Add/edit front/back colors, resolution and rejection. | Values persist; process attached only to correct printer. | Not tested | |
| R09 | Process stages | Add/edit together, waste, colors/order; follow pricing link. | Stage values, ordering and correct pricing history. | Not tested | |
| R10 | `/references/prepresses` and `/references/redactions` | Create/edit QA definitions; invalid empty name; lifecycle. | Validation and saved definitions work without invented production data. | Not tested | |
| R11 | `/references/afterprints` | Inspect definition, tooltip and existing parameter/select values; edit supported fields. | Configured data shown; absence of parameter CRUD is expected. | Not tested | |
| R12 | Afterprint hierarchy | Add QA stage with weight limits/together/waste/fitting; assign compatible material and decimal quantity. | Parent/material compatibility and values persist. | Not tested | |
| R13 | `/references/compiles` | Create/edit QA work with fitting/production flags. | Correct flags and fitting stored. | Not tested | |
| R14 | Compilation hierarchy | Add stage and material; edit decimal quantity; follow price links. | Correct parent and pricing target; no cross-record changes. | Not tested | |
| R15 | `/options/customer-group` | Create/edit QA group; test list navigation. | Group available to QA customer. | Not tested | |
| R16 | `/references/customers` | Create QA customer with group, phone, leading-zero INN, address, notes. | Text/leading zeros preserved after edit/refresh. | Not tested | |
| R17 | Lifecycle across families | For each tested family soft-delete and restore QA record; verify limited-user visibility; approved permanent deletion only. | Permission-controlled actions; active selectors exclude deleted entries. | Not tested | |
| R18 | Historical/empty states | Inspect approved missing-group customer and empty directory; test invalid reference in disposable record. | Readable unavailable choice; no silent repair or crash. | Not tested | |
| R19 | Responsive/keyboard | Narrow screen, keyboard navigation and save errors on nested editor. | Reachable controls, visible feedback, values retained on failure. | Not tested | |

Remove dependent QA children before parents where appropriate. No customer
contact or customer-payer assignment editor is expected. Remaining QA IDs:
______. Module verdict: ______.