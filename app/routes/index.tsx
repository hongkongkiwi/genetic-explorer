import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { DNALogo } from '~/components/DNALogo';
import { NewFeatureBadge } from '~/components/UpdateNotification';
import { useAuth } from '~/hooks/useAuth';
import { Upload, FileText, Activity, Shield, Brain, Heart, ArrowRight, Sparkles, Bell, Users, UserPlus } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HomeContent />
      </main>
    </div>
  );
}

function HomeContent() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Upload,
      title: 'Upload Your DNA',
      description: 'Supports 23andMe, AncestryDNA, and other major providers. Keep your genetic data private and secure.',
      color: 'from-emerald-500/20 to-emerald-600/20',
      isNew: false,
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'LLM-powered interpretation of your genetic variants with personalized health insights.',
      color: 'from-blue-500/20 to-blue-600/20',
      isNew: false,
    },
    {
      icon: Activity,
      title: 'Health Insights',
      description: 'Personalized recommendations for nutrition, fitness, and lifestyle based on your genetics.',
      color: 'from-purple-500/20 to-purple-600/20',
      isNew: false,
    },
    {
      icon: Shield,
      title: 'Disease Risk',
      description: 'Understand genetic risks and preventive strategies for better health outcomes.',
      color: 'from-orange-500/20 to-orange-600/20',
      isNew: false,
    },
    {
      icon: Heart,
      title: 'Drug Response',
      description: 'Pharmacogenomic insights for medication safety and efficacy.',
      color: 'from-red-500/20 to-red-600/20',
      isNew: false,
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Securely share your genetic profiles with family members and healthcare providers.',
      color: 'from-cyan-500/20 to-cyan-600/20',
      isNew: true,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Welcome Banner for Authenticated Users */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ready to explore your genetic data or share with family?
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/upload"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Upload Genome
              </Link>
              <Link
                to="/sharing"
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium"
              >
                Share with Family
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Updates Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Database Updates
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  New
                </span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                8 new SNPs and 23 research papers added this month. 
                <Link to="/whats-new" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium ml-1">
                  See what's new →
                </Link>
              </p>
            </div>
          </div>
          <Link
            to="/whats-new"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            View Updates
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                <DNALogo size={80} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Unlock Your</span>
              <br />
              <span className="text-slate-900 dark:text-white">Genetic Potential</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
            >
              Upload your genetic data and let AI analyze it against the latest research 
              to give you personalized health insights and actionable recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Your Genome
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/sharing"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all"
                  >
                    <Users className="w-5 h-5" />
                    Share with Family
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Comprehensive Genetic Analysis
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our platform analyzes your DNA using cutting-edge AI and cross-references 
              it with ClinVar, PharmGKB, and other scientific databases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  {feature.title}
                  {feature.isNew && <NewFeatureBadge>New</NewFeatureBadge>}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
            {/* New Updates Feature Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: features.length * 0.1 }}
            >
              <Link
                to="/whats-new"
                className="block bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-6 rounded-2xl hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40 transition-all group cursor-pointer border border-amber-200 dark:border-amber-800 h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  Research Updates
                  <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                    New
                  </span>
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Stay informed about new SNPs, updated research, and improved recommendations as our database grows.
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get your personalized genetic report in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload', desc: 'Upload your raw DNA data from 23andMe, AncestryDNA, or other providers. Your data stays private and secure.' },
              { step: '02', title: 'Analyze', desc: 'Our AI analyzes your variants against scientific databases and latest research papers.' },
              { step: '03', title: 'Discover', desc: 'Get personalized reports with actionable health recommendations. Share with family if you choose.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-slate-200 dark:text-slate-700 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-indigo-50 dark:to-indigo-900/20 rounded-3xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Ready to Explore Your Genetics?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            {isAuthenticated 
              ? 'Upload your genetic data and start your journey to personalized health insights today.'
              : 'Join thousands who have discovered personalized health insights through their genetic data. Create your free account today.'}
          </p>
          <Link
            to={isAuthenticated ? "/upload" : "/register"}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105"
          >
            <Upload className="w-5 h-5" />
            {isAuthenticated ? 'Upload Your Genome' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
}
