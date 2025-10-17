
import React from 'react';

interface IconProps {
  className?: string;
}

const LightBulbIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a7.5 7.5 0 01-7.5 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75L12 15l2.25-2.25M9.75 9.75L12 12l2.25-2.25M12 21a9 9 0 100-18 9 9 0 000 18z" transform="rotate(180 12 12)"/>
     <path strokeLinecap="round" strokeLinejoin="round" d="M9.308 9.308c1.356-1.356 3.644-1.356 5.385 0 .904.904 1.256 2.118.99 3.238a4.5 4.5 0 01-6.364 0c-.266-1.12.086-2.334.99-3.238zM12 18.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.008z" />
  </svg>
);

export default LightBulbIcon;
