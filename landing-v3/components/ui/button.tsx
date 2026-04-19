import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground shadow hover:bg-accent/90',
        outline:
          'border border-border bg-transparent text-foreground hover:border-accent hover:bg-white/5',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        toggle:
          'bg-card text-muted-foreground border border-border hover:border-accent ' +
          'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground ' +
          'data-[state=on]:border-accent data-[state=on]:font-bold',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-14 px-10 text-xl',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
