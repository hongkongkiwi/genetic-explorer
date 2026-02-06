import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  Upload, Brain, Globe, Sparkles, Shield, UserSearch, Heart, Activity, 
  Beaker, Users, Lock, ArrowRight, Check, Database, Eye, FileText,
  TrendingUp, Zap, Microscope, Dna
} from 'lucide-react';
import { DNALogo } from '~/components/DNALogo';
import { useAuth } from '~/hooks/useAuth';

export const Route = createFileRoute('/features' as any)({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: 'Features - Genetic Explorer' },
      { name: 'description', content: 'Explore all the features of Genetic Explorer: AI-powered health analysis, ancestry reports, DNA traits, carrier screening, and more.' },
    ],
  }),
});

function FeaturesPage() {
  const { isAuthenticated } = useAuth();

  const mainFeatures = [
    {
      icon: Brain,
      title: 'AI Health Analysis',
      description: 'Our advanced LLM-powered system analyzes your genetic variants and provides personalized health insights with actionable recommendations.',
      benefits: [
        'Comprehensive disease risk assessment',
        'Personalized lifestyle recommendations',
        'Drug response predictions',
        'Continuous research updates',
      ],
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      icon: Globe,
      title: 'Ancestry & Ethnicity',
      description: 'Discover your ethnic origins with detailed geographic breakdowns and ancestral migration paths.',
      benefits: [
        'Detailed ethnicity percentages',
        'Chromosome painting visualization',
        'Haplogroup analysis',
        'Population-specific insights',
      ],
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      icon: Sparkles,
      title: 'DNA Traits',
      description: 'Explore fun and fascinating genetic traits that make you unique.',
      benefits: [
        'Physical characteristics',
        'Taste and smell preferences',
        'Sleep patterns',
        'Fitness and athletic traits',
      ],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      icon: Shield,
      title: 'Carrier Screening',
      description: 'Understand if you carry genetic variants that could affect family planning.',
      benefits: [
        'Cystic fibrosis screening',
        'Sickle cell trait detection',
        'Tay-Sachs carrier status',
        'Genetic counseling resources',
      ],
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      icon: UserSearch,
      title: 'DNA Relatives',
      description: 'Connect with genetic relatives and build your family tree.',
      benefits: [
        'Find distant cousins',
        'Shared DNA analysis',
        'Relationship predictions',
        'Opt-in privacy controls',
      ],
      color: 'from-rose-500 to-red-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      borderColor: 'border-rose-200 dark:border-rose-800',
    },
    {
      icon: Heart,
      title: 'Health Insights',
      description: 'Personalized recommendations for nutrition, fitness, and wellness.',
      benefits: [
        'Nutritional genetics',
        'Fitness optimization',
        'Vitamin requirements',
        'Metabolism insights',
      ],
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
    },
  ];

  const securityFeatures = [
    { icon: Lock, title: 'End-to-End Encryption', desc: 'Your data is encrypted at rest and in transit using AES-256' },
    { icon: Eye, title: 'Opt-In Sharing', desc: 'You control exactly what data is shared and with whom' },
    { icon: Database, title: 'No Data Selling', desc: 'We never sell your genetic data to third parties' },
    { icon: Shield, title: 'GDPR Compliant', desc: 'Full compliance with global privacy regulations' },
    { icon: FileText, title: 'Data Export', desc: 'Export or delete your data at any time' },
    { icon: Check, title: 'Anonymous Mode', desc: 'Use the platform without revealing your identity' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <DNALogo size={64} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6"
            >
              Everything You Need to
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Understand Your DNA
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8"
            >
              Comprehensive genetic analysis powered by AI. Upload your existing DNA data and get 
              detailed reports on ancestry, health, traits, and more—all for free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to={isAuthenticated ? "/upload" : "/register"}
                className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto justify-center"
              >
                <Upload className="w-5 h-5" />
                {isAuthenticated ? 'Upload Your Genome' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all w-full sm:w-auto"
              >
                Already have an account? Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
              Comprehensive Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              All Your Genetic Insights in One Place
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${feature.bgColor} ${feature.borderColor} border rounded-3xl p-8`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-16 bg-white dark:bg-slate-800 rounded-3xl my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              Privacy First
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
              Your Data, Your Control
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We built our platform with privacy at its core. You maintain complete control over your genetic information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Compatible With All Major DNA Testing Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Upload your raw DNA data from any of these providers
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {['23andMe', 'AncestryDNA', 'MyHeritage', 'FamilyTreeDNA', 'Living DNA', 'Nebula Genomics'].map((platform) => (
              <div
                key={platform}
                className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Explore Your DNA?
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of users who have discovered their genetic story. 
              It's free and takes just minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/upload" : "/register"}
                className="flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                <Zap className="w-5 h-5" />
                {isAuthenticated ? 'Upload Your Genome' : 'Get Started Free'}
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-indigo-500/50 hover:bg-indigo-500/70 text-white font-medium py-4 px-8 rounded-2xl transition-all w-full sm:w-auto"
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
