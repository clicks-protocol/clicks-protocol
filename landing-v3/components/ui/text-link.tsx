import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const textLinkVariants = cva(
  'inline-flex items-center gap-1.5 text-accent font-medium hover:underline ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
      },
    },
    defaultVariants: { size: 'sm' },
  }
);

export interface TextLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof textLinkVariants> {
  external?: boolean;
}

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, size, external, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(textLinkVariants({ size, className }))}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
        {external && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
      </a>
    );
  }
);
TextLink.displayName = 'TextLink';
