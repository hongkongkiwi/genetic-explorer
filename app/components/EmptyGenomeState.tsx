import React, { useState } from 'react';
import { Upload, Dna, BookOpen, ArrowRight } from 'lucide-react';
import { DNATestingServicesGuide } from './DNATestingServicesGuide';

interface EmptyGenomeStateProps {
  onUploadClick: () => void;
}

export function EmptyGenomeState({ onUploadClick }: EmptyGenomeStateProps) {
  const [showServicesGuide, setShowServicesGuide] = useState(false);

  if (showServicesGuide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => setShowServicesGuide(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Upload Options
            </button>
          </div>
        </div>
        <DNATestingServicesGuide onClose={() => setShowServicesGuide(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Dna className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          No Genetic Data Yet
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your raw DNA data to unlock personalized ancestry analysis, 
          health insights, and connect with genetic relatives.
        </p>
      </div>

      {/* Main Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Upload Option */}
        <button
          onClick={onUploadClick}
          className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-left hover:shadow-xl transition-all hover:scale-[1.02]"
        >
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Upload Existing Data</h3>
          <p className="text-blue-100 mb-6">
            Already have your raw DNA file? Upload it now to get started immediately.
          </p>
          <div className="flex items-center gap-2 font-semibold">
            Upload File
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Get Tested Option */}
        <button
          onClick={() => setShowServicesGuide(true)}
          className="group bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-[1.02] hover:border-blue-300"
        >
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
            <Dna className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Your DNA Tested</h3>
          <p className="text-gray-600 mb-6">
            Don't have your DNA data yet? Compare testing services and find the best option for you.
          </p>
          <div className="flex items-center gap-2 font-semibold text-blue-600">
            Compare Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Supported Formats */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold">Supported File Formats</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5">
            <div className="font-semibold text-gray-900 mb-2">23andMe</div>
            <div className="text-sm text-gray-600">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">genome_[name]_full_[date].txt</code>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              ~640,000 SNPs • Most popular option
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5">
            <div className="font-semibold text-gray-900 mb-2">AncestryDNA</div>
            <div className="text-sm text-gray-600">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">dna-data-[date].zip</code>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              ~700,000 SNPs • Best for genealogy
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5">
            <div className="font-semibold text-gray-900 mb-2">Other Formats</div>
            <div className="text-sm text-gray-600">
              MyHeritage, FamilyTreeDNA, Living DNA, tellmeGen
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Plus whole genome (VCF/BAM) formats
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Privacy Note:</strong> Your genetic data is encrypted and stored securely. 
          We never share your raw DNA data with third parties. You can delete your data at any time.
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-center mb-8">How It Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Get Tested', desc: 'Order a DNA kit from a testing service' },
            { step: 2, title: 'Download Data', desc: 'Download your raw DNA file' },
            { step: 3, title: 'Upload', desc: 'Upload your file securely to Genetic Explorer' },
            { step: 4, title: 'Explore', desc: 'Discover insights about your genetics' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyGenomeState;
