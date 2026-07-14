# UC-13 Manage Helper Profile — Observations & Gaps

## 1. Terminology & Data Model Conflicts

| UC-13 Field | Existing Model Field | Issue |
|-------------|---------------------|-------|
| `Bio` | **Missing** | No `bio` field in `HelperProfile` schema |
| `Availability` | `workStatus` | UC describes it as working hours/days (text); model stores a single status string like `'available'`. These are semantically different concepts. |
| `Profile Photo` | `avatarUrl` (frontend only) | No `avatarUrl` field in `HelperProfile` schema; no upload endpoint |
| `Skills` | `skills: [String]` | Matches, but UC says "pre-defined skill list" — no skill catalog exists |
| `fullName`, `email`, `age`, `gender`, `address` | **Missing in schema** | `admin.controller.js:63-74` attempts to set these on `HelperProfile.create()`, but the schema doesn't define them. Mongoose silently drops them. |

**Impact**: The current schema cannot satisfy UC-13 without migration.

---

## 2. Security & Authorization Gaps

| Gap | Location | Risk |
|-----|----------|------|
| No ownership check | `helper.router.js:6` | Any authenticated helper can update any other helper's profile via `PUT /api/helpers/:anyUserId` |
| API path mismatch | Frontend uses `/api/helper/` (singular); backend is `/api/helpers/` (plural) | All helper API calls from frontend will 404 |
| `verifyToken` blocks non-active entirely | `auth.middleware.js:22-24` | AF-03 requires Pending helpers to **view** profile but **restrict edits**. Current middleware returns 403 for ALL non-active accounts, blocking both read and write. |

---

## 3. Missing Infrastructure

| Missing | Notes |
|---------|-------|
| Validation library | No `zod`/`joi`/`express-validator`. UC requires: max 500 chars for bio, skill format, image size/quality, mandatory fields. |
| File upload endpoint | `Profile Photo` requires multipart upload. No multer/sharp/cloud storage integration exists. |
| Skill catalog/admin | UC says skills are "selected from pre-defined list" but no skill management API or seed data exists. |
| Re-verification workflow | UC step 6 mentions "triggers profile re-verification if identity-related data was changed." No re-verification queue or notification system exists. |
| Matching engine integration | GB-47 says profile changes must reflect in the matching engine. No matching engine code was found in the explored scope. |
| Edit UI | `HelperAccountPage` is read-only. No edit form, no screen state for profile editing in `HelperApp.tsx`. |

---

## 4. Business Rule Alignment Issues

| Business Rule | Current State | Gap |
|---------------|---------------|-----|
| **GB-03** (Suspended → block actions) | `verifyToken` already returns 403 for non-active. | Does not distinguish between `suspended` (block everything) and `pending` (allow read, block write). |
| **GB-04** (Verified & activated before booking offers) | `HelperProfile.identityVerified` exists; `approveHelper` sets it to `true`. | No enforcement that booking offers check this flag. |
| **GB-47** (Matching engine sync) | Not implemented in explored scope. | Need to define how/where the matching engine reads helper data. |
| **Booking stability** | `Booking` model denormalizes helper fields (`helperName`, `helperSkills`, etc.). | Schema changes to `HelperProfile` won't auto-update existing bookings. Need a migration or sync strategy. |

---

## 5. Critical Questions for Implementation Planning

1. **Schema scope**: Should `bio`, `avatarUrl`, `availability`, `fullName`, `email`, `age`, `gender`, `address` be added to `HelperProfile`, or should personal info stay in `UserAccount` and `HelperProfile` remain work-specific?

2. **Availability vs workStatus**: Is `Availability` in UC-13 the same as the existing `workStatus` field, or a new field describing working hours/days?

3. **Skill management**: Where does the "pre-defined skill list" come from? Hardcoded enum, admin-managed catalog, or seed data?

4. **Pending account access**: AF-03 says Pending helpers can **view** but not **edit**. Should we add a separate `allowRead` check in middleware/controller, or split the endpoint into GET (public-ish) and PUT (restricted)?

5. **Profile re-verification**: What does "triggers a profile re-verification" mean operationally? Email to admin? New OTP flow? Status change to `in-progress`?

6. **Matching engine**: What is the matching engine, and how does it currently consume `HelperProfile` data? Is it a separate service or module not yet explored?

7. **Booking denormalization**: When helper profile fields change, should existing bookings be backfilled, or is the denormalized snapshot acceptable per UC-13's "must not disrupt existing booking details"?
