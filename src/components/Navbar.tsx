import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-white/[0.05] bg-[#0d1017] sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Official KoinX Logo SVG - High Fidelity Refinement */}
        <div className="flex items-center cursor-pointer">
          <svg width="130" height="32" viewBox="0 0 130 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo_grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBBC05" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
            
            {/* Koin Text - Using a more geometric styling */}
            <text x="0" y="24" fill="#0052FE" style={{ font: '800 26px "Inter", "Segoe UI", sans-serif', letterSpacing: '-0.8px' }}>Koin</text>
            
            {/* The Dot on the 'i' - styled as a signature mark */}
            <circle cx="36" cy="7.5" r="3.8" fill="#0052FE" />
            
            {/* Geometric X - Precisely crafted as two intersecting elements */}
            <g transform="translate(60, 4)">
              {/* Left Part of X */}
              <path d="M0 4.5L8.5 12L0 19.5H6L14.5 12L6 4.5H0Z" fill="url(#logo_grad)" />
              {/* Right Part of X */}
              <path d="M23 4.5L14.5 12L23 19.5H17L8.5 12L17 4.5H23Z" fill="url(#logo_grad)" />
              
              {/* Registered Trademark */}
              <g transform="translate(25, 2)">
                <circle cx="3" cy="3" r="3.5" stroke="white" strokeOpacity="0.3" strokeWidth="0.7" />
                <text x="1.8" y="4.5" fill="white" fillOpacity="0.3" style={{ font: 'bold 4px Arial' }}>R</text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
