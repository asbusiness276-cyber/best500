import { AFFILIATE_REL } from "../constants/affiliate";

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function AffiliateLink({ href, children, className, ariaLabel }: AffiliateLinkProps) {
  return (
    <a href={href} rel={AFFILIATE_REL} target="_blank" className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
