/**
 * Magic Link Email Template
 * 
 * Sent to users when they request a passwordless sign-in link
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface MagicLinkEmailProps {
  magicLink: string;
  userEmail: string;
  expiresIn: string;
}

export function MagicLinkEmail({ 
  magicLink, 
  userEmail,
  expiresIn = '15 minutes'
}: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to Genetic Explorer</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-xl bg-white p-8 rounded-lg shadow-sm">
            <Heading className="text-2xl font-bold text-indigo-600 mb-4">
              Sign in to Genetic Explorer
            </Heading>
            
            <Text className="text-gray-700 mb-4">
              Click the button below to securely sign in to your Genetic Explorer account. 
              This link will expire in {expiresIn} and can only be used once.
            </Text>

            <Section className="text-center my-8">
              <Button
                href={magicLink}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold no-underline inline-block"
              >
                Sign In to Genetic Explorer
              </Button>
            </Section>

            <Text className="text-gray-600 text-sm mb-4">
              Or copy and paste this URL into your browser:
            </Text>
            
            <Link
              href={magicLink}
              className="text-indigo-600 text-sm break-all"
            >
              {magicLink}
            </Link>

            <Section className="mt-8 pt-6 border-t border-gray-200">
              <Text className="text-gray-500 text-xs">
                This sign-in link was requested for <strong>{userEmail}</strong>.
              </Text>
              <Text className="text-gray-500 text-xs mt-2">
                If you didn't request this link, you can safely ignore this email. 
                Someone may have entered your email address by mistake.
              </Text>
            </Section>

            <Section className="mt-6 pt-4 border-t border-gray-100">
              <Text className="text-gray-400 text-xs text-center">
                Genetic Explorer • Secure Genetic Analysis Platform
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default MagicLinkEmail;
