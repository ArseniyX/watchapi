- New Endpoint Monitoring Setup
  1. Sign in, ensure an organization exists or create one.
  2. Navigate to /app/collections, add an endpoint, enable the Monitoring toggle, set method/URL/expected status, and save.
  3. Go to /app/monitoring, confirm the endpoint appears in the table with Active status and the configured interval.
- Manual Health Check & History
  1. In /app/monitoring, open the endpoint details drawer.
  2. Click Run Check Now; verify the status badge turns green and response metrics populate.
  3. Open the History tab to confirm the new check is logged with correct status, code, and response time.
- Create Notification Channel
  1. Visit /app/alerts, choose the target organization in the selector.
  2. Click Add Channel, create an Email channel (use a test inbox), and mark it active.
  3. Confirm the channel card shows Active and appears in the list.
- Configure Alert Rule
  1. From the endpoint drawer (/app/monitoring), open the Alerts tab.
  2. Add an alert for STATUS_CODE_NOT with threshold 200, ensure it’s active, and save.
  3. Verify the alert rule appears in the alerts table and counts against limits.
- Trigger Failure & Alert Delivery
  1. Temporarily point the endpoint to a URL that returns an error (e.g., https://httpstat.us/500).
  2. Run Check Now or wait for the scheduled run; ensure status flips to Failure.
  3. Watch /app/alerts → Alert History for a new failure row and confirm the email arrives with endpoint details.
- Recovery & Dashboard Verification
  1. Restore the endpoint to a healthy URL and run another check.
  2. Confirm status returns to Success, uptime widgets update, and failure counts stop incrementing.
  3. Refresh analytics (/app/analytics) to see the success/failure ratios adjust.
- Alert Noise Control
  1. Within an hour of the first failure, re-run a failing check.
  2. Validate the failure is recorded but no duplicate email fires (throttle window) and logs mention throttling.
  3. After an hour, rerun to confirm alerts resume.
