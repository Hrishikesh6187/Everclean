import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function UploadDocuments() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const application_id = location.state?.applicationId;
      if (!application_id) {
        throw new Error('Application ID not found');
      }

      // Validate file sizes
      pdfFiles.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`File ${file.name} exceeds 10MB size limit`);
        }
      });

      // Upload all files in parallel
      const uploads = pdfFiles.map(async (file) => {
        const filePath = `documents/${application_id}/${file.name}`;
        const { error: uploadError, data } = await supabase.storage.from('freelancer-documents').upload(filePath, file);
        if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('freelancer-documents')
          .getPublicUrl(filePath);

        // Insert record in media table with document URL
        const { error: mediaError } = await supabase.from('media').insert([
          {
            media_name: file.name,
            pdf_file: filePath,
            document_url: [publicUrl], // Store URL in the document_url array
            application_id: application_id,
          },
        ]);
        if (mediaError) throw new Error(`Failed to insert media record for ${file.name}: ${mediaError.message}`);
      });

      await Promise.all(uploads);
      alert('Application submitted successfully!');
      navigate('/');
    } catch (err) {
      setError(`Submission failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Upload Documents
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Please upload your required documents
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Upload Your Documents</h2>

            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF Files
                </label>
                <input
                  id="documents"
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                onClick={() => navigate('/apply')}
                className="mt-4 w-full flex justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
              >
                Back to Home
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
