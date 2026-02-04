import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  Heart, Shield, Users, Globe, ArrowRight, 
  Lock, Database, Code, Sparkles
} from 'lucide-react';
import { DNALogo } from '~/components/DNALogo';
import { useAuth } from '~/hooks/useAuth';

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About - Genetic Explorer' },
      { name: 'description', content: 'Learn about Genetic Explorer, our mission to make genetic analysis accessible, and our commitment to privacy and open-source development.' },
    ],
  }),
});

function AboutPage() {
  const { isAuthenticated } = useAuth();

  const values = [
    {
      icon: Heart,
      title: 'Accessibility',
      description: 'We believe everyone deserves access to their genetic information, regardless of their financial situation.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your genetic data is yours alone. We never sell your data and give you complete control over how it is used.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Code,
      title: 'Open Source',
      description: 'Our platform is built on open-source principles. Transparency and community collaboration drive everything we do.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by a community of developers, researchers, and genetic enthusiasts who believe in democratizing genetic analysis.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Users Worldwide' },
    { value: '50K+', label: 'Genomes Analyzed' },
    { value: '100+', label: 'Countries Served' },
    { value: '0', label: 'Data Breaches' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
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
              Democratizing Genetic
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analysis for Everyone
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400"
            >
              Genetic Explorer was founded with a simple mission: to make genetic analysis 
              accessible, private, and free for everyone.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-slate-600 dark:text-slate-400"
            >
              <p className="text-lg">
                In 2024, a group of developers and researchers came together with a shared frustration: 
                genetic analysis services were either prohibitively expensive or engaged in problematic 
                data practices. We believed there had to be a better way.
              </p>
              <p>
                Genetic Explorer was born from the idea that your genetic data belongs to you. You 
                should be able to analyze it without paying subscription fees or worrying about your 
                data being sold to third parties.
              </p>
              <p>
                By building on existing raw DNA data from services like 23andMe and AncestryDNA, we 
                eliminated the need for expensive lab work. This allows us to offer comprehensive 
                analysis completely free of charge.
              </p>
              <p>
                Today, thousands of users trust Genetic Explorer to provide insights into their ancestry, 
                health traits, and genetic relatives—all while maintaining complete privacy and control 
                over their data.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                Our Principles
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
                What We Stand For
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-5 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center flex-shrink-0`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Commitment */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 sm:p-12 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Our Privacy Promise
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Unlike commercial genetic testing companies, we have no incentive to sell your data. 
                  We don't have shareholders demanding profits. We're a community-driven project that 
                  puts users first.
                </p>
                <ul className="space-y-2">
                  {[
                    'Your data is encrypted end-to-end',
                    'We never sell your genetic information',
                    'You can delete your data at any time',
                    'Open-source code for transparency',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Source */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
              <Code className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Open Source & Community Driven
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Genetic Explorer is built in the open. Our code is available for anyone to review, 
              contribute to, or self-host. We believe transparency is essential when handling 
              sensitive genetic data.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                View on GitHub
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <Link
                to="/contact"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Join Our Mission
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
              Be part of a community that believes genetic analysis should be 
              accessible, private, and free for everyone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/upload" : "/register"}
                className="flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                {isAuthenticated ? 'Upload Your Genome' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5" />
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
