import { createFileRoute, Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { Shield, Lock, Eye, Server, Trash2, UserCheck } from 'lucide-react';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 mb-4">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Last updated: February 2, 2026
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-800 dark:text-blue-300 font-medium text-center">
              Your privacy is our top priority. Your genetic data belongs to you and you alone.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-700" />
              1. Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Genetic Explorer is committed to protecting your privacy. This Privacy Policy explains how we 
              collect, use, store, and protect your personal information, including your genetic data. 
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Account Information</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4 mb-4">
              <li>Email address</li>
              <li>Password (securely hashed)</li>
              <li>Display name (optional)</li>
              <li>Profile information (optional)</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Genetic Data</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4 mb-4">
              <li>Raw genetic data files you upload</li>
              <li>Parsed SNP information</li>
              <li>Analysis results and reports</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Usage Information</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>Log data (IP address, browser type, access times)</li>
              <li>Activity logs for security</li>
              <li>Feature usage statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-700" />
              3. How We Store Your Data
            </h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Local-First Approach</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Your genetic data is stored locally on your device/server. We do not upload your raw genetic 
                data to external cloud services. Database is stored in the <code>data/</code> directory.
              </p>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>All data is stored on your local machine</li>
              <li>You have full control over your data</li>
              <li>You can delete your data at any time</li>
              <li>We use industry-standard encryption for data at rest</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              4. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We use your information solely to provide and improve our services:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>To analyze your genetic data and generate reports</li>
              <li>To authenticate your account</li>
              <li>To enable family sharing features (only with your explicit permission)</li>
              <li>To send you important security notifications</li>
              <li>To improve our analysis algorithms (using anonymized data only)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Data Sharing
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <p className="text-green-800 dark:text-green-300 font-medium">
                We do NOT sell your genetic data to third parties. Ever.
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Your data is only shared in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li><strong>Family Sharing:</strong> Only with people you explicitly invite</li>
              <li><strong>Legal Requirements:</strong> When required by law or court order</li>
              <li><strong>Research:</strong> Only anonymized, aggregated data (with your opt-in consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              6. AI Analysis and OpenAI
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We use OpenAI's GPT-4 for generating health insights from your genetic data. When you request 
              an analysis, only relevant genetic variant information (not your raw genetic file) is sent to 
              OpenAI for processing. This data is:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4 mt-2">
              <li>Not used to train AI models</li>
              <li>Processed securely over encrypted connections</li>
              <li>Subject to OpenAI's privacy policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              7. Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              You have complete control over your data:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li><strong>Access:</strong> Download all your data at any time</li>
              <li><strong>Correction:</strong> Update your profile information</li>
              <li><strong>Deletion:</strong> Permanently delete your account and all data</li>
              <li><strong>Portability:</strong> Export your genetic data in standard formats</li>
              <li><strong>Consent Withdrawal:</strong> Opt-out of data sharing at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Security Measures
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>PBKDF2 password hashing (100,000 iterations)</li>
              <li>Secure session management</li>
              <li>HTTPOnly, Secure, SameSite cookies</li>
              <li>Activity logging for security monitoring</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              9. GDPR Compliance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              For users in the European Union, we comply with GDPR requirements. You have the right to access, 
              rectify, erase, and port your data. To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@geneticexplorer.com" className="text-blue-700 hover:text-blue-800">
                privacy@geneticexplorer.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@geneticexplorer.com" className="text-blue-600 hover:text-blue-500">
                privacy@geneticexplorer.com
              </a>.
            </p>
          </section>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          For more information, please also review our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
