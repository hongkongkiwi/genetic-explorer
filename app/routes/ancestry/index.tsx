import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Dna, 
  ChevronRight, 
  Upload, 
  FileText,
  ArrowRight,
  Sparkles,
  Palette,
  Users,
  MapPin,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';

export const Route = createFileRoute('/ancestry/')({
  component: AncestryLandingPage,
});

const features = [
  {
    icon: Globe,
    title: 'Ethnicity Estimate',
    description: 'Discover your ethnic origins broken down by percentage across 150+ regions worldwide.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Dna,
    title: 'Haplogroups',
    description: 'Trace your maternal and paternal lineages back tens of thousands of years.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Palette,
    title: 'Chromosome Painting',
    description: 'Visualize which segments of your DNA come from different populations.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Users,
    title: 'Ancestral Timelines',
    description: 'See when different ancestries were introduced into your family history.',
    color: 'from-amber-500 to-orange-600',
  },
];

const sampleEthnicityData = [
  { region: 'British & Irish', percentage: 45.2, color: 'bg-emerald-500' },
  { region: 'French & German', percentage: 22.8, color: 'bg-blue-500' },
  { region: 'Scandinavian', percentage: 12.5, color: 'bg-purple-500' },
  { region: 'Italian', percentage: 8.3, color: 'bg-amber-500' },
  { region: 'Broadly Northwestern European', percentage: 6.7, color: 'bg-slate-400' },
  { region: 'Ashkenazi Jewish', percentage: 3.2, color: 'bg-rose-500' },
  { region: 'Broadly Southern European', percentage: 1.3, color: 'bg-orange-400' },
];

function AncestryLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              New Feature
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your Ancestral Origins
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Uncover the rich tapestry of your heritage. Our advanced ancestry analysis 
              reveals where your DNA comes from across 150+ regions worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Upload Your DNA
              </Link>
              <Link
                to="/genomes"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700/50 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-emerald-700/70 transition-colors border border-white/20"
              >
                <FileText className="w-5 h-5" />
                View Existing Reports
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="#f8fafc"
              className="dark:fill-slate-900"
            />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            What's Included in Your Ancestry Report
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our comprehensive ancestry analysis provides detailed insights into your genetic heritage
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sample Report Preview */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                See What Your Report Will Look Like
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Get a detailed breakdown of your ancestry composition with beautiful visualizations 
                and insights into your genetic heritage.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Percentage breakdown by region',
                  'Detailed sub-regional analysis',
                  'Confidence intervals for each estimate',
                  'Comparison with reference populations',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold"
              >
                Get Your Ancestry Report
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6 shadow-2xl border-0 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ancestry Composition</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sample Report Preview</p>
                  </div>
                  <Globe className="w-8 h-8 text-emerald-500" />
                </div>

                {/* Sample Ethnicity Chart */}
                <div className="space-y-3">
                  {sampleEthnicityData.map((item, index) => (
                    <div key={item.region} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">{item.region}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>150+ regions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dna className="w-4 h-4" />
                      <span>600K+ markers</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Get your ancestry report in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload Your DNA',
              description: 'Upload your raw DNA data from 23andMe, AncestryDNA, or other providers.',
              icon: Upload,
            },
            {
              step: '02',
              title: 'We Analyze',
              description: 'Our algorithms compare your DNA against reference populations from around the world.',
              icon: Dna,
            },
            {
              step: '03',
              title: 'Explore Results',
              description: 'View your interactive ancestry report with detailed regional breakdowns.',
              icon: Globe,
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="text-6xl font-bold text-slate-100 dark:text-slate-800 absolute -top-4 -left-2 select-none">
                {item.step}
              </div>
              <Card className="relative p-6 pt-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {item.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Supported Providers */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Compatible with All Major DNA Tests
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Upload your raw DNA data from any of these providers
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {['23andMe', 'AncestryDNA', 'MyHeritage', 'FamilyTreeDNA', 'Living DNA', 'Nebula Genomics'].map((provider, index) => (
              <motion.div
                key={provider}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="px-6 py-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 font-medium"
              >
                {provider}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0">
            <div className="text-center">
              <Globe className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Discover Your Heritage?
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                Upload your DNA data now and explore your ancestral origins with our 
                comprehensive ancestry analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/upload"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  Upload DNA Data
                </Link>
                <Link
                  to="/genomes"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700/50 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-emerald-700/70 transition-colors border border-white/20"
                >
                  <FileText className="w-5 h-5" />
                  View My Reports
                </Link>
              </div>
              <p className="text-emerald-200 text-sm mt-6 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Results ready in under 5 minutes
              </p>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {[
            {
              q: 'What file formats are supported?',
              a: 'We support raw DNA data files from all major providers including 23andMe (.txt), AncestryDNA (.txt), MyHeritage (.csv), and FamilyTreeDNA (.csv).',
            },
            {
              q: 'How accurate is the ancestry analysis?',
              a: 'Our ancestry analysis uses advanced algorithms and reference datasets from thousands of individuals worldwide. Accuracy varies by population but typically ranges from 95-99% for major ancestries.',
            },
            {
              q: 'Is my data secure?',
              a: 'Absolutely. We use bank-level encryption and never share your genetic data with third parties. You can delete your data at any time.',
            },
            {
              q: 'How often are ancestry estimates updated?',
              a: 'We update our reference datasets and algorithms regularly. When significant improvements are available, you\'ll be notified and can regenerate your report for free.',
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-7">
                  {faq.a}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AncestryLandingPage;
