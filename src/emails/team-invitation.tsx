import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TeamInvitationEmailProps {
  organizationName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  invitationUrl: string;
}

export const TeamInvitationEmail = ({
  organizationName = "Acme Corp",
  inviterName = "John Doe",
  inviterEmail = "john@acme.com",
  role = "Member",
  invitationUrl = "https://watchapi.dev/signup?invitation=abc123",
}: TeamInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You've been invited to join {organizationName} on WatchAPI
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎉 You're Invited!</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi there!</Text>

            <Text style={paragraph}>
              <strong>{inviterName}</strong> ({inviterEmail}) has invited you to
              join <strong>{organizationName}</strong> on WatchAPI.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <span style={label}>Organization:</span> {organizationName}
              </Text>
              <Text style={infoText}>
                <span style={label}>Your Role:</span> {role}
              </Text>
            </Section>

            <Text style={paragraph}>
              WatchAPI is a lightweight API monitoring platform that helps teams
              track endpoint health, performance, and uptime with real-time
              alerts.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={footerText}>
              This invitation will expire in 7 days. If you didn't expect this
              invitation, you can safely ignore this email.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message from WatchAPI.
            </Text>
            <Text style={footerText}>
              If you have any questions, reply to this email or contact{" "}
              {inviterEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TeamInvitationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#2563eb",
  padding: "30px 20px",
  textAlign: "center" as const,
  borderRadius: "5px 5px 0 0",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0",
};

const content = {
  padding: "30px 20px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
};

const infoBox = {
  margin: "20px 0",
  padding: "15px",
  backgroundColor: "#f9fafb",
  borderLeft: "3px solid #2563eb",
  borderRadius: "3px",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
  color: "#333333",
};

const label = {
  fontWeight: "bold",
  color: "#6b7280",
  marginRight: "5px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
};

const footer = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
  marginTop: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "16px",
};
