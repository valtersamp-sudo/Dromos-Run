# Dromos Run - Security Specification

## 1. Data Invariants
1. **User Identity Invariant**: An athlete can only ever read, write, update, or delete their own user profile and workouts (`request.auth.uid == userId`).
2. **Immutability of Ownership & Creation**: The `userId` and `createdAt` properties cannot be modified once written.
3. **Volumetric Boundaries**:
   - `durationMinutes` must be a positive integer $\le 1440$ (24 hours).
   - `caloriesBurned` must be a positive number $\le 15000$ kcal.
   - `distanceKm` must be $\ge 0$.
   - `title` $\le 100$ characters.
   - `notes` $\le 500$ characters.
4. **Strict Key Conformance**: Ghost / shadow fields not defined in the schema are forbidden.
5. **No Blind Global Reads**: Documents in `/users/{userId}` and subcollections are strictly protected against enumeration and unauthorized multi-tenant scraping.

## 2. The "Dirty Dozen" Malicious Payloads (Tested for Rejection)
1. **Payload 01 (ID Spoofing)**: Trying to write to `/users/victim_123` with `auth.uid = attacker_456`. (Blocked by `request.auth.uid == userId`).
2. **Payload 02 (Cross-User Workout Injection)**: Attacker trying to write to `/users/victim_123/workouts/wkt_999`. (Blocked by path gate).
3. **Payload 03 (Ghost Field / Shadow Admin Privilege)**: Writing workout with `isAdmin: true` or `role: 'superadmin'`. (Blocked by key whitelist and schema validation).
4. **Payload 04 (Excessive String Buffer Overflow)**: Workout title of 100,000 characters to trigger memory exhaustion. (Blocked by `title.size() <= 100`).
5. **Payload 05 (Negative / Absurd Values)**: Workout with `durationMinutes: -50` or `caloriesBurned: 99999999`. (Blocked by range bounds).
6. **Payload 06 (Invalid Workout Type Injection)**: Workout with `type: 'crypto_mining'` or `type: '<script>alert(1)</script>'`. (Blocked by enum whitelist).
7. **Payload 07 (Unauthenticated Read Scraping)**: Anonymous read request to `/users/{userId}/workouts`. (Blocked by `isSignedIn()`).
8. **Payload 08 (Ownership Reassignment on Update)**: Updating a workout to change `userId` to someone else. (Blocked by `incoming().userId == existing().userId`).
9. **Payload 09 (Creation Timestamp Forgery on Update)**: Updating `createdAt` to overwrite audit trail. (Blocked by immutability check).
10. **Payload 10 (Malformed ID Path Injection)**: Workout ID containing traversal or injection characters like `../../../etc/passwd`. (Blocked by `isValidId()`).
11. **Payload 11 (Non-Numeric Metric Injection)**: Providing a boolean or object for `caloriesBurned`. (Blocked by `is number` check).
12. **Payload 12 (Foreign User Deletion)**: Sending DELETE request to another user's workout document. (Blocked by path ownership gate).
