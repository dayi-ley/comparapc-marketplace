/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
}

export const YapeLogo: React.FC<LogoProps> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Yape">
    <rect width="48" height="48" rx="12" fill="#7A2E8E" />
    <path
      d="M15 14h5.4l4 7.2 4-7.2H34l-7.2 12.3V34h-5.2V26.3L15 14z"
      fill="#ffffff"
    />
    <circle cx="34" cy="34" r="3" fill="#C084FC" />
  </svg>
);

export const PlinLogo: React.FC<LogoProps> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Plin">
    <rect width="48" height="48" rx="12" fill="#00B0B9" />
    <path
      d="M20 12h5v9.2c1.2-.9 2.6-1.4 4.2-1.4 3.8 0 6.8 3 6.8 7s-3 7-6.8 7c-1.8 0-3.4-.6-4.6-1.7V34h-4.6V12zm8.6 11.4c-1.7 0-3 1.3-3 3.1s1.3 3.1 3 3.1 3-1.3 3-3.1-1.3-3.1-3-3.1z"
      fill="#ffffff"
    />
    <circle cx="16" cy="14" r="2.6" fill="#FDE047" />
  </svg>
);

export const VisaLogo: React.FC<LogoProps> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Visa">
    <rect width="48" height="48" rx="12" fill="#1A1F71" />
    <path
      d="M20.4 31.5h-3.2l2-12.9h3.2l-2 12.9zm9.9-12.6c-.7-.3-1.8-.6-3-.6-3.1 0-5.3 1.6-5.3 4 0 1.8 1.6 2.8 2.9 3.4 1.3.6 1.8 1 1.8 1.6 0 .8-1 1.1-2 1.1-1.4 0-2.2-.2-3.4-.7l-.5-.2-.5 3c.8.4 2.4.7 4 .7 3.4 0 5.6-1.6 5.6-4.1 0-1.6-1-2.7-3-3.6-1.3-.6-2.1-1-2.1-1.7 0-.5.7-1 2-1 1.2 0 2 .2 2.6.5l.3.1.5-2.7zm5.7 12.6c-.7 0-1.2-.4-1.5-1.1l-5.3-11.8h3.3l.7 1.9h4.2l.4-1.9h2.9l-2.7 12.9h-2z"
      fill="#ffffff"
    />
  </svg>
);

export const MastercardLogo: React.FC<LogoProps> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Mastercard">
    <rect width="48" height="48" rx="12" fill="#1A1F71" />
    <circle cx="20" cy="24" r="9" fill="#EB001B" />
    <circle cx="28" cy="24" r="9" fill="#F79E1B" />
    <path
      d="M24 17.5a9 9 0 0 0 0 13 9 9 0 0 0 0-13z"
      fill="#FF5F00"
    />
  </svg>
);

export const TransferenciaLogo: React.FC<LogoProps> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Transferencia">
    <rect width="48" height="48" rx="12" fill="#334155" />
    <path
      d="M12 21l12-8 12 8v2H12v-2z"
      fill="#93C5FD"
    />
    <rect x="15" y="24" width="3" height="10" fill="#E2E8F0" />
    <rect x="22.5" y="24" width="3" height="10" fill="#E2E8F0" />
    <rect x="30" y="24" width="3" height="10" fill="#E2E8F0" />
    <rect x="12" y="34" width="24" height="3" rx="1" fill="#93C5FD" />
  </svg>
);

export const PAYMENT_LOGOS: Record<string, React.FC<LogoProps>> = {
  yape: YapeLogo,
  plin: PlinLogo,
  tarjeta: MastercardLogo,
  visa: VisaLogo,
  transferencia: TransferenciaLogo,
};
