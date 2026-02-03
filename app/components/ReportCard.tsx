import { motion } from 'framer-motion';
import { 
  Activity, 
  Pill, 
  Shield, 
  Heart, 
  Clipboard, 
  Dna,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
} from 'lucide-react';
import { cn } from '~/utils/cn';
import type { ReportSection } from '~/types/genetics';

interface ReportCardProps {
  section: ReportSection;
  index: number;
}

const iconMap: Record<string, any> = {
  activity: Activity,
  pill: Pill,
  shield: Shield,
  heart: Heart,
  clipboard: Clipboard,
  dna: Dna,
  alert: AlertCircle,
  check: CheckCircle,
  info: Info,
  lightbulb: Lightbulb,
};

const priorityColors = {
  critical: 'bg-red-50 border-red-200 text-red-900',
  high: 'bg-orange-50 border-orange-200 text-orange-900',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  low: 'bg-blue-50 border-blue-200 text-blue-900',
};

const priorityBadges = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

export function ReportCard({ section, index }: ReportCardProps) {
  const Icon = iconMap[section.icon] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-xl border-2 p-6 transition-all hover:shadow-md',
        priorityColors[section.priority] || 'bg-white border-slate-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          section.priority === 'critical' ? 'bg-red-100' :
          section.priority === 'high' ? 'bg-orange-100' :
          section.priority === 'medium' ? 'bg-yellow-100' :
          'bg-blue-100'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            section.priority === 'critical' ? 'text-red-600' :
            section.priority === 'high' ? 'text-orange-600' :
            section.priority === 'medium' ? 'text-yellow-600' :
            'text-blue-600'
          )} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold">{section.title}</h3>
            <span className={cn(
              'px-2 py-0.5 text-xs rounded-full font-medium uppercase',
              priorityBadges[section.priority]
            )}>
              {section.priority}
            </span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">{section.content}</p>
        </div>
      </div>

      {/* Action Items */}
      {section.actionItems && section.actionItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {section.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drug Specific Details */}
      {section.type === 'drug' && section.details && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10">
          {section.details.map((detail: any, i: number) => (
            <div key={i} className="mb-3 last:mb-0">
              <h4 className="font-semibold text-sm">{detail.category}</h4>
              <p className="text-sm opacity-80">{detail.drugs.join(', ')}</p>
              <p className="text-sm mt-1 font-medium">{detail.guidance}</p>
            </div>
          ))}
        </div>
      )}

      {/* Risk Details */}
      {section.type === 'risk' && section.risks && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10">
          {section.risks.slice(0, 3).map((risk: any, i: number) => (
            <div key={i} className="mb-3 last:mb-0 p-3 bg-white bg-opacity-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded font-medium',
                  risk.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                  risk.riskLevel === 'Moderate' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                )}>
                  {risk.riskLevel} Risk
                </span>
                <span className="font-semibold text-sm">{risk.condition}</span>
              </div>
              <p className="text-sm opacity-80">{risk.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Details */}
      {section.type === 'protocol' && section.protocol && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10 space-y-4">
          {section.protocol.supplements && section.protocol.supplements.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">💊 Supplements</h4>
              <ul className="space-y-1">
                {section.protocol.supplements.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {section.protocol.diet && section.protocol.diet.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">🥗 Diet</h4>
              <ul className="space-y-1">
                {section.protocol.diet.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {section.protocol.lifestyle && section.protocol.lifestyle.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">🏃 Lifestyle</h4>
              <ul className="space-y-1">
                {section.protocol.lifestyle.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {section.protocol.monitoring && section.protocol.monitoring.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">📊 Monitoring</h4>
              <ul className="space-y-1">
                {section.protocol.monitoring.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Variant List */}
      {section.type === 'variants' && section.variants && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left opacity-60">
                  <th className="pb-2">RSID</th>
                  <th className="pb-2">Gene</th>
                  <th className="pb-2">Genotype</th>
                  <th className="pb-2">Impact</th>
                </tr>
              </thead>
              <tbody>
                {section.variants.slice(0, 10).map((variant: any, i: number) => (
                  <tr key={i} className="border-t border-current border-opacity-10">
                    <td className="py-2 font-mono">{variant.rsid}</td>
                    <td className="py-2">{variant.gene}</td>
                    <td className="py-2 font-mono">{variant.genotype}</td>
                    <td className="py-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        variant.impact === 'High' || variant.impact === 'Very High' 
                          ? 'bg-red-100 text-red-700' :
                        variant.impact === 'Moderate'
                          ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      )}>
                        {variant.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {section.variants.length > 10 && (
              <p className="text-xs opacity-60 mt-2 text-center">
                + {section.variants.length - 10} more variants
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
