import { useState, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { Download, Printer, Save, Share2, ChevronLeft } from 'lucide-react';
import { downloadResumePDF, printResume } from '../../utils/pdfDownload';
import { ModernResumeTemplate } from './Templates/ModernTemplate';
import { FresherTemplate } from './Templates/FresherTemplate';
import { ExperiencedTemplate } from './Templates/ExperiencedTemplate';
import { MinimalATSTemplate } from './Templates/MinimalATSTemplate';

export function DownloadAndExportStep() {
  const { resumeData, selectedTemplate, prevStep } = useResume();
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const fileName = `${resumeData.personalDetails.fullName || 'resume'}.pdf`;
      await downloadResumePDF(resumeRef.current, fileName);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('PDF download failed. Please try the Print option instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printResume(resumeRef.current);
  };

  const handleSaveLocally = () => {
    const data = {
      resumeData,
      selectedTemplate,
      savedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalDetails.fullName || 'resume'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    const data = {
      resumeData,
      selectedTemplate,
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}/resume/${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Download & Export</h2>
        <p className="text-sm text-gray-600 mt-1">
          Your resume is ready! Choose how you want to save it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Download PDF */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
        >
          <Download className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Download PDF</h3>
          <p className="text-sm text-gray-600 mt-1">
            {isDownloading ? 'Preparing...' : 'Save as PDF file to your device'}
          </p>
        </motion.button>

        {/* Print */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <Printer className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Print Resume</h3>
          <p className="text-sm text-gray-600 mt-1">
            Open print dialog to print your resume
          </p>
        </motion.button>

        {/* Save JSON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveLocally}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <Save className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Save Data</h3>
          <p className="text-sm text-gray-600 mt-1">
            Save your resume data as a JSON file
          </p>
        </motion.button>

        {/* Share Link */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyLink}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <Share2 className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Share Link</h3>
          <p className="text-sm text-gray-600 mt-1">
            {copied ? 'Link copied!' : 'Copy shareable link'}
          </p>
        </motion.button>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
        <div
          ref={resumeRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
          style={{
            width: '210mm',
            margin: '0 auto',
            maxWidth: '100%',
          }}
        >
          {selectedTemplate === 'modern' && <ModernResumeTemplate />}
          {selectedTemplate === 'fresher' && <FresherTemplate />}
          {selectedTemplate === 'experienced' && <ExperiencedTemplate />}
          {selectedTemplate === 'minimal' && <MinimalATSTemplate />}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          onClick={prevStep}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Template
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
      </div>
    </motion.div>
  );
}
