# Tester 1 — Access and administration

## How to test

URL: http://192.168.0.104:8080. Obtain approved administrator and limited-role
test accounts from the coordinator; never record passwords here. Use only QA
accounts/records named `QA-T1-<name>`. Do not edit staff accounts or shared roles.
Ask the coordinator to prepare an isolated role for permission changes.

Fill Status with `Not tested`, `Passed`, `Failed`, or `Blocked`. Record actual
results and screenshot/issue links in Notes; use Blocked for missing setup.
Do not mark a row Passed unless every expected result was checked. On failure,
record URL, time, inputs, expected/actual result and browser; never include secrets.
For a retest append its date/result without erasing the initial failure.
Use an approved QA database: this deployment contains historical business data.
Delete only your own disposable records; permanent deletion requires approval.

Tester: ______  Date: ______  Backend/frontend revisions: ______ / ______
Browser/OS: ______  Accounts/roles: ______  Approved environment: ______

## Tests

| ID | Scenario / page | What to do | Expected result | Status | Notes / issue |
|---|---|---|---|---|---|
| A01 | `/auth/login` | Sign in with valid test credentials; refresh. | Orders opens; user and role navigation persist. | Not tested | |
| A02 | Invalid login | Submit wrong password, then correct it. | Clear error; no authenticated session until correct login. | Not tested | |
| A03 | Login throttling | With coordinator approval, fail a disposable account repeatedly; retry after configured window. | Attempts are limited; waiting allows recovery. | Not tested | |
| A04 | Remember me / logout | Sign in with remember enabled; close/reopen browser; then log out and revisit protected URL. | Remember flow works; logout removes access and recovery token. | Not tested | |
| A05 | Session expiry | Coordinator supplies short-lived session; wait, then save a QA form. | Expiry produces recoverable feedback, not false success. | Not tested | |
| A06 | `/auth/register` | Register a unique QA email; test duplicate email, mismatched and short password. | Valid registration succeeds; invalid inputs explain failure. | Not tested | |
| A07 | `/password/email` | Request reset for QA mailbox; follow delivered link, reset, reuse link. | Approved delivery/link works; old password fails; token is single-use. Block if SMTP disabled. | Not tested | |
| A08 | Guest / limited role | Open protected pages directly and via menus in private browser. | No protected data for guests; restricted operations denied for limited role. | Not tested | |
| A09 | `/references/users` | Create QA employee, assign isolated role, edit contact/position; reopen. | Values and role persist; passwords never shown. | Not tested | |
| A10 | Employee password | Save without password change, then explicitly replace password. | Original password retained first; replacement works afterward. | Not tested | |
| A11 | Fired/deleted account | Mark only QA account fired; test login; restore permitted state afterward. | Fired/deleted account cannot log in; approved restoration works. | Not tested | |
| A12 | `/options/permissions` | Toggle one permission on isolated QA role; save, sign in again, revert. | Matrix persists; relevant access changes; other roles unaffected. | Not tested | |
| A13 | `/options/main` | Open from menu and direct URL; compare displayed settings to approved values. | Authorized read-only settings appear. Record missing UI as failure, not exclusion. | Not tested | |
| A14 | History/lifecycle gates | With separate limited and privileged accounts test deleted-user visibility, restore and permanent-delete actions. | Actions match permissions; no bypass through direct URL. | Not tested | |
| A15 | Browser/navigation | Use keyboard, mobile width, back/forward and refresh on these pages. | Focus visible; navigation reachable; no lost route or unreadable controls. | Not tested | |

## Finish

Remove your QA accounts only with approval; revert QA role assignments. List
remaining test records/issues here: ______. Module verdict: ______.