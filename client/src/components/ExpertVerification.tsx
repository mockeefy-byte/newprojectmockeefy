import { useState, useRef, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from "sonner";
import { Input, PrimaryButton } from '../pages/ExpertDashboard';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

interface ExpertVerificationProps {
  onUpdate?: () => void;
  profileData?: any;
  isMissing?: boolean;
}

const ExpertVerification = ({ onUpdate, isMissing }: ExpertVerificationProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ verification: { companyIdFile: File | null; aadharFile: File | null; linkedin: string } }>({
    verification: {
      companyIdFile: null,
      aadharFile: null,
      linkedin: '',
    },
  });

  // State to store fetched verification details (including name and url)
  const [fetchedVerification, setFetchedVerification] = useState<any>(null);

  // State to store verification status
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/expert/profile');
      if (response.data.success && response.data.profile.verification) {
        setFetchedVerification(response.data.profile.verification);
        setProfile((p) => ({
          ...p,
          verification: {
            ...p.verification,
            linkedin: response.data.profile.verification.linkedin || '',
          },
        }));
      }
      // Fetch verification status
      if (response.data.success && response.data.profile.status) {
        setVerificationStatus(response.data.profile.status);
      }
    } catch (error: any) {
      console.error("Error fetching profile", error);
    }
  };

  const companyIdRef = useRef<HTMLInputElement>(null);
  const aadharRef = useRef<HTMLInputElement>(null);

  const handleCompanyIdFile = (file: File) =>
    setProfile((p) => ({ ...p, verification: { ...p.verification, companyIdFile: file } }));

  const handleAadharFile = (file: File) =>
    setProfile((p) => ({ ...p, verification: { ...p.verification, aadharFile: file } }));

  const saveVerification = async () => {
    try {
      const formData = new FormData();
      if (profile.verification.companyIdFile) {
        formData.append('companyIdFile', profile.verification.companyIdFile);
      }
      if (profile.verification.aadharFile) {
        formData.append('aadharFile', profile.verification.aadharFile);
      }
      formData.append('linkedin', profile.verification.linkedin);

      // Add userid header as needed, replace userId with actual user ID
      setSaving(true);
      await axios.put('/api/expert/verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Verification saved successfully!');
      fetchProfile(); // Refresh profile to get updated verification status
      if (onUpdate) onUpdate();

    } catch (error: any) {
      console.error('Error saving verification:', error);
      toast.error('Failed to save verification.');
    } finally {
      setSaving(false);
    }
  };

  const isVerified = verificationStatus === 'Active' || verificationStatus === 'approved';

  return (
    <>
      <div className="h-full">
        {/* Verified Badge */}
        {isVerified && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="bg-green-600 rounded-full p-1.5">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Verified Expert</p>
              <p className="text-xs text-green-600">Your profile has been verified by our team</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            Verification
            {isMissing && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Action Required</span>}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Company ID, Aadhar and LinkedIn</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company ID Proof</label>
            <input
              ref={companyIdRef}
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => e.target.files && handleCompanyIdFile(e.target.files[0])}
              className="text-sm text-gray-600 w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {profile.verification.companyIdFile && (
              <div className="text-sm text-green-600 mt-2 font-medium">✓ File selected</div>
            )}
            {fetchedVerification?.companyId?.url && !profile.verification.companyIdFile && (
              <div className="text-sm mt-2">
                <span className="text-gray-600">Current: </span>
                <a href={fetchedVerification.companyId.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {fetchedVerification.companyId.name || "View File"}
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card</label>
            <input
              ref={aadharRef}
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => e.target.files && handleAadharFile(e.target.files[0])}
              className="text-sm text-gray-600 w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {profile.verification.aadharFile && (
              <div className="text-sm text-green-600 mt-2 font-medium">✓ File selected</div>
            )}
            {fetchedVerification?.aadhar?.url && !profile.verification.aadharFile && (
              <div className="text-sm mt-2">
                <span className="text-gray-600">Current: </span>
                <a href={fetchedVerification.aadhar.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {fetchedVerification.aadhar.name || "View File"}
                </a>
              </div>
            )}
          </div>

          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/yourprofile"
            value={profile.verification.linkedin}
            onChange={(v) =>
              setProfile((p) => ({ ...p, verification: { ...p.verification, linkedin: v } }))
            }
          />
        </div>

        <div className="mt-6 flex justify-end">
          <PrimaryButton
            onClick={saveVerification}
            loading={saving}
            disabled={saving}
          >
            Save Changes
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};

export default ExpertVerification;
