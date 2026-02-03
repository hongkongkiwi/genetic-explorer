import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface SharingInvitationProps {
  inviterName: string;
  inviterEmail: string;
  acceptUrl: string;
  permissionLevel: 'view' | 'download' | 'manage';
  message?: string;
  expiresIn?: string;
}

export default function SharingInvitation({
  inviterName,
  inviterEmail,
  acceptUrl,
  permissionLevel,
  message,
  expiresIn = '7 days',
}: SharingInvitationProps) {
  const permissionLabels = {
    view: 'View Only',
    download: 'View & Download',
    manage: 'Full Access',
  };

  return (
    <Html>
      <Head />
      <Preview>{inviterName} wants to share genetic data with you</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🧬 Genetic Explorer</Text>
          </Section>
          
          <Heading style={h1}>Genetic Data Sharing Invitation</Heading>
          
          <Text style={text}>
            <strong>{inviterName}</strong> ({inviterEmail}) wants to share their 
            genetic data with you on Genetic Explorer.
          </Text>
          
          {message && (
            <Section style={messageBox}>
              <Text style={messageLabel}>Message from {inviterName}:</Text>
              <Text style={messageText}>"{message}"</Text>
            </Section>
          )}
          
          <Section style={permissionBox}>
            <Text style={permissionLabel}>Access Level:</Text>
            <Text style={permissionValue}>{permissionLabels[permissionLevel]}</Text>
            <Text style={permissionDescription}>
              {permissionLevel === 'view' && 'You can view their genetic profiles and reports'}
              {permissionLevel === 'download' && 'You can view and download their genetic data'}
              {permissionLevel === 'manage' && 'You have full access including sharing with others'}
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={acceptUrl}>
              Accept Invitation
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            <Link href={acceptUrl} style={link}>
              {acceptUrl}
            </Link>
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Note:</strong> This invitation expires in {expiresIn}. 
              You'll need to create a free Genetic Explorer account if you don't 
              already have one.
            </Text>
          </Section>
          
          <Section style={securityBox}>
            <Text style={securityText}>
              <strong>🔒 Security:</strong> Genetic data is sensitive information. 
              Only accept invitations from people you know and trust.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Genetic Explorer. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const logo = {
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#4f46e5',
  margin: '0',
};

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const messageBox = {
  backgroundColor: '#f8fafc',
  borderLeft: '4px solid #4f46e5',
  padding: '16px 20px',
  margin: '20px 0',
};

const messageLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const messageText = {
  color: '#475569',
  fontSize: '14px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0',
};

const permissionBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const permissionLabel = {
  color: '#166534',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const permissionValue = {
  color: '#15803d',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const permissionDescription = {
  color: '#22c55e',
  fontSize: '14px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const linkText = {
  wordBreak: 'break-all' as const,
  margin: '8px 0 24px',
};

const link = {
  color: '#4f46e5',
  fontSize: '14px',
  textDecoration: 'underline',
};

const infoBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const securityBox = {
  backgroundColor: '#fefce8',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const securityText = {
  color: '#854d0e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const footer = {
  borderTop: '1px solid #e2e8f0',
  marginTop: '32px',
  paddingTop: '24px',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};
