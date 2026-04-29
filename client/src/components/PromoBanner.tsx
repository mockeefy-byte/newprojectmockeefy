const PromoBanner = () => (
  <div className="flex flex-col md:flex-row items-center justify-between w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm mb-7 relative overflow-hidden">
    {/* Left: Content */}
    <div className="flex flex-col justify-center flex-1 min-w-0 mr-6">
      <div className="flex items-center gap-2 mb-3">
        <span className=" bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
          🚀 NEW
        </span>
        <span className="text-gray-500 text-xs">AI-Powered Interviews</span>
      </div>
      
      <h2 className="font-bold text-xl md:text-2xl text-gray-900 mb-2">
        Master Interviews with <span className="text-blue-600">Mock++</span>
      </h2>
      
      <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-md">
        Get instant AI feedback, realistic practice, and personalized coaching to ace your next interview.
      </p>

      <a
        href="#"
        className="bg-gray-900  hover:bg-blue-700 px-5 py-2.5 rounded-lg text-white font-semibold text-sm shadow transition-all duration-300 w-fit"
      >
        Try Now - Free
      </a>
    </div>

    {/* Right: Image */}
    <div className="flex-shrink-0 mt-4 md:mt-0">
      <div className="relative">
        <img
          src="/media/images/600x600/31.jpg"
          alt="AI Interview Assistant"
          className="h-28 w-28 md:h-32 md:w-32 object-cover rounded-xl border-2 border-white shadow-lg"
        />
        <span className="absolute -top-2 -right-2 bg-gray-900  text-white text-xs px-2 py-1 rounded-full font-semibold">
          AI
        </span>
      </div>
    </div>
  </div>
);

export default PromoBanner;