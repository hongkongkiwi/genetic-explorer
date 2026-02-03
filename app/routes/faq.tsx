import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { HelpCircle, ChevronDown, ChevronUp, Upload, Shield, Users, FileText, Search } from 'lucide-react';
import { cn } from '~/utils/cn';

export const Route = createFileRoute('/faq')({
  component: FAQPage,
});

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ElementType;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "What genetic data formats do you support?",
    answer: "We support raw genetic data files from 23andMe (genome_*.txt), AncestryDNA (AncestryDNA.txt), MyHeritage, and generic formats containing RSID, chromosome, position, and genotype data. Files can be uploaded as plain text or compressed (gzip, zip).",
    icon: Upload,
    category: "Upload"
  },
  {
    question: "Is my genetic data secure?",
    answer: "Yes. Your genetic data is stored locally on your device/server and is never uploaded to external cloud services. We use industry-standard encryption, secure password hashing (PBKDF2), and all data transfers are encrypted. You have full control and can delete your data at any time.",
    icon: Shield,
    category: "Security"
  },
  {
    question: "Who can I share my genetic data with?",
    answer: "You can share your genetic profiles with family members, healthcare providers, or researchers. You control the permission level (view, download, or manage) and can revoke access at any time. Recipients must create an account to access shared data.",
    icon: Users,
    category: "Sharing"
  },
  {
    question: "What do I get in my genetic report?",
    answer: "Your comprehensive genetic report includes: an executive summary, disease risk assessments, drug metabolism analysis, nutrition and fitness recommendations, carrier status information, and an actionable health protocol tailored to your genetic profile.",
    icon: FileText,
    category: "Reports"
  },
  {
    question: "How accurate is the analysis?",
    answer: "Our analysis is based on peer-reviewed scientific research from databases like ClinVar, PharmGKB, and dbSNP. However, genetic analysis is complex and evolving. Results represent predispositions, not certainties. Always consult healthcare professionals for medical decisions.",
    icon: Search,
    category: "Science"
  },
  {
    question: "Can I delete my account and data?",
    answer: "Yes. You can permanently delete your account and all associated data at any time from your Settings page. This includes your profile, uploaded genomes, generated reports, and activity logs. This action cannot be undone.",
    icon: Shield,
    category: "Privacy"
  },
  {
    question: "Is this a substitute for medical advice?",
    answer: "No. Genetic Explorer is for educational purposes only. Our reports are not intended to diagnose, treat, or replace professional medical advice. Always consult with qualified healthcare providers before making medical decisions based on genetic information.",
    icon: HelpCircle,
    category: "Medical"
  },
  {
    question: "How do I reset my password?",
    answer: "Click 'Forgot password?' on the login page, enter your email, and we'll send you reset instructions. For security, the reset link expires after 24 hours. If you don't receive the email, check your spam folder.",
    icon: Shield,
    category: "Account"
  },
  {
    question: "Can I compare my DNA with family members?",
    answer: "Yes! Use the Family Sharing feature to share genetic profiles with relatives. Once shared, you can view and compare variants. We plan to add more advanced comparison tools in future updates.",
    icon: Users,
    category: "Features"
  },
  {
    question: "What happens to my data if I stop using the service?",
    answer: "Your data remains on your local machine until you delete it. We don't have access to delete it remotely. You own your data completely. If you want to remove it, use the account deletion feature in Settings.",
    icon: Shield,
    category: "Privacy"
  }
];

const categories = Array.from(new Set(faqs.map(f => f.category)));

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = selectedCategory 
    ? faqs.filter(f => f.category === selectedCategory)
    : faqs;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
          <HelpCircle className="w-8 h-8 text-blue-700 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Find answers to common questions about Genetic Explorer
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === null
              ? "bg-blue-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => {
          const Icon = faq.icon;
          const isOpen = openIndex === index;

          return (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center gap-4 p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pl-20">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Can't find what you're looking for?
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/contact"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Contact Support
          </Link>
          <Link
            to="/"
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
