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

interface EmailVerificationProps {
  verificationUrl: string;
  userName?: string;
  expiresIn?: string;
}

export default function EmailVerification({
  verificationUrl,
  userName = 'there',
  expiresIn = '24 hours',
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Genetic Explorer</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🧬 Genetic Explorer</Text>
          </Section>
          
          <Heading style={h1}>Verify Your Email</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Thanks for signing up! Please verify your email address to complete 
            your registration and secure your account.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Note:</strong> This verification link expires in {expiresIn}. 
              If you didn't create an account, you can safely ignore this email.
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
