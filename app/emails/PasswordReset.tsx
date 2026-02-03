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

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
  expiresIn?: string;
}

export default function PasswordResetEmail({
  resetUrl,
  userName = 'there',
  expiresIn = '24 hours',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Genetic Explorer password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🧬 Genetic Explorer</Text>
          </Section>
          
          <Heading style={h1}>Password Reset Request</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            We received a request to reset your password for your Genetic Explorer account. 
            Click the button below to create a new password:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Important:</strong> This link expires in {expiresIn}. 
              If you didn't request a password reset, you can safely ignore this email.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              For security reasons, this password reset was requested from a device. 
              If this wasn't you, please contact support immediately.
            </Text>
            
            <Text style={footerText}>
              © {new Date().getFullYear()} Genetic Explorer. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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
  padding: '12px 32px',
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
  backgroundColor: '#fef3c7',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#92400e',
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
  margin: '0 0 8px',
  textAlign: 'center' as const,
};
