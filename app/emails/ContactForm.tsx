import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}

export function ContactFormNotification({
  name,
  email,
  subject,
  message,
  type,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Form Submission</Heading>
          
          <Section style={detailsBox}>
            <Text style={label}>From:</Text>
            <Text style={value}>{name} &lt;{email}&gt;</Text>
            
            <Text style={label}>Type:</Text>
            <Text style={value}>{type}</Text>
            
            <Text style={label}>Subject:</Text>
            <Text style={value}>{subject}</Text>
          </Section>
          
          <Hr style={divider} />
          
          <Section>
            <Text style={label}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              Received on {new Date().toLocaleString()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function ContactFormConfirmation({
  name,
  subject,
}: { name: string; subject: string }) {
  return (
    <Html>
      <Head />
      <Preview>We've received your message: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🧬 Genetic Explorer</Text>
          </Section>
          
          <Heading style={h1}>Message Received</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Thank you for contacting us! We've received your message regarding:
          </Text>
          
          <Text style={subjectText}>"{subject}"</Text>
          
          <Text style={text}>
            Our support team will review your inquiry and get back to you as soon 
            as possible, typically within 24 hours.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              For urgent issues, please include "URGENT" in your subject line 
              for faster response.
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
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const detailsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '20px',
  margin: '20px 0',
};

const label = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '12px 0 4px',
};

const value = {
  color: '#1e293b',
  fontSize: '14px',
  margin: '0 0 8px',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const messageText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  margin: '8px 0 0',
};

const subjectText = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  fontStyle: 'italic',
  margin: '8px 0 20px',
  padding: '12px 16px',
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
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
};
