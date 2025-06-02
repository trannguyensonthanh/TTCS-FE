import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';

const InfoRowDialog: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}> = ({ label, value, className }) => (
  <div
    className={cn(
      'grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-x-4 gap-y-1 py-2.5 border-b border-border/40 dark:border-slate-700/40 last:border-b-0',
      className
    )}
  >
    <FormLabel className="sm:text-right text-sm font-medium text-muted-foreground col-span-1 sm:col-auto pt-0.5">
      {label}
    </FormLabel>
    <div className="sm:col-span-2 text-sm text-foreground break-words">
      {value}
    </div>
  </div>
);

export default InfoRowDialog;
