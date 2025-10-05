# Email Templates

This directory contains React Email templates for the WatchAPI platform.

## Development

Preview and develop email templates locally:

```bash
pnpm email:dev
```

This will start a development server at `http://localhost:3001` where you can preview all email templates with hot reload.

## Templates

- **team-invitation.tsx** - Sent when a user is invited to join an organization

## Adding New Templates

1. Create a new `.tsx` file in this directory
2. Use `@react-email/components` to build your template
3. Export the component as default
4. Import and render it in the email service using `@react-email/render`

## Example

```tsx
import { render } from "@react-email/render";
import TeamInvitationEmail from "@/emails/team-invitation";

const emailHtml = await render(
  TeamInvitationEmail({
    organizationName: "Acme Corp",
    inviterName: "John Doe",
    inviterEmail: "john@acme.com",
    role: "Member",
    invitationUrl: "https://app.com/signup?invitation=abc123",
  })
);
```

## Resources

- [React Email Documentation](https://react.email/docs/introduction)
- [Components Reference](https://react.email/docs/components/html)
