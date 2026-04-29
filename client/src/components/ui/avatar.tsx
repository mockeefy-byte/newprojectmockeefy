import React, { useMemo, useState } from "react";
import { getProfileImageUrl } from "../../lib/imageUtils";

type Props = {
  name?: string | null;
  src?: string | null;
  className?: string;
};

/**
 * Simple avatar:
 * - If `src` is available and loads, show image
 * - Else show first letter (no default placeholder image)
 */
export default function Avatar({ name, src, className }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = useMemo(() => {
    const n = (name || "").trim();
    return n ? n[0]!.toUpperCase() : "U";
  }, [name]);

  const shouldShowImage = !!src && !failed;

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {shouldShowImage ? (
        <img
          src={getProfileImageUrl(src)}
          alt={name || "User"}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-elite-blue font-black">
          <span className="leading-none">{initial}</span>
        </div>
      )}
    </div>
  );
}
