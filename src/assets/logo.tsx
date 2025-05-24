import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const PTITLogo: React.FC<LogoProps> = ({ className, size = 32 }) => {
  return (
    <div className={`flex items-center  ${className}`}>
      <img
        src="https://ptit.edu.vn/wp-content/uploads/2024/08/logo-PTIT-1240x1536.jpg"
        alt="PTIT Logo"
        width={size}
        height={size}
        style={{ objectFit: 'contain', textAlign: 'center' }}
      />
    </div>
  );
};

// Add export for Logo to fix the import issue in MainNavigation
export const Logo = PTITLogo;
