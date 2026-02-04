import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  Check, ArrowRight, Sparkles, Shield, Zap, Users, 
  Upload, Brain, Globe, HelpCircle
} from 'lucide-react';
import { DNALogo } from '~/components/DNALogo';
import { useAuth } from '~/hooks/useAuth';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: 'Pricing - Genetic Explorer' },
      { name: 'description', content: 'Genetic Explorer is completely free. Get AI-powered genetic analysis, ancestry reports, health insights, and more at no cost.' },
    ],
  }),
});

function PricingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: Upload, text: 'Unlimited genome uploads' },
    { icon: Brain, text: 'AI-powered health analysis' },
    { icon: Globe, text: 'Detailed ancestry reports' },
    { icon: Sparkles, text: 'DNA traits analysis' },
    { icon: Shield, text: 'Carrier screening' },
    { icon: Users, text: 'DNA relative matching' },
    { icon: Zap, text: 'Research updates' },
    { icon: Shield, text: 'Privacy controls' },
  ];

  const comparisons = [
    { feature: 'Raw DNA Upload', us: true, competitor1: false, competitor2: false },
    { feature: 'Ancestry Analysis', us: true, competitor1: true, competitor2: true },
    { feature: 'Health Reports', us: true, competitor1: '$199+', competitor2: 'Limited' },
    { feature: 'DNA Traits', us: true, competitor1: true, competitor2: true },
    { feature: 'Carrier Status', us: true, competitor1: true, competitor2: false },
    { feature: 'DNA Relatives', us: true, competitor1: true, competitor2: true },
    { feature: 'AI Analysis', us: true, competitor1: false, competitor2: false },
    { feature: 'Data Export', us: true, competitor1: true, competitor2: true },
    { feature: 'No Data Selling', us: true, competitor1: false, competitor2: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              100% Free Forever
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Genetic Analysis
            <span className="block bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Completely Free
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8"
          >
            No subscriptions, no hidden fees, no data selling. 
            We believe everyone deserves access to their genetic information.
          </motion.p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-center text-white">
              <div className="flex justify-center mb-4">
                <DNALogo size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-2">Free Forever</h2>
              <p className="text-indigo-100">Full access to all features</p>
              <div className="mt-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-indigo-200 ml-2">/ forever</span>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={isAuthenticated ? "/upload" : "/register"}
                  className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 flex-1"
                >
                  <Zap className="w-5 h-5" />
                  {isAuthenticated ? 'Upload Your Genome' : 'Get Started Free'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all"
                >
                  Already have an account? Sign In
                </Link>
              </div>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                No credit card required • Cancel anytime • Full data export available
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How is it free? */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
              <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              How is this free?
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-left">
              <p>
                Genetic Explorer is built as an open-source project with a mission to make genetic analysis 
                accessible to everyone. Unlike commercial genetic testing companies, we don't need to make 
                a profit from your data.
              </p>
              <p>
                We don't sell your genetic data to pharmaceutical companies, insurance providers, or anyone else. 
                Your data stays yours, and we operate on donations and volunteer contributions from the community.
              </p>
              <p>
                By using your existing raw DNA data from services like 23andMe or AncestryDNA, we eliminate 
                the expensive lab costs of DNA sequencing. You already paid for the data—now you can analyze 
                it without additional fees.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white dark:bg-slate-800 rounded-3xl my-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Compare With Other Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              See how we stack up against the competition
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-white">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <DNALogo size={20} />
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">Genetic Explorer</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">23andMe</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">AncestryDNA</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.feature} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.us === true ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-5 h-5" />
                          <span>Free</span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-500">{row.us}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500">
                      {typeof row.competitor1 === 'boolean' ? (
                        row.competitor1 ? <Check className="w-5 h-5 mx-auto text-slate-400" /> : <span className="text-slate-300">—</span>
                      ) : (
                        row.competitor1
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500">
                      {typeof row.competitor2 === 'boolean' ? (
                        row.competitor2 ? <Check className="w-5 h-5 mx-auto text-slate-400" /> : <span className="text-slate-300">—</span>
                      ) : (
                        row.competitor2
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Start Your Genetic Journey Today
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of users who have discovered their ancestry, traits, and health insights—completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/upload" : "/register"}
                className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                {isAuthenticated ? 'Upload Your Genome' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
