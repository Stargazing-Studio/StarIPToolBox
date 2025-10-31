import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const { t } = useLanguage();

    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-[3px]',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div
            className={`animate-spin rounded-full border-solid border-white/20 border-t-sky-400 ${sizeClasses[size]}`}
            role="status"
        >
            <span className="sr-only">{t('components.spinner.srLabel')}</span>
        </div>
    );
};
