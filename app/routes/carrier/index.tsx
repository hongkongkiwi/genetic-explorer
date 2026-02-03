/**
 * Carrier Screening Landing Page
 * 
 * Educational content about carrier screening, what it means to be a carrier,
 * benefits of testing, and prompts to upload genetic data.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Dna,
  Upload,
  Heart,
  Users,
  Baby,
  Shield,
  AlertCircle,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Lock,
  Stethoscope,
  Info,
  Activity,
  FileText,
  Sparkles,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Alert } from '~/components/ui/Alert';

export const Route = createFileRoute('/carrier/')({
  component: CarrierLandingPage,
});

function CarrierLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Medical Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Alert variant="warning" className="border-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Important Medical Disclaimer</p>
                <p className="text-sm mt-1">
                  Carrier screening is for educational and informational purposes only. 
                  It is not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult with a qualified healthcare provider or genetic counselor 
                  regarding your results. This screening may not detect all disease-causing variants. 
                  A negative result does not completely eliminate the risk of being a carrier.
                </p>
              </div>
            </div>
          </Alert>
        </motion.div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
          
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Dna className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Carrier Screening</h1>
                <p className="text-blue-100">Understand your genetic carrier status</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-blue-100 max-w-2xl mb-8"
            >
              Carrier screening helps you understand if you carry genetic variants that 
              could be passed on to your children. Learn about your carrier status for 
              hundreds of genetic conditions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/upload">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <Upload className="w-5 h-5 mr-2" />
                  Start Carrier Screening
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="#learn-more">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* What is a Carrier? */}
        <section id="learn-more" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What is a Genetic Carrier?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Understanding carrier status is important for family planning and personal health awareness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'What is a Carrier?',
                description: 'A carrier is someone who has one copy of a gene variant for a recessive condition. Carriers typically do not have symptoms but can pass the variant to their children.',
                color: 'from-blue-500/20 to-blue-600/20',
                iconColor: 'text-blue-700',
              },
              {
                icon: Baby,
                title: 'Risk to Children',
                description: 'If both parents are carriers of the same condition, there is a 25% chance with each pregnancy of having an affected child. This is why partner screening is important.',
                color: 'from-purple-500/20 to-purple-600/20',
                iconColor: 'text-purple-700',
              },
              {
                icon: Heart,
                title: 'Your Health',
                description: 'Most carriers are healthy and asymptomatic. However, some carrier statuses may have mild health implications that are important to know about.',
                color: 'from-emerald-500/20 to-emerald-600/20',
                iconColor: 'text-emerald-700',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                      <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Get Tested? */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Get Tested?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Carrier screening provides valuable information for your health and family planning decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Baby,
                title: 'Informed Family Planning',
                description: 'Understanding your carrier status helps you make informed decisions about family planning, including exploring reproductive options and prenatal testing.',
              },
              {
                icon: Activity,
                title: 'Early Detection',
                description: 'Some genetic conditions can be managed better when detected early. Knowing your status allows for proactive healthcare decisions.',
              },
              {
                icon: Users,
                title: 'Partner Screening',
                description: 'If you are a carrier, your partner can also be screened to assess the risk to your future children and plan accordingly.',
              },
              {
                icon: Stethoscope,
                title: 'Personalized Healthcare',
                description: 'Your carrier status information becomes part of your medical record, helping healthcare providers deliver personalized care.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Getting your carrier screening results is simple and secure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: Upload,
                title: 'Upload DNA',
                description: 'Upload your raw DNA data from 23andMe, AncestryDNA, or other providers.',
              },
              {
                step: '2',
                icon: Dna,
                title: 'Analyze',
                description: 'Our system analyzes your genetic data for hundreds of carrier conditions.',
              },
              {
                step: '3',
                icon: FileText,
                title: 'Review Results',
                description: 'Get a detailed report of your carrier status for each condition tested.',
              },
              {
                step: '4',
                icon: Stethoscope,
                title: 'Consult',
                description: 'If needed, consult with a genetic counselor to understand your results.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-medium text-blue-600 mb-2">Step {item.step}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Privacy Commitment */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                      Your Privacy is Our Priority
                    </h2>
                    <p className="text-slate-600 mb-4">
                      We understand the sensitive nature of genetic information. Your data is 
                      encrypted, stored securely, and never sold or shared with third parties. 
                      You maintain full control over your genetic information at all times.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        End-to-end encryption
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        No data selling
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        You control your data
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        HIPAA-inspired practices
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Educational Resources */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Educational Resources</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Learn more about genetic carrier screening from trusted sources.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Genetic Counseling FAQ',
                source: 'National Human Genome Research Institute',
                url: 'https://www.genome.gov/about-genomics/fact-sheets/Genetic-Counseling-Fact-Sheet',
                icon: Info,
              },
              {
                title: 'Carrier Screening Guide',
                source: 'American College of Obstetricians and Gynecologists',
                url: 'https://www.acog.org/womens-health/faqs/carrier-screening',
                icon: BookOpen,
              },
              {
                title: 'Find a Genetic Counselor',
                source: 'National Society of Genetic Counselors',
                url: 'https://www.nsgc.org/find-a-genetic-counselor',
                icon: Phone,
              },
            ].map((resource, index) => (
              <motion.a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="block group"
              >
                <Card className="h-full hover:shadow-lg hover:border-blue-300 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <resource.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{resource.source}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Learn Your Carrier Status?</h2>
            <p className="text-indigo-100 mb-8 text-lg">
              Upload your genetic data now to get comprehensive carrier screening results. 
              Your journey to better understanding your genetics starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your DNA Data
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/faq">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Info className="w-5 h-5 mr-2" />
                  Have Questions?
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Final Disclaimer */}
        <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-2">Medical Disclaimer</p>
              <p className="text-sm text-amber-800">
                This carrier screening tool is for educational purposes only and is not intended 
                to provide medical advice, diagnosis, or treatment recommendations. The results 
                should not be used as a substitute for professional medical advice. Always consult 
                with a qualified healthcare provider or genetic counselor regarding your results 
                and any health concerns. Genetic testing has limitations and may not detect all 
                variants. A negative result does not completely eliminate the risk of being a carrier 
                or developing a genetic condition.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CarrierLandingPage;
