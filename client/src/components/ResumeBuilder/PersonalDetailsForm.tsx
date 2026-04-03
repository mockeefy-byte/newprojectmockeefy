import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export function PersonalDetailsForm() {
  const { resumeData, updatePersonalDetails, nextStep } = useResume();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePersonalDetails({ [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!resumeData.personalDetails.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!resumeData.personalDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.personalDetails.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!resumeData.personalDetails.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!resumeData.personalDetails.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
        <p className="text-sm text-gray-600 mt-1">
          Start by providing your basic information
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            type="text"
            name="fullName"
            value={resumeData.personalDetails.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <Input
            type="email"
            name="email"
            value={resumeData.personalDetails.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <Input
            type="tel"
            name="phone"
            value={resumeData.personalDetails.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <Input
            type="text"
            name="location"
            value={resumeData.personalDetails.location}
            onChange={handleChange}
            placeholder="San Francisco, CA"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">{errors.location}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile (Optional)
          </label>
          <Input
            type="url"
            name="linkedIn"
            value={resumeData.personalDetails.linkedIn || ''}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Website (Optional)
          </label>
          <Input
            type="url"
            name="portfolio"
            value={resumeData.personalDetails.portfolio || ''}
            onChange={handleChange}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
