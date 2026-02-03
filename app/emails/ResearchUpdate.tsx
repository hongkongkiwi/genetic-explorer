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

interface ResearchUpdateProps {
  userName?: string;
  updateCount: number;
  updates: Array<{
    type: 'new' | 'research-updated' | 'evidence-upgraded' | 'recommendation-changed' | 'major-update';
    title: string;
    rsid?: string;
    description: string;
  }>;
  viewUrl: string;
}

export default function ResearchUpdate({
  userName = 'there',
  updateCount,
  updates,
  viewUrl,
}: ResearchUpdateProps) {
  const typeLabels: Record<string, { label: string; color: string; bgColor: string }> = {
    new: { label: 'New SNP', color: '#15803d', bgColor: '#dcfce7' },
    'research-updated': { label: 'Updated', color: '#1d4ed8', bgColor: '#dbeafe' },
    'evidence-upgraded': { label: 'Stronger Evidence', color: '#7c3aed', bgColor: '#ede9fe' },
    'recommendation-changed': { label: 'New Recommendation', color: '#c2410c', bgColor: '#ffedd5' },
    'major-update': { label: 'Major Update', color: '#be123c', bgColor: '#ffe4e6' },
  };

  return (
    <Html>
      <Head />
      <Preview>{updateCount} new research updates in Genetic Explorer</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🧬 Genetic Explorer</Text>
          </Section>
          
          <Heading style={h1}>Research Database Updates</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            We've updated our research database with new findings that may be relevant 
            to your genetic profile. Here are the highlights:
          </Text>
          
          <Section style={summaryBox}>
            <Text style={summaryText}>
              <strong>{updateCount}</strong> new update{updateCount !== 1 ? 's' : ''} this week
            </Text>
          </Section>
          
          {updates.map((update, index) => {
            const typeStyle = typeLabels[update.type];
            return (
              <Section key={index} style={updateItem}>
                <Text
                  style={{
                    ...typeBadge,
                    color: typeStyle.color,
                    backgroundColor: typeStyle.bgColor,
                  }}
                >
                  {typeStyle.label}
                </Text>
                
                <Text style={updateTitle}>{update.title}</Text>
                
                {update.rsid && (
                  <Text style={rsidText}>
                    Variant: <Link href={`/explorer?rsid=${update.rsid}`} style={rsidLink}>{update.rsid}</Link>
                  </Text>
                )}
                
                <Text style={updateDescription}>{update.description}</Text>
              </Section>
            );
          })}
          
          <Section style={buttonContainer}>
            <Button style={button} href={viewUrl}>
              View All Updates
            </Button>
          </Section>
          
          <Hr style={divider} />
          
          <Section style={preferencesSection}>
            <Text style={preferencesText}>
              You're receiving this because you subscribed to research updates. 
              <Link href="/settings/notifications" style={preferencesLink}>Manage preferences</Link>.
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

const summaryBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const summaryText = {
  color: '#166534',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const updateItem = {
  borderBottom: '1px solid #e2e8f0',
  padding: '20px 0',
};

const typeBadge = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '4px 10px',
  borderRadius: '4px',
  margin: '0 0 12px',
};

const updateTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const rsidText = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0 0 8px',
};

const rsidLink = {
  color: '#4f46e5',
  fontFamily: 'monospace',
  fontWeight: '600',
  textDecoration: 'none',
};

const updateDescription = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.5',
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

const divider = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const preferencesSection = {
  textAlign: 'center' as const,
};

const preferencesText = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0',
};

const preferencesLink = {
  color: '#4f46e5',
  textDecoration: 'underline',
  marginLeft: '4px',
};

const footer = {
  borderTop: '1px solid #e2e8f0',
  marginTop: '24px',
  paddingTop: '24px',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};
