// components/AdBanner.jsx
type AdBannerProps = {
  title: string;
  subtitle: string;
};

const AdBanner = ({ title, subtitle }: AdBannerProps) => (
  <div className="bg-linear-to-r from-yellow-100 via-orange-50 to-yellow-50 border border-yellow-300 shadow rounded-xl px-4 py-5 flex items-center gap-3 animate-pulse">
    <span className="text-2xl">🎁</span>
    <div>
      <div className="font-bold text-primary">{title}</div>
      <div className="text-xs text-yellow-500 font-medium">{subtitle}</div>
    </div>
  </div>
);

export default AdBanner;
