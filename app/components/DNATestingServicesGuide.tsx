import React, { useState } from 'react';
import { dnaTestingServices, getRecommendedServices, coverageTiers, type DNAService } from '../data/dnaTestingServices';
import { ExternalLink, Check, X, Shield, DollarSign, Globe, Database, AlertTriangle, Info } from 'lucide-react';

interface DNATestingServicesGuideProps {
  onClose?: () => void;
}

export function DNATestingServicesGuide({ onClose }: DNATestingServicesGuideProps) {
  const [selectedService, setSelectedService] = useState<DNAService | null>(null);
  const [filter, setFilter] = useState<'all' | 'recommended' | 'wgs'>('all');
  const [showComparison, setShowComparison] = useState(false);

  const filteredServices = dnaTestingServices.filter(service => {
    if (filter === 'recommended') return service.recommended;
    if (filter === 'wgs') return service.coverage.percentage > 50;
    return true;
  });

  const recommended = getRecommendedServices();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Get Your DNA Tested</h2>
        <p className="text-gray-600 mb-6">
          To use Genetic Explorer, you'll need your raw DNA data. Here's a guide to services 
          that provide downloadable raw DNA files compatible with our platform.
        </p>

        {/* Quick Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Our Top Recommendations
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-blue-100"
              >
                <div className="font-semibold text-blue-900">{service.name}</div>
                <div className="text-sm text-gray-600 mt-1">{service.price.note || `$${service.price.usd}`}</div>
                <div className="text-xs text-gray-500 mt-2">{service.coverage.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coverage Tiers */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(coverageTiers).map(([key, tier]) => (
            <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900">{tier.name}</h4>
              <div className="text-sm text-gray-600 mt-2">
                <span className="font-medium">{tier.snpCount}</span> SNPs
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{tier.coverage}</span> of genome
              </div>
              <div className="text-sm text-gray-600">
                Price: <span className="font-medium">{tier.priceRange}</span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Best for: {tier.bestFor.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setFilter('recommended')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'recommended' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setFilter('wgs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'wgs' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Whole Genome
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
              service.recommended ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedService(service)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.company}</p>
              </div>
              {service.recommended && (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium">${service.price.usd}</span>
                {service.price.note && (
                  <span className="text-gray-500 text-xs">({service.price.note})</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-gray-400" />
                <span>{service.coverage.description}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-xs">{service.regions.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className={`capitalize ${
                  service.privacy.rating === 'excellent' ? 'text-green-600' :
                  service.privacy.rating === 'good' ? 'text-blue-600' :
                  service.privacy.rating === 'fair' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  Privacy: {service.privacy.rating}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {service.bestFor.slice(0, 3).map(use => (
                <span key={use} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {use}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
              <span>View Details</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                  <p className="text-gray-600">{selectedService.company}</p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Price & Coverage */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Price</div>
                  <div className="text-2xl font-bold">${selectedService.price.usd}</div>
                  {selectedService.price.note && (
                    <div className="text-sm text-gray-500">{selectedService.price.note}</div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Coverage</div>
                  <div className="text-2xl font-bold">
                    {selectedService.coverage.percentage > 1 
                      ? `${selectedService.coverage.percentage}%` 
                      : selectedService.coverage.description}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedService.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Pros</h4>
                  <ul className="space-y-2">
                    {selectedService.pros.map(pro => (
                      <li key={pro} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Cons</h4>
                  <ul className="space-y-2">
                    {selectedService.cons.map(con => (
                      <li key={con} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Raw Data Download Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Raw Data Download Instructions
                </h4>
                {selectedService.rawData.available ? (
                  <>
                    <div className="text-sm text-gray-600 mb-3">
                      Format: {selectedService.rawData.format} | 
                      Time: {selectedService.rawData.downloadTime}
                    </div>
                    <ol className="space-y-2 text-sm">
                      {selectedService.rawData.instructions.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    {selectedService.rawData.importantNotes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded text-sm">
                        <div className="font-medium text-yellow-800 mb-1 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          Important Notes
                        </div>
                        <ul className="list-disc list-inside text-yellow-700">
                          {selectedService.rawData.importantNotes.map(note => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Raw data download not available for this service
                  </div>
                )}
              </div>

              {/* Privacy Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Data Ownership:</span>{' '}
                    {selectedService.privacy.dataOwnership}
                  </div>
                  <div>
                    <span className="font-medium">Deletion Policy:</span>{' '}
                    {selectedService.privacy.deletionPolicy}
                  </div>
                  <div>
                    <span className="font-medium">Third-Party Sharing:</span>{' '}
                    {selectedService.privacy.thirdPartySharing}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <a
                  href={selectedService.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Visit {selectedService.company}
                </a>
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Note: Prices and availability may vary by region. Always check the official website for current pricing.
        </p>
        <p className="mt-2">
          We are not affiliated with any of these services. This guide is for informational purposes only.
        </p>
      </div>
    </div>
  );
}

export default DNATestingServicesGuide;
