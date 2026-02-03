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
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
  uploadUrl: string;
}

export default function WelcomeEmail({
  userName,
  loginUrl,
  uploadUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Genetic Explorer - Start your genetic journey</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🧬 Genetic Explorer</Text>
          </Section>
          
          <Heading style={h1}>Welcome to Genetic Explorer!</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Thank you for joining Genetic Explorer! We're excited to help you discover 
            insights hidden in your DNA. Your journey to understanding your genetic 
            blueprint starts now.
          </Text>
          
          <Section style={featureBox}>
            <Text style={featureTitle}>🚀 What's Next?</Text>
            <Text style={featureText}>
              • Upload your genetic data from 23andMe, AncestryDNA, or other providers<br />
              • Get AI-powered analysis and personalized health insights<br />
              • Explore your SNPs and understand their significance<br />
              • Share discoveries with family members securely
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={buttonPrimary} href={uploadUrl}>
              Upload Your DNA
            </Button>
            <Text style={orText}>or</Text>
            <Link href={loginUrl} style={secondaryLink}>
              Sign in to your account
            </Link>
          </Section>
          
          <Hr style={divider} />
          
          <Section style={tipsSection}>
            <Text style={tipsTitle}>💡 Quick Tips</Text>
            <Text style={tipsText}>
              <strong>Privacy First:</strong> Your genetic data stays on your device 
              and is never shared without your consent.
            </Text>
            <Text style={tipsText}>
              <strong>Supported Formats:</strong> We accept 23andMe, AncestryDNA, 
              MyHeritage, and standard genome.txt files.
            </Text>
            <Text style={tipsText}>
              <strong>Family Sharing:</strong> Invite family members to explore 
              genetic connections together.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Visit our <Link href="/faq" style={footerLink}>FAQ</Link> or 
              <Link href="/contact" style={footerLink}>contact support</Link>.
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
  fontSize: '28px',
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

const featureBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const featureTitle = {
  color: '#166534',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const featureText = {
  color: '#15803d',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const buttonPrimary = {
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

const orText = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '12px 0',
};

const secondaryLink = {
  color: '#4f46e5',
  fontSize: '14px',
  textDecoration: 'underline',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const tipsSection = {
  margin: '24px 0',
};

const tipsTitle = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const tipsText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
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

const footerLink = {
  color: '#4f46e5',
  textDecoration: 'underline',
};
