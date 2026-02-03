import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Navbar } from '~/components/Navbar';
import { Button } from '~/components/ui/Button';
import { Card, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import {
  Sparkles,
  Dna,
  Upload,
  ArrowRight,
  Eye,
  Utensils,
  Brain,
  Star,
  Dice5,
  ChevronRight,
  CheckCircle2,
  DnaIcon,
  Users,
  Share2,
  Zap,
  Search,
  Lock,
} from 'lucide-react';
import { getAllGenomes } from '~/utils/database';
import { TRAITS_DATABASE, CATEGORY_ICONS, CATEGORY_DISPLAY_NAMES } from '~/data/traitsDatabase';

export const Route = createFileRoute('/traits/')({
  component: TraitsLandingPage,
});

const FEATURES = [
  {
    icon: Dna,
    title: '40+ Genetic Traits',
    description: 'Discover insights about your physical features, senses, behaviors, and unique quirks.',
    color: 'bg-blue-500',
  },
  {
    icon: Users,
    title: 'Compare with Family',
    description: 'See how your traits compare with relatives and find what makes you similar or unique.',
    color: 'bg-purple-500',
  },
  {
    icon: Share2,
    title: 'Share Your Results',
    description: 'Share fun facts about your genetics on social media with beautiful, shareable cards.',
    color: 'bg-pink-500',
  },
  {
    icon: Lock,
    title: 'Private & Secure',
    description: 'Your genetic data stays private. You control what you share and with whom.',
    color: 'bg-emerald-500',
  },
];

const CATEGORIES = [
  {
    id: 'physical',
    icon: '👤',
    lucideIcon: Eye,
    title: 'Physical Traits',
    description: 'Eye color, hair type, skin pigmentation, and facial features',
    examples: ['Eye Color', 'Hair Texture', 'Freckles', 'Height Potential'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'sensory',
    icon: '👅',
    lucideIcon: Utensils,
    title: 'Sensory Traits',
    description: 'Taste, smell, and how you perceive the world around you',
    examples: ['Cilantro Taste', 'Bitter Sensitivity', 'Lactose Tolerance', 'Sweet Preference'],
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'behavioral',
    icon: '🧠',
    lucideIcon: Brain,
    title: 'Behavioral Traits',
    description: 'Sleep patterns, pain sensitivity, and natural tendencies',
    examples: ['Morning/Night Person', 'Motion Sickness', 'Pain Sensitivity', 'Empathy Level'],
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'abilities',
    icon: '⭐',
    lucideIcon: Star,
    title: 'Abilities',
    description: 'Genetic predispositions for physical and mental capabilities',
    examples: ['Sprint vs Endurance', 'Musical Pitch', 'Memory Performance', 'Handedness'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'miscellaneous',
    icon: '🎲',
    lucideIcon: Dice5,
    title: 'Fun Facts',
    description: 'Unique genetic quirks that make you, well, you!',
    examples: ['Earwax Type', 'Sneeze Reflex', 'Asparagus Smell', 'Mosquito Response'],
    color: 'from-emerald-500 to-teal-500',
  },
];

const SAMPLE_TRAITS = [
  {
    icon: '🌿',
    name: 'Cilantro Taste',
    result: 'Fresh & citrusy',
    description: 'Some people taste soap when eating cilantro due to a genetic variant!',
    fact: 'Julia Child hated cilantro and said it had a "deadly" taste!',
  },
  {
    icon: '👁️',
    name: 'Eye Color',
    result: 'Blue eyes',
    description: 'Eye color is determined by multiple genes, with HERC2 being a major player.',
    fact: 'All blue-eyed people share a common ancestor from 6,000-10,000 years ago!',
  },
  {
    icon: '☀️',
    name: 'Sneeze Reflex',
    result: 'Photic sneezer',
    description: 'Some people sneeze when looking at bright sunlight!',
    fact: 'It\'s called "Autosomal Dominant Compelling Helio-Ophthalmic Outburst" (ACHOO)!',
  },
  {
    icon: '🏃',
    name: 'Sprint vs Endurance',
    result: 'Power athlete',
    description: 'Your muscle fiber composition affects your athletic strengths.',
    fact: '95% of Olympic sprinters have the "power" variant of ACTN3!',
  },
];

function TraitsLandingPage() {
  const [hasGenome, setHasGenome] = useState<boolean | null>(null);
  const [genomeCount, setGenomeCount] = useState(0);

  useEffect(() => {
    // Check if user has any genomes
    const genomes = getAllGenomes();
    setHasGenome(genomes.length > 0);
    setGenomeCount(genomes.length);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Discover What Makes You Unique</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Decode Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Genetic Story
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Explore 40+ fascinating genetic traits—from why cilantro tastes like soap to whether 
              you're a natural sprinter. Your DNA holds amazing stories! 🧬✨
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasGenome ? (
                <>
                  <Link to={`/traits/${getAllGenomes()[0]?.id}`}>
                    <Button
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-white/90 font-semibold px-8"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      View My Traits
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  {genomeCount > 1 && (
                    <Link to="/genomes">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10"
                      >
                        <Dna className="w-5 h-5 mr-2" />
                        Select Genome
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/upload">
                    <Button
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-white/90 font-semibold px-8"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Your DNA
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="#learn-more">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '40+', label: 'Traits Analyzed' },
                { value: '5', label: 'Categories' },
                { value: '100+', label: 'SNPs Examined' },
                { value: '∞', label: 'Fun Facts' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
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

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why Explore Your Traits?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your genetics influence more than you might think. Discover the fascinating 
              science behind what makes you unique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="learn-more" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              What Will You Discover?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We analyze your DNA across five fascinating categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all group overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{category.icon}</span>
                      <category.lucideIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {category.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Example Traits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.examples.map((example) => (
                          <Badge key={example} variant="default" size="sm">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Traits Preview */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Sneak Peek: Sample Results
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Here's a taste of what your genetic traits report might look like
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_TRAITS.map((trait, index) => (
              <motion.div
                key={trait.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{trait.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {trait.name}
                    </h3>
                    <Badge className="mb-3 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {trait.result}
                    </Badge>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {trait.description}
                    </p>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        <span className="font-semibold">💡 Fun Fact:</span> {trait.fact}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Getting your genetic traits report is simple and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Your DNA',
                description: 'Upload your raw DNA data from 23andMe, AncestryDNA, or other services.',
              },
              {
                step: '02',
                icon: DnaIcon,
                title: 'We Analyze',
                description: 'Our system examines 100+ genetic variants across 40+ fascinating traits.',
              },
              {
                step: '03',
                icon: Sparkles,
                title: 'Discover Yourself',
                description: 'Explore your personalized report with fun facts and scientific insights.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-slate-200 dark:text-slate-700 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-24 left-1/2 w-full">
                    <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 w-1/2 ml-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Compatible with DNA data from
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            {['23andMe', 'AncestryDNA', 'MyHeritage', 'FamilyTreeDNA', 'Living DNA'].map((platform) => (
              <div
                key={platform}
                className="px-6 py-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Meet Your Genes? 🧬
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {hasGenome
                ? 'Your genetic traits report is waiting for you. Dive in and discover what makes you unique!'
                : 'Upload your DNA data and unlock fascinating insights about your genetic traits in minutes.'}
            </p>

            {hasGenome ? (
              <Link to={`/traits/${getAllGenomes()[0]?.id}`}>
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-white/90 font-semibold px-8 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  View My Traits Report
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link to="/upload">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-white/90 font-semibold px-8 text-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}

            <p className="mt-4 text-sm text-white/70">
              Free to use • Private & secure • Results in seconds
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Have Questions?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Learn more about how we analyze your DNA and protect your privacy.
          </p>
          <Link to="/faq">
            <Button variant="outline">
              Visit FAQ
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default TraitsLandingPage;
