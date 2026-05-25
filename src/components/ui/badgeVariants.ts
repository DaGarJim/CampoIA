import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning/15 text-warning',
        danger: 'bg-destructive/15 text-destructive',
        muted: 'bg-secondary text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
