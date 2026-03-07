// src/pages/expert/Skills.tsx

import SkillsAndExpertise from "../../components/SkillsAndExpertise";
import ExpertSkillManager from "../../components/expert/ExpertSkillManager";
import VerificationManager from "../../components/expert/VerificationManager";

export default function SkillsPage() {
  return (
    <div className="h-full space-y-6 overflow-y-auto p-1">
      <ExpertSkillManager />
      <VerificationManager />
      <div className="opacity-50 pointer-events-none filter grayscale block hidden">
        {/* Hiding old component or keeping it as legacy read-only if needed */}
        <SkillsAndExpertise />
      </div>
    </div>
  );
}
