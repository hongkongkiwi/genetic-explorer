import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CookieSettings } from '~/components/CookieConsent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/Card';
import { Cookie } from 'lucide-react';

export const Route = createFileRoute('/settings/cookies' as any)({
  component: CookieSettingsPage,
});

function CookieSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cookie className="w-7 h-7" />
          Cookie Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your cookie preferences and privacy settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Matters</CardTitle>
          <CardDescription>
            We use cookies to enhance your experience. Essential cookies are always 
            enabled as they are necessary for the site to function properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CookieSettings />
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">About Our Cookies</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            <strong>Essential:</strong> Required for the website to function properly. 
            These cannot be disabled.
          </li>
          <li>
            <strong>Analytics:</strong> Help us understand how visitors interact with 
            our website by collecting anonymous information.
          </li>
          <li>
            <strong>Marketing:</strong> Used to deliver relevant advertisements and 
            track their performance.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          For more information, please read our{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/privacy#cookies" className="text-primary hover:underline">
            Cookie Policy
          </a>.
        </p>
      </div>
    </div>
  );
}

export default CookieSettingsPage;
