# E2E Test Happy Flows - WatchAPI

This document outlines the critical happy path flows that should be tested end-to-end to ensure the application works smoothly.

## 1. User Authentication Flow

### 1.1 Sign Up Flow
**Goal**: New user can create an account and access the dashboard

**Steps**:
1. Navigate to `/signup`
2. Enter valid email (e.g., `test@example.com`)
3. Enter valid password (min 6 characters)
4. Click "Sign up"
5. Verify redirect to `/app` (dashboard)
6. Verify user is logged in (check sidebar shows user profile)
7. Verify personal organization is created automatically

**Expected Result**: User successfully creates account, sees dashboard, and has a default organization

---

### 1.2 Login Flow
**Goal**: Existing user can log in successfully

**Steps**:
1. Navigate to `/login`
2. Enter valid email
3. Enter valid password
4. Click "Sign in"
5. Verify redirect to `/app`
6. Verify user session persists (refresh page, still logged in)

**Expected Result**: User logs in and can access protected routes

---

### 1.3 Logout Flow
**Goal**: User can log out and session is cleared

**Steps**:
1. From dashboard, click user profile dropdown
2. Click "Logout"
3. Verify redirect to landing page or login
4. Verify session cleared (try accessing `/app`, should redirect to login)

**Expected Result**: User successfully logs out and cannot access protected routes

---

## 2. Collection & Endpoint Management Flow

### 2.1 Create Collection Flow
**Goal**: User can create a new collection

**Steps**:
1. Navigate to `/app/collections`
2. Click "+" button in sidebar or "Create Collection" button
3. Verify new collection appears in sidebar with default name "New Collection"
4. Verify collection is expanded by default
5. Verify collection is empty (no endpoints)

**Expected Result**: Collection created and visible in sidebar

---

### 2.2 Create Endpoint Flow
**Goal**: User can add an endpoint to a collection

**Steps**:
1. Navigate to `/app/collections`
2. Hover over a collection in sidebar
3. Click "+" (Add endpoint) button
4. Verify new endpoint created with default name "New Request"
5. Verify endpoint appears under collection
6. Verify endpoint tab opens in main view
7. Click on endpoint to open details
8. Update endpoint details:
   - Name: "Test API"
   - URL: "https://jsonplaceholder.typicode.com/posts/1"
   - Method: "GET"
9. Click Save/Update
10. Verify changes saved (refresh and check)

**Expected Result**: Endpoint created and accessible within collection

---

### 2.3 Delete Endpoint Flow
**Goal**: User can delete an endpoint

**Steps**:
1. Navigate to `/app/collections`
2. Hover over an endpoint
3. Click trash icon
4. Verify confirmation dialog appears
5. Click "Delete"
6. Verify success toast appears
7. Verify endpoint removed from sidebar
8. Verify endpoint tab closes if open

**Expected Result**: Endpoint deleted successfully

---

### 2.4 Delete Collection Flow
**Goal**: User can delete a collection and all its endpoints

**Steps**:
1. Navigate to `/app/collections`
2. Create a test collection with 2-3 endpoints
3. Hover over the collection
4. Click trash icon
5. Verify confirmation dialog mentions "will delete all endpoints"
6. Click "Delete"
7. Verify success toast appears
8. Verify collection removed from sidebar
9. Verify all endpoint tabs from that collection are closed

**Expected Result**: Collection and all its endpoints deleted

---

## 3. Plan Limits & Upgrade Flow

### 3.1 Hit Endpoint Limit (FREE Plan)
**Goal**: Free user hitting 10 endpoint limit sees appropriate error

**Steps**:
1. Create 10 endpoints (FREE plan limit)
2. Attempt to create 11th endpoint
3. Verify error toast appears with message: "Plan limit reached. FREE plan allows maximum 10 endpoints. Upgrade your plan to add more."
4. Verify endpoint is NOT created
5. Verify endpoint count remains at 10

**Expected Result**: User blocked from exceeding limit with clear upgrade message

---

### 3.2 View Billing Page
**Goal**: User can view available plans and upgrade options

**Steps**:
1. Click "Billing" in sidebar
2. Verify billing page loads at `/app/billing`
3. Verify "Current Plan" card shows current plan (e.g., "FREE")
4. Verify 4 plan cards displayed (Free, Starter, Pro, Enterprise)
5. Verify current plan card shows "Current Plan" badge and disabled button
6. Verify other plans show "Upgrade" or "Contact Sales" buttons

**Expected Result**: Billing page displays correctly with plan information

---

### 3.3 Attempt Upgrade (Coming Soon)
**Goal**: User sees "coming soon" when attempting to upgrade

**Steps**:
1. Navigate to `/app/billing`
2. Click "Upgrade" on Starter plan
3. Verify "Coming Soon" dialog appears
4. Verify dialog shows contact email (billing@watchapi.dev)
5. Click "Contact Us" button
6. Verify email client opens with correct recipient
7. Close dialog
8. Verify user remains on FREE plan

**Expected Result**: Coming soon dialog shows with contact information

---

## 4. Monitoring Flow

### 4.1 View Monitoring Dashboard
**Goal**: User can see monitoring status of endpoints

**Steps**:
1. Create at least 3 endpoints with different URLs
2. Navigate to `/app/monitoring`
3. Verify monitoring page loads
4. Verify endpoints listed with status indicators
5. Verify recent check results visible (if cron enabled)
6. Verify can filter/search endpoints

**Expected Result**: Monitoring dashboard shows endpoint health status

---

### 4.2 Manual Endpoint Test
**Goal**: User can manually trigger a test for an endpoint

**Steps**:
1. Navigate to endpoint details
2. Click "Test" or "Run" button
3. Verify loading indicator shows
4. Verify response displayed (status code, response time, body)
5. Verify success/failure indicator
6. Verify result saved to monitoring history

**Expected Result**: Endpoint tested and results shown

---

## 5. Team Management Flow

### 5.1 View Team Members
**Goal**: User can see team members in their organization

**Steps**:
1. Navigate to `/app/team`
2. Verify current user listed as team member
3. Verify role displayed (OWNER/ADMIN/MEMBER)
4. Verify team member count shows "1/3 members" (FREE plan)

**Expected Result**: Team page shows organization members

---

### 5.2 Invite Team Member (if implemented)
**Goal**: Organization owner can invite team members

**Steps**:
1. Navigate to `/app/team`
2. Click "Invite" button
3. Enter team member email
4. Select role (MEMBER/ADMIN)
5. Click "Send Invite"
6. Verify success toast
7. Verify pending invitation shows in list

**Expected Result**: Invitation sent successfully

---

## 6. Alerts Configuration Flow

### 6.1 Create Alert
**Goal**: User can create an alert rule for an endpoint

**Steps**:
1. Navigate to `/app/alerts`
2. Click "Create Alert" button
3. Select an endpoint
4. Configure alert conditions:
   - Alert type: "Response time"
   - Threshold: "> 1000ms"
5. Configure notification channel (email)
6. Click "Create"
7. Verify success toast
8. Verify alert appears in alerts list
9. Verify alert count shows "1/3 alerts" (FREE plan)

**Expected Result**: Alert created and visible in list

---

### 6.2 Hit Alert Limit (FREE Plan)
**Goal**: Free user hitting 3 alert limit sees appropriate error

**Steps**:
1. Create 3 alerts (FREE plan limit)
2. Attempt to create 4th alert
3. Verify error toast or blocking message
4. Verify alert is NOT created
5. Verify upgrade prompt shown

**Expected Result**: User blocked from exceeding alert limit with upgrade message

---

## 7. Analytics Flow

### 7.1 View Analytics Dashboard
**Goal**: User can view analytics for their endpoints

**Steps**:
1. Ensure some monitoring data exists
2. Navigate to `/app/analytics`
3. Verify charts load:
   - Response time trends
   - Success rate
   - Uptime percentage
4. Verify can filter by date range
5. Verify can filter by specific endpoint

**Expected Result**: Analytics dashboard displays monitoring metrics

---

## 8. Onboarding Flow

### 8.1 Complete Onboarding Checklist
**Goal**: New user completes onboarding steps

**Steps**:
1. Sign up as new user
2. Verify onboarding checklist appears on dashboard
3. Verify shows 4 steps:
   - Create first endpoint (unchecked)
   - Set up monitoring (unchecked)
   - Configure alerts (unchecked)
   - Invite team (unchecked)
4. Create first endpoint
5. Refresh page, verify "Create first endpoint" checked
6. Create an alert
7. Refresh page, verify "Configure alerts" checked
8. Verify progress bar updates (e.g., "2 of 4 completed")

**Expected Result**: Onboarding checklist tracks progress correctly

---

## 9. Search & Filter Flow

### 9.1 Search Collections
**Goal**: User can search for collections and endpoints

**Steps**:
1. Create 5+ collections with descriptive names
2. Create multiple endpoints in each collection
3. In sidebar search box, type partial endpoint name
4. Verify matching endpoints highlighted/filtered
5. Verify non-matching collections hidden
6. Clear search
7. Verify all collections visible again

**Expected Result**: Search filters collections and endpoints correctly

---

## 10. Data Persistence Flow

### 10.1 Session Persistence
**Goal**: User data persists across page refreshes

**Steps**:
1. Create 2 collections with 3 endpoints each
2. Open 2 endpoint tabs
3. Refresh browser
4. Verify collections still visible
5. Verify endpoint tabs restored (or expected state)
6. Verify user still logged in

**Expected Result**: Data persists correctly after refresh

---

### 10.2 Multi-Tab Sync
**Goal**: Changes sync across multiple tabs

**Steps**:
1. Open app in Tab 1
2. Open app in Tab 2 (same account)
3. In Tab 1, create new endpoint
4. Switch to Tab 2
5. Verify new endpoint appears (may need refresh)
6. In Tab 2, delete an endpoint
7. Switch to Tab 1
8. Verify endpoint deleted (may need refresh)

**Expected Result**: Data changes reflect across tabs

---

## 11. Error Handling Flow

### 11.1 Network Error Handling
**Goal**: App handles network errors gracefully

**Steps**:
1. Disconnect internet
2. Try to create endpoint
3. Verify error toast shows (not generic 500 error)
4. Reconnect internet
5. Retry action
6. Verify succeeds

**Expected Result**: Clear error messages, graceful recovery

---

### 11.2 Invalid Input Handling
**Goal**: Form validation prevents invalid data

**Steps**:
1. Try to create endpoint with empty URL
2. Verify validation error shown
3. Try to create endpoint with invalid URL ("not-a-url")
4. Verify validation error shown
5. Enter valid URL
6. Verify endpoint created successfully

**Expected Result**: Validation prevents invalid data submission

---

## Priority Testing Order

**Critical Path (P0)** - Test first:
1. User Authentication (1.1, 1.2, 1.3)
2. Create Collection & Endpoint (2.1, 2.2)
3. Plan Limits (3.1)
4. Billing Page View (3.2)

**Important Flows (P1)** - Test second:
5. Delete Endpoint/Collection (2.3, 2.4)
6. Monitoring View (4.1)
7. Team View (5.1)
8. Search Collections (9.1)

**Nice to Have (P2)** - Test when time permits:
9. Alerts (6.1, 6.2)
10. Analytics (7.1)
11. Onboarding (8.1)
12. Error Handling (11.1, 11.2)

---

## Test Data Requirements

For consistent testing, use this test data:

**Test User**:
- Email: `test@watchapi.dev`
- Password: `test123`

**Test Endpoints**:
- JSONPlaceholder: `https://jsonplaceholder.typicode.com/posts/1`
- HTTPBin: `https://httpbin.org/status/200`
- Slow Response: `https://httpbin.org/delay/2`
- Error Response: `https://httpbin.org/status/500`

**Test Collections**:
- "Public APIs" (3-5 endpoints)
- "Internal Services" (2-3 endpoints)
- "Third-party Integrations" (1-2 endpoints)

---

## Automated vs Manual Testing

**Should be automated** (Playwright/Cypress):
- All authentication flows
- CRUD operations (collections, endpoints)
- Plan limit enforcement
- Search/filter functionality
- Form validations

**Can be manual**:
- Visual regression (UI appearance)
- Email notifications
- Cross-browser compatibility
- Performance testing
- Accessibility testing

---

## Success Criteria

All P0 and P1 tests should pass before production deployment.

Each test should verify:
1. ✅ No console errors
2. ✅ Correct UI feedback (toasts, loading states)
3. ✅ Data persists correctly
4. ✅ Proper error handling
5. ✅ Expected redirects/navigation
