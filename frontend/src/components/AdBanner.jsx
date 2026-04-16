import React from 'react';

/**
 * Ad placement component — ready for Google AdSense or any ad network.
 * Replace the placeholder with actual ad code when you have an AdSense account.
 *
 * Variants:
 * - 'banner': 728x90 (desktop leaderboard)
 * - 'mobile-banner': 320x50 (mobile banner)
 * - 'rectangle': 300x250 (medium rectangle)
 * - 'leaderboard': 970x90 (large leaderboard)
 * - 'in-article': fluid height (in-content ad)
 */
export default function AdBanner({ variant = 'banner', className = '' }) {
  const sizes = {
    'banner': { h: '90px', maxW: '728px' },
    'mobile-banner': { h: '60px', maxW: '320px' },
    'rectangle': { h: '250px', maxW: '300px' },
    'leaderboard': { h: '90px', maxW: '970px' },
    'in-article': { h: '100px', maxW: '100%' },
  };

  const size = sizes[variant] || sizes.banner;

  return (
    <div
      className={`ad-placement mx-auto ${className}`}
      style={{
        width: '100%',
        maxWidth: size.maxW,
        minHeight: size.h,
        background: 'rgba(255,255,255,0.015)',
        border: '1px dashed rgba(255,255,255,0.05)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      data-ad-variant={variant}
    >
      {/*
        Replace this with Google AdSense code:
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true" />
      */}
      <span className="text-[10px] text-white/8 font-medium tracking-wider uppercase select-none">מודעה</span>
    </div>
  );
}
