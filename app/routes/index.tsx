import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { DNALogo } from '~/components/DNALogo';
import { NewFeatureBadge } from '~/components/UpdateNotification';
import { useAuth } from '~/hooks/useAuth';
import { useState, useEffect } from 'react';
import {
  Upload, FileText, Activity, Shield, Brain, Heart, ArrowRight, Sparkles, Bell, Users, UserPlus,
  Globe, Dna, Microscope, UserSearch, Lock, Eye, Database, CheckCircle, XCircle,
  TrendingUp, Zap, Beaker, ChevronRight, Star, Quote
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

// Rotating feature highlights
const featureHighlights = [
  { icon: Activity, text: 'Health Reports', color: 'from-emerald-500 to-teal-500' },
  { icon: Globe, text: 'Ancestry & Ethnicity', color: 'from-blue-500 to-cyan-500' },
  { icon: Sparkles, text: 'DNA Traits', color: 'from-purple-500 to-pink-500' },
  { icon: Shield, text: 'Carrier Status', color: 'from-amber-500 to-orange-500' },
  { icon: UserSearch, text: 'DNA Relatives', color: 'from-rose-500 to-red-500' },
];

function HomePage() {
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
  const [currentHighlight, setCurrentHighlight] = useState(0);

  // Auto-rotate feature highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHighlight((prev) => (prev + 1) % featureHighlights.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Upload,
      title: 'Upload Your DNA',
      description: 'Supports 23andMe, AncestryDNA, and other major providers. Keep your genetic data private and secure.',
      color: 'from-emerald-500/20 to-emerald-600/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      isNew: false,
      link: '/upload',
    },
    {
      icon: Brain,
      title: 'AI Health Analysis',
      description: 'LLM-powered interpretation of your genetic variants with personalized health insights and recommendations.',
      color: 'from-blue-500/20 to-blue-600/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      isNew: false,
      link: '/reports',
    },
    {
      icon: Globe,
      title: 'Ancestry & Ethnicity',
      description: 'Discover your ethnic origins and ancestral migration paths with detailed geographic breakdowns.',
      color: 'from-indigo-500/20 to-indigo-600/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      isNew: true,
      link: '/ancestry',
    },
    {
      icon: Sparkles,
      title: 'DNA Traits',
      description: 'Explore fun genetic traits like eye color, taste preferences, sleep patterns, and physical characteristics.',
      color: 'from-purple-500/20 to-purple-600/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      isNew: true,
      link: '/traits',
    },
    {
      icon: Shield,
      title: 'Carrier Screening',
      description: 'Understand if you carry genetic variants that could affect your family planning decisions.',
      color: 'from-amber-500/20 to-amber-600/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      isNew: true,
      link: '/carrier-status',
    },
    {
      icon: UserSearch,
      title: 'DNA Relatives',
      description: 'Connect with genetic relatives, build your family tree, and discover shared ancestry.',
      color: 'from-rose-500/20 to-rose-600/20',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      isNew: true,
      link: '/relatives',
    },
    {
      icon: Heart,
      title: 'Health Insights',
      description: 'Personalized recommendations for nutrition, fitness, and lifestyle based on your genetics.',
      color: 'from-pink-500/20 to-pink-600/20',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      isNew: false,
      link: '/reports',
    },
    {
      icon: Activity,
      title: 'Disease Risk',
      description: 'Understand genetic risks for common conditions and preventive strategies for better outcomes.',
      color: 'from-orange-500/20 to-orange-600/20',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      isNew: false,
      link: '/reports',
    },
    {
      icon: Beaker,
      title: 'Drug Response',
      description: 'Pharmacogenomic insights for medication safety, efficacy, and personalized dosing.',
      color: 'from-cyan-500/20 to-cyan-600/20',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      isNew: false,
      link: '/reports',
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Securely share genetic profiles with family members and healthcare providers you trust.',
      color: 'from-teal-500/20 to-teal-600/20',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      isNew: false,
      link: '/sharing',
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                to="/upload"
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium text-center"
              >
                Upload Genome
              </Link>
              <Link
                to="/sharing"
                className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium text-center"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Major Platform Update
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  New
                </span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ancestry analysis, DNA traits, carrier screening, and relative matching now available!
                <Link to="/whats-new" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium ml-1">
                  See what's new →
                </Link>
              </p>
            </div>
          </div>
          <Link
            to="/whats-new"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            View Updates
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20">
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
              <span className="text-slate-900 dark:text-white">Genetic Story</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6"
            >
              The most comprehensive genetic analysis platform. Discover your ancestry, traits, health insights, and connect with DNA relatives—all in one secure place.
            </motion.p>

            {/* Rotating Feature Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-10 h-12"
            >
              <div className="flex items-center justify-center gap-2 text-lg">
                <span className="text-slate-500 dark:text-slate-400">Discover your</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHighlight}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 font-semibold bg-gradient-to-r ${featureHighlights[currentHighlight].color} bg-clip-text text-transparent`}
                  >
                    {(() => {
                      const Icon = featureHighlights[currentHighlight].icon;
                      return <Icon className="w-5 h-5" style={{ color: 'inherit' }} />;
                    })()}
                    {featureHighlights[currentHighlight].text}
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Feature dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {featureHighlights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHighlight(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentHighlight
                        ? 'w-6 bg-indigo-500'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

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
                    className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Your Genome
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/reports"
                    className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all w-full sm:w-auto"
                  >
                    <Activity className="w-5 h-5" />
                    View Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all w-full sm:w-auto"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400"
            >
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Privacy First
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Free Forever
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                End-to-End Encrypted
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Complete Feature Set
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Everything You Need to Know About Your DNA
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Our comprehensive platform analyzes your genetic data using cutting-edge AI, delivering insights across ancestry, health, traits, and family connections.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  to={feature.link}
                  className="block bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all group cursor-pointer h-full border border-transparent hover:border-slate-200 dark:hover:border-slate-500"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center flex-wrap gap-2">
                    {feature.title}
                    {feature.isNew && <NewFeatureBadge>New</NewFeatureBadge>}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
            {/* Research Updates Feature Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: features.length * 0.05 }}
            >
              <Link
                to="/whats-new"
                className="block bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-6 rounded-2xl hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40 transition-all group cursor-pointer border border-amber-200 dark:border-amber-800 h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center flex-wrap gap-2">
                  Research Updates
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                    New
                  </span>
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Stay informed about new SNPs, updated research, and improved recommendations as our database grows.
                </p>
                <div className="flex items-center text-sm font-medium text-amber-700 dark:text-amber-400 group-hover:text-amber-800">
                  View updates
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sample Reports Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Sample Reports
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                See What You'll Discover
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Beautiful, detailed reports that make understanding your genetics easy and actionable.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ancestry Report Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Ancestry Composition</h3>
                  <p className="text-xs text-slate-500">Ethnic breakdown</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { region: 'Northern European', percent: 42, color: 'bg-blue-500' },
                  { region: 'East Asian', percent: 28, color: 'bg-emerald-500' },
                  { region: 'Sub-Saharan African', percent: 18, color: 'bg-amber-500' },
                  { region: 'Indigenous American', percent: 12, color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.region} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 dark:text-slate-300">{item.region}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{item.percent}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Traits Report Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Fun DNA Traits</h3>
                  <p className="text-xs text-slate-500">Unique characteristics</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { trait: 'Bitter Taste Perception', value: 'Likely can taste', icon: '🍺' },
                  { trait: 'Eye Color', value: 'Likely brown', icon: '👁️' },
                  { trait: 'Caffeine Metabolism', value: 'Fast metabolizer', icon: '☕' },
                  { trait: 'Earwax Type', value: 'Wet earwax', icon: '👂' },
                  { trait: 'Muscle Composition', value: 'Elite power athlete', icon: '💪' },
                ].map((item, i) => (
                  <div key={item.trait} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.trait}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Health Report Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Health Insights</h3>
                  <p className="text-xs text-slate-500">Wellness indicators</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { condition: 'Type 2 Diabetes', risk: 'Lower', level: 'low', color: 'bg-emerald-500' },
                  { condition: 'Celiac Disease', risk: 'Higher', level: 'high', color: 'bg-amber-500' },
                  { condition: 'Atrial Fibrillation', risk: 'Typical', level: 'typical', color: 'bg-blue-500' },
                  { condition: 'Lactose Intolerance', risk: 'Likely', level: 'high', color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.condition} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.condition}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.level === 'low' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      item.level === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.risk} risk
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Simple Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                How It Works
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Get comprehensive genetic insights in three simple steps.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Upload', 
                desc: 'Upload your raw DNA data from 23andMe, AncestryDNA, or other providers. We support all major formats.',
                icon: Upload,
                color: 'from-emerald-500 to-teal-500'
              },
              { 
                step: '02', 
                title: 'Analyze', 
                desc: 'Our AI analyzes your variants across 10+ report types: ancestry, traits, carrier status, health, and more.',
                icon: Brain,
                color: 'from-blue-500 to-indigo-500'
              },
              { 
                step: '03', 
                title: 'Discover', 
                desc: 'Explore your ancestry origins, genetic traits, health insights, and connect with DNA relatives.',
                icon: Sparkles,
                color: 'from-purple-500 to-pink-500'
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-6xl font-bold text-slate-100 dark:text-slate-700 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Your Privacy Matters
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-6">
                Privacy-First Design.<br />
                You Control Your Data.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                We believe your genetic data is yours alone. Our platform is built from the ground up with privacy and security at its core.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'End-to-End Encryption', desc: 'Your data is encrypted at rest and in transit' },
                  { icon: Eye, title: 'Opt-In Everything', desc: 'You choose what to share and with whom' },
                  { icon: Database, title: 'No Data Selling', desc: 'We never sell your genetic data to third parties' },
                  { icon: Shield, title: 'GDPR Compliant', desc: 'Full compliance with global privacy regulations' },
                ].map((item, i) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Security Status</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Fully Protected
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Data Encryption', status: 'Enabled', active: true },
                    { label: 'Two-Factor Auth', status: 'Available', active: true },
                    { label: 'Anonymous Mode', status: 'Available', active: true },
                    { label: 'Data Export', status: 'Available', active: true },
                    { label: 'Third-Party Sharing', status: 'Disabled', active: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}>
                        {item.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-white dark:bg-slate-800 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Better Than The Competition
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Get all the features of expensive genetic testing services, completely free.
              </p>
            </motion.div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-white">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <DNALogo size={24} />
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">Our Platform</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">23andMe</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">AncestryDNA</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Ancestry Analysis', us: true, competitor1: true, competitor2: true },
                  { feature: 'Health Reports', us: true, competitor1: true, competitor2: 'partial' },
                  { feature: 'DNA Traits', us: true, competitor1: true, competitor2: true },
                  { feature: 'Carrier Status', us: true, competitor1: true, competitor2: false },
                  { feature: 'DNA Relatives', us: true, competitor1: true, competitor2: true },
                  { feature: 'Raw Data Upload', us: true, competitor1: false, competitor2: false },
                  { feature: 'AI-Powered Analysis', us: true, competitor1: false, competitor2: false },
                  { feature: 'Privacy-First Design', us: true, competitor1: 'partial', competitor2: 'partial' },
                  { feature: 'No Data Selling', us: true, competitor1: false, competitor2: false },
                  { feature: 'Price', us: 'Free', competitor1: '$199+', competitor2: '$99+' },
                ].map((row, i) => (
                  <tr key={row.feature} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.us === true ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : row.us === false ? (
                        <XCircle className="w-5 h-5 text-slate-300 mx-auto" />
                      ) : row.us === 'partial' ? (
                        <span className="text-amber-500 font-medium">Partial</span>
                      ) : (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{row.us}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.competitor1 === true ? (
                        <CheckCircle className="w-5 h-5 text-slate-400 mx-auto" />
                      ) : row.competitor1 === false ? (
                        <XCircle className="w-5 h-5 text-slate-300 mx-auto" />
                      ) : row.competitor1 === 'partial' ? (
                        <span className="text-slate-400">Partial</span>
                      ) : (
                        <span className="font-medium text-slate-500">{row.competitor1}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.competitor2 === true ? (
                        <CheckCircle className="w-5 h-5 text-slate-400 mx-auto" />
                      ) : row.competitor2 === false ? (
                        <XCircle className="w-5 h-5 text-slate-300 mx-auto" />
                      ) : row.competitor2 === 'partial' ? (
                        <span className="text-slate-400">Partial</span>
                      ) : (
                        <span className="font-medium text-slate-500">{row.competitor2}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Loved by Users
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                See what our community has to say about their genetic discovery journey.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally, a platform that lets me use my existing 23andMe data without paying again. The health insights are incredibly detailed!",
                author: "Sarah M.",
                role: "Health Enthusiast",
                rating: 5
              },
              {
                quote: "Found 3rd cousins I never knew about through the DNA relatives feature. The ancestry breakdown matched my family history perfectly.",
                author: "James K.",
                role: "Genealogy Researcher",
                rating: 5
              },
              {
                quote: "As someone concerned about privacy, I appreciate that this platform is transparent about data usage and doesn't sell my information.",
                author: "Dr. Emily Chen",
                role: "Medical Professional",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-indigo-200 dark:text-indigo-800 mb-4" />
                <p className="text-slate-700 dark:text-slate-300 mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-indigo-50 dark:to-indigo-900/20 rounded-3xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Unlock Your{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Genetic Story?
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands who have discovered their ancestry, traits, and health insights—all for free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/upload" : "/register"}
                className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                <Upload className="w-5 h-5" />
                {isAuthenticated ? 'Upload Your Genome' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium py-4 px-8 rounded-2xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-all w-full sm:w-auto"
                >
                  Already have an account? Sign In
                </Link>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
