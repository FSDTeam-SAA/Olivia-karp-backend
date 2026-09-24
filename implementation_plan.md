# Implementation Plan: Meet Climate People Feature & Mighty Networks Integration

Integrate the official **Mighty Networks API** with the **Act on Climate** platform (`Olivia-karp-backend` and `olivia-karp-dashboard`) to introduce the **Meet Climate People** member directory feature. This allows community members to showcase professional profiles and visitors to discover, search, and connect with climate talent.

---

## 1. System Architecture Overview

```
                      Mighty Networks API (https://api.mn.co/admin/v1)
                                   │
                                   │ Bearer API Key (Real MN Network ID 21482781)
                                   ▼
                 ┌──────────────────────────────────────┐
                 │ MightyNetworksService (Backend API)  │
                 └──────────────────┬───────────────────┘
                                    │
                         Sync / Webhook Pipeline
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ MongoDB (MeetClimateProfile Model)   │
                 │ ───────────────────────────────────  │
                 │ - mightyMemberId, name, bio, avatar  │
                 │ - climateInterests, professionalAreas│
                 │ - experience, skills, education      │
                 │ - lookingFor, canHelpWith, links     │
                 │ - isVisible, lastSyncedAt            │
                 └──────────────────┬───────────────────┘
                                    │
                   GET /api/v1/meet-climate-people
                   GET /api/v1/meet-climate-people/:id
                   POST /api/v1/meet-climate-people/sync (Admin)
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Next.js Frontend (olivia-karp-dashboard)              │
       │ ────────────────────────────────────────────────────── │
       │ 1. Public Directory: /meet-climate-people              │
       │    - Hero & "Become a Member" CTA                      │
       │    - Search (name, skill, org, interests)              │
       │    - Multi-category tag filters (Interests, Areas, etc)│
       │    - Responsive Profile Cards                          │
       │    - Detailed Profile Modal                            │
       │    - Pagination, Loading, Empty & Error States         │
       │ 2. Admin Management: /(dashboard)/meet-climate-people  │
       │    - One-click Sync from Mighty Networks               │
       │    - Member visibility toggle & directory overview     │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Mighty Networks API Capabilities & Verified Endpoints

We verified live connection with the provided `MIGHTY_API_KEY`:
- **Network ID**: `21482781` (Subdomain: `act-on-climate-community.mn.co`)
- **API Base URL**: `https://api.mn.co/admin/v1`
- **Authentication**: `Authorization: Bearer <MIGHTY_API_KEY>`
- **Live Verification**: Successfully verified HTTP 200 responses from `/me` and `/members` (currently 29 real members).

| Feature | Endpoint / Mechanism | Status | Details |
|---|---|---|---|
| **List Members** | `GET /admin/v1/networks/{network_id}/members?page={p}&per_page={n}` | **Available** | Returns members with `id`, `first_name`, `last_name`, `email`, `avatar`, `bio`, `location`, `permalink`, `time_zone`, `created_at` |
| **Single Member** | `GET /admin/v1/networks/{network_id}/members/{id}/` | **Available** | Returns full member details |
| **Tags & Badges** | `GET /admin/v1/networks/{network_id}/tags`<br>`GET /admin/v1/networks/{network_id}/members/{id}/tags` | **Available** | Returns network tags (#climatescience, #wildfires, etc.) and tags assigned to members |
| **Custom Fields & Answers** | `GET /admin/v1/networks/{network_id}/custom_fields`<br>`GET /admin/v1/networks/{network_id}/custom_fields/{cf_id}/members/{m_id}/answers` | **Available** | Inspects custom fields configured on the network |
| **Webhooks** | `MemberUpdated`, `MemberJoined`, `MemberLeft`, `CustomFieldResponseUpdated` | **Available** | Inbound webhook handler at `POST /api/v1/mighty/webhook` with secret verification |
| **Scheduled Sync** | Background cron task (`node-cron`) + Admin manual trigger | **Available** | Syncs members periodically (e.g., daily) and on demand |

---

## 3. User Review Required

> [!IMPORTANT]
> - **Mighty Networks Member Data vs. Survey Data**: Mighty Networks member accounts provide standard fields (name, email, avatar, bio, location, tags, badges). Extended career fields (Education, Experience, Looking For, Can Help With, LinkedIn, Portfolio) are mapped from the platform's Survey records (`Survey` collection) or local Profile customization. If a member hasn't yet submitted the survey, their card will gracefully display their Mighty Networks profile (name, avatar, bio, location, community link) with default placeholders/empty handling for optional fields.
> - **Privacy**: Private emails and sensitive authentication data are strictly omitted from public API responses. Only public directory fields are returned.
> - **Admin Protection**: The sync trigger endpoint `POST /api/v1/meet-climate-people/sync` requires the `admin` role using existing JWT auth (`auth("admin")`).

---

## 4. Proposed Changes

### Backend (`Olivia-karp-backend`)

#### [NEW] [meetClimatePeople.interface.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/modules/meetClimatePeople/meetClimatePeople.interface.ts)
- Types for `IMeetClimateProfile`:
  - `mightyMemberId`: string (unique external ID)
  - `name`: string
  - `firstName`?: string
  - `lastName`?: string
  - `email`?: string (internal, indexed, excluded from public response)
  - `professionalTitle`: string
  - `organization`: string
  - `about`: string
  - `climateInterests`: string[]
  - `professionalAreas`: string[]
  - `education`: Array<{ school: string; degree: string; year?: string }> | string[]
  - `experience`: Array<{ title: string; company: string; duration?: string }> | string[]
  - `skills`: string[]
  - `areasOfExpertise`: string[]
  - `lookingFor`: string[]
  - `canHelpWith`: string[]
  - `linkedin`?: string
  - `website`?: string
  - `portfolio`?: string
  - `profileImage`?: string
  - `location`?: string
  - `mightyPermalink`?: string
  - `isVisible`: boolean (default `true`)
  - `syncStatus`: "synced" | "manual" | "pending"
  - `lastSyncedAt`: Date

#### [NEW] [meetClimatePeople.model.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/modules/meetClimatePeople/meetClimatePeople.model.ts)
- Mongoose schema with text indexes for search (`name`, `professionalTitle`, `organization`, `skills`, `climateInterests`) and standard indexes on `mightyMemberId`, `isVisible`, and `climateInterests`.

#### [NEW] [mightyNetworks.client.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/modules/meetClimatePeople/mightyNetworks.client.ts)
- Dedicated HTTP client for Mighty Networks REST API:
  - `fetchAllMembers(perPage?: number): Promise<MNMember[]>` (handles pagination until all items fetched)
  - `getMemberById(memberId: string | number): Promise<MNMember>`
  - `getNetworkCustomFields(): Promise<any[]>`
  - `getMemberTags(memberId: string | number): Promise<any[]>`
  - Robust error handling for rate limits (HTTP 429), timeouts, and unauthorized credentials.

#### [NEW] [meetClimatePeople.service.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/modules/meetClimatePeople/meetClimatePeople.service.ts)
- `syncMembersFromMighty(): Promise<{ totalFetched, created, updated, deactivated }>`
  - Fetches members from Mighty Networks.
  - Matches with local `User` and `Survey` models by email / `mightyMemberId` to combine Mighty data with career survey data.
  - Upserts `MeetClimateProfile` records idempotently.
  - Safely deactivates or flags members who left or are inactive.
- `getAllProfiles(query)`:
  - Supports `search`, `climateInterest`, `professionalArea`, `lookingFor`, `page`, `limit`.
  - Projections ensure private information (email, phone, tokens) is never exposed.
  - Returns paginated data + metadata (`page`, `limit`, `total`, `totalPage`).
- `getProfileById(id)`: Returns single public profile.
- `updateProfileVisibility(id, isVisible)`: Admin toggle for profile display.
- `handleMightyWebhook(payload)`: Handles `MemberUpdated`, `MemberJoined`, `MemberLeft`, `CustomFieldResponseUpdated`.

#### [NEW] [meetClimatePeople.controller.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/modules/meetClimatePeople/meetClimatePeople.controller.ts)
- Request handlers wrapping service methods using `catchAsync` and `sendResponse`.

#### [NEW] [meetClimatePeople.routes.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/modules/meetClimatePeople/meetClimatePeople.routes.ts)
- Endpoints:
  - `GET /api/v1/meet-climate-people` (Public)
  - `GET /api/v1/meet-climate-people/:id` (Public)
  - `POST /api/v1/meet-climate-people/sync` (Admin protected: `auth("admin")`)
  - `PATCH /api/v1/meet-climate-people/:id/visibility` (Admin protected: `auth("admin")`)
  - `GET /api/v1/meet-climate-people/sync/status` (Admin protected)
  - Full OpenAPI / Swagger JSDoc documentation tags.

#### [MODIFY] [src/router/index.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/router/index.ts)
- Register `/meet-climate-people` route in `moduleRoutes`.

#### [MODIFY] [src/config/index.ts](file:///home/zihad/Documents/olivia/Olivia-karp-backend/src/config/index.ts)
- Ensure `MIGHTY_NETWORK_ID` and `MIGHTY_NETWORK_API_URL` are exported cleanly alongside existing `mighty` config.

---

### Frontend (`olivia-karp-dashboard`)

#### [NEW] [meetClimatePeople.types.ts](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/features/meet-climate-people/types/meetClimatePeople.types.ts)
- TypeScript definitions for `MeetClimateProfile`, `ProfileFilters`, `ProfilePaginationMeta`.

#### [NEW] [meetClimatePeople.api.ts](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/features/meet-climate-people/api/meetClimatePeople.api.ts)
- Axios API calls to backend endpoints:
  - `fetchProfiles(params)`
  - `fetchProfileById(id)`
  - `triggerSync()`
  - `toggleProfileVisibility(id, isVisible)`
  - `fetchSyncStatus()`

#### [NEW] [useMeetClimatePeople.ts](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/features/meet-climate-people/hooks/useMeetClimatePeople.ts)
- TanStack Query hooks: `useProfiles`, `useProfileDetails`, `useSyncProfiles`, `useToggleVisibility`.

#### [NEW] Components in `src/features/meet-climate-people/components/`:
- `ProfileCard.tsx`: Card displaying avatar, name, professional title, organization, climate interest badges, looking-for tags, can-help-with highlights, and "View Profile" button.
- `ProfileDetailModal.tsx`: Comprehensive modal showing bio/about, education, experience, full skills list, areas of expertise, social links (LinkedIn, website, portfolio), and direct Mighty Networks link.
- `FilterBar.tsx`: Interactive filter pills for Climate Interests, Professional Areas, and Looking For with active badge indicators and "Clear All".
- `SearchInput.tsx`: Real-time debounced search input with clear button.
- `LoadingSkeleton.tsx`: Grid of animated skeleton cards matching card layout.
- `EmptyState.tsx`: Friendly empty state illustration with reset button.
- `AdminSyncBar.tsx`: Status bar showing last sync time, total synced members count, and manual "Sync Now" button.

#### [NEW] [src/app/meet-climate-people/page.tsx](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/app/meet-climate-people/page.tsx)
- Public directory page matching the requested layout:
  - Header: "Meet Climate People", "Discover the people behind climate action", "[Become a Member]" CTA.
  - "Explore the Community" section with Search and categorized filter tags (Climate Interests, Professional Area, Looking For).
  - Profile cards responsive grid with pagination.

#### [NEW] [src/app/(dashboard)/meet-climate-people/page.tsx](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/app/(dashboard)/meet-climate-people/page.tsx)
- Admin dashboard management page allowing admins to run sync, inspect profiles, toggle visibility on/off, and view sync telemetry.

#### [MODIFY] [src/proxy.ts](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/proxy.ts)
- Add `/meet-climate-people` to `publicPaths` so visitors can browse the directory without being redirected to login.

#### [MODIFY] [src/components/sheard/Sidebar.tsx](file:///home/zihad/Documents/olivia/olivia-karp-dashboard/src/components/sheard/Sidebar.tsx)
- Add "Meet Climate People" navigation item to the dashboard sidebar.

---

## 5. Verification Plan

### Automated Verification
1. **Backend Integration & Sync Test**:
   - Run a test script to trigger `syncMembersFromMighty()` against live Mighty Networks API.
   - Verify records are created in MongoDB `MeetClimateProfile` collection with valid fields.
   - Verify idempotency: run sync twice and assert no duplicate records are created.
2. **API Endpoint Verification**:
   - `GET /api/v1/meet-climate-people`: assert status 200, array of profile cards, valid pagination meta.
   - `GET /api/v1/meet-climate-people?search=...`: test search by name and title.
   - `GET /api/v1/meet-climate-people?climateInterest=...`: test filtering.
   - `GET /api/v1/meet-climate-people/:id`: assert status 200, single profile detail.
   - Security verification: assert private email address is not exposed in public endpoints.
3. **Frontend Build & Typecheck**:
   - In `olivia-karp-dashboard`, run `npm run type-check` and `npm run build` to confirm zero TypeScript errors.

### Manual / Browser Verification
1. Start frontend dev server on port 3000.
2. Navigate to `http://localhost:3000/meet-climate-people` in browser:
   - Check Hero section and "Become a Member" button.
   - Verify profile cards loaded from backend API.
   - Test search input (typing name, title, skill).
   - Test filter pills (Climate Tech, Energy, Policy, etc.).
   - Click a profile card: verify modal opens with complete details, experience, education, links.
   - Test pagination controls.
3. Navigate to admin page `http://localhost:3000/meet-climate-people` in dashboard:
   - Test the "Sync from Mighty Networks" button.
   - Verify success toast notification and updated member count.
