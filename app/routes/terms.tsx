import { createFileRoute, Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { Scroll, Shield, FileText } from 'lucide-react';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
          <Scroll className="w-8 h-8 text-blue-700 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Last updated: February 2, 2026
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              By accessing and using Genetic Explorer, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service. These terms apply to all 
              visitors, users, and others who access or use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              2. Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Genetic Explorer provides a platform for analyzing personal genetic data. Our service includes:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>Upload and storage of genetic data files</li>
              <li>AI-powered analysis of genetic variants</li>
              <li>Generation of health and wellness reports</li>
              <li>Family sharing capabilities</li>
              <li>Research database access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              3. Medical Disclaimer
            </h2>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                IMPORTANT: NOT MEDICAL ADVICE
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The information provided by Genetic Explorer is for educational and informational purposes only. 
              It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
              Always seek the advice of your physician or other qualified health provider with any questions 
              you may have regarding a medical condition. Never disregard professional medical advice or delay 
              in seeking it because of something you have read on this platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              4. User Accounts
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              To use certain features of the service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Data Ownership and Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You retain ownership of your genetic data. By uploading data, you grant us a license to process 
              it for the purpose of providing our services. We handle your data in accordance with our{' '}
              <Link to="/privacy" className="text-blue-700 hover:text-blue-800">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Prohibited Uses
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              You agree not to use the service for:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
              <li>Any illegal purpose</li>
              <li>Uploading genetic data without proper consent</li>
              <li>Attempting to access other users' data</li>
              <li>Reverse engineering or hacking attempts</li>
              <li>Spamming or harassment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Genetic Explorer and its affiliates shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of or inability to use the service. 
              This includes any errors or omissions in any content, or any loss or damage of any kind incurred 
              as a result of the use of any content posted, transmitted, or otherwise made available via the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes via email or through the platform. Your continued use of the service after such changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              9. Contact
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@geneticexplorer.com" className="text-blue-600 hover:text-blue-500">
                support@geneticexplorer.com
              </a>.
            </p>
          </section>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          By using Genetic Explorer, you acknowledge that you have read and agree to these terms.
        </p>
      </div>
    </div>
  );
}
