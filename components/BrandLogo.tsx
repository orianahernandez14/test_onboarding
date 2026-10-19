import React from 'react';

interface BrandLogoProps {
  /** Imagen del logo (obligatoria) */
  imgSrc: string;

  /** Texto alternativo (accesibilidad) */
  alt?: string;

  /** Mostrar texto a la derecha */
  withText?: boolean;

  /** Texto principal */
  title?: string;

  /** Subtítulo */
  subtitle?: string;

  /** Estilos */
  className?: string;
  iconClassName?: string;
  textClassName?: string;

  /** Variante de color */
  variant?: 'default' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  imgSrc,
  alt = 'Logo institucional',
  withText = false,
  title,
  subtitle,
  className = '',
  iconClassName = 'h-10 w-auto',
  textClassName = 'text-base',
  variant = 'default',
}) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Logo SIEMPRE como imagen */}
      <img
        src={imgSrc}
        alt={alt}
        className={`${iconClassName} object-contain`}
        loading="eager"
      />

      {/* Texto opcional y parametrizado */}
      {withText && (title || subtitle) && (
        <div className="flex flex-col justify-center leading-[1.1]">
          {title && (
            <span
              className={`font-bold tracking-tight ${
                isLight ? 'text-white' : 'text-brand-navy'
              } ${textClassName}`}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span
              className={`text-[9px] font-medium tracking-wide ${
                isLight ? 'text-brand-cyan/80' : 'text-brand-grey'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
