import React from 'react';
import { cn } from '@/lib/utils';
import { Map as MapIcon } from 'lucide-react';

export function Card({ className, children, noPadding = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { className?: string, children?: React.ReactNode, noPadding?: boolean }) {
  const isFlexCol = className?.includes("flex-col");
  return (
    <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors", className)} {...props}>
      <div className={cn("h-full w-full", !noPadding && "p-4 sm:p-5", isFlexCol && "flex flex-col")}>
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { title: React.ReactNode, subtitle?: React.ReactNode, action?: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)} {...props}>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Badge({ children, variant = 'default', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'critical' | 'info' | 'outline', className?: string }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    danger: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
    critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    outline: 'border border-slate-200 text-slate-600 bg-transparent dark:border-slate-700 dark:text-slate-400',
  };
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border transition-colors", variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export function Button({ children, variant = 'primary', size = 'default', className, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'default' | 'lg' }) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent shadow-sm',
    secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-700',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-sm',
  };
  
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs rounded-md',
    default: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  };
  
  return (
    <button 
      className={cn("inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function MapPlaceholder({ title = "Interactive Map Viewer", className }: { title?: string, className?: string }) {
  return (
    <div className={cn("w-full h-full min-h-[300px] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 relative overflow-hidden transition-colors", className)}>
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" viewBox=\\"0 0 20 20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"currentColor\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"1\\"/>%3Ccircle cx=\\"13\\" cy=\\"13\\" r=\\"1\\"/>%3C/g%3E%3C/svg%3E")' }}></div>
      <MapIcon className="h-10 w-10 mb-3 opacity-50" />
      <p className="font-medium">{title}</p>
      <p className="text-sm mt-1 text-slate-500 dark:text-slate-500">Map data visualization pending API connection</p>
    </div>
  );
}

export { BaseMap } from './Map';
