import React from 'react';
import { Event, TemplateId } from '../../types';

interface PassPreviewProps {
  event: Partial<Event>;
  attendeeName?: string;
  ticketType?: 'General' | 'VIP' | 'Speaker' | 'Staff';
  passId?: string;
}

export default function PassPreview({
  event,
  attendeeName = 'ADENIYI COOPER',
  ticketType = 'VIP',
  passId = 'TCS-8F3K29A',
}: PassPreviewProps) {
  const {
    name = 'LAGOS DESIGN SUMMIT',
    date = '2026-11-20',
    time = '16:00',
    venue = 'Civic Centre, Victoria Island',
    organizer_name = 'Temi Adesanya',
    brand_color = '#6C47FF',
    template = 'modern',
    font_style = 'default',
    banner_url = '',
  } = event;

  // Render dummy SVG vector QR Code that is premium and reactive
  const renderQR = (fgColor: string, bgColor: string) => {
    // Elegant dot matrix alignment helper for a highly realistic vector QR code
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <rect width="100%" height="100%" fill={bgColor} rx="8" />
        
        {/* Finder pattern top-left */}
        <rect x="8" y="8" width="24" height="24" fill={fgColor} rx="2" />
        <rect x="13" y="13" width="14" height="14" fill={bgColor} rx="1" />
        <rect x="16" y="16" width="8" height="8" fill={fgColor} rx="1" />

        {/* Finder pattern top-right */}
        <rect x="68" y="8" width="24" height="24" fill={fgColor} rx="2" />
        <rect x="73" y="13" width="14" height="14" fill={bgColor} rx="1" />
        <rect x="76" y="16" width="8" height="8" fill={fgColor} rx="1" />

        {/* Finder pattern bottom-left */}
        <rect x="8" y="68" width="24" height="24" fill={fgColor} rx="2" />
        <rect x="13" y="73" width="14" height="14" fill={bgColor} rx="1" />
        <rect x="16" y="76" width="8" height="8" fill={fgColor} rx="1" />

        {/* Small alignment block bottom-right */}
        <rect x="72" y="72" width="10" height="10" fill={fgColor} rx="1" />
        <rect x="75" y="75" width="4" height="4" fill={bgColor} />

        {/* Simulated high-fidelity data blocks */}
        <g fill={fgColor} opacity="0.9">
          {/* Vertical/Horizontal bars */}
          <rect x="36" y="8" width="4" height="24" />
          <rect x="44" y="20" width="16" height="4" />
          <rect x="8" y="36" width="24" height="4" />
          <rect x="20" y="44" width="4" height="16" />

          {/* Random mock QR pixels */}
          <rect x="40" y="36" width="6" height="6" />
          <rect x="52" y="36" width="4" height="4" />
          <rect x="60" y="36" width="8" height="4" />
          
          <rect x="36" y="48" width="12" height="4" />
          <rect x="56" y="44" width="6" height="6" />
          <rect x="72" y="36" width="4" height="12" />
          <rect x="80" y="48" width="12" height="6" />

          <rect x="36" y="60" width="8" height="4" />
          <rect x="48" y="56" width="4" height="12" />
          <rect x="60" y="64" width="6" height="6" />
          <rect x="76" y="60" width="16" height="4" />

          <rect x="36" y="76" width="6" height="6" />
          <rect x="48" y="76" width="16" height="4" />
          <rect x="36" y="88" width="20" height="4" />
          <rect x="60" y="84" width="8" height="8" />
        </g>
      </svg>
    );
  };

  const getFontFamilyClass = () => {
    switch (font_style) {
      case 'sans':
        return 'font-sans';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-display'; // Space Grotesk
    }
  };

  const formattedDate = (dStr: string) => {
    try {
      if (!dStr) return 'NOV 20, 2026';
      const parsed = new Date(dStr);
      if (isNaN(parsed.getTime())) return dStr;
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase();
    } catch {
      return dStr;
    }
  };

  // Render templates
  switch (template) {
    case 'minimal': {
      // 1. Template: Minimal (Light theme, generous whitespace, #FFFFFF background)
      return (
        <div 
          id="pass-card-minimal"
          className={`w-full max-w-[420px] bg-white border border-[#E2E2E2] rounded-[20px] shadow-pass-light text-[#111111] overflow-hidden transition-all duration-300 ${getFontFamilyClass()}`}
        >
          {/* Banner Photo placeholder */}
          <div className="w-full h-[120px] bg-neutral-100 flex items-center justify-center relative border-b border-neutral-100">
            {banner_url ? (
              <img src={banner_url} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                <svg className="w-8 h-8 mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-medium tracking-widest uppercase opacity-50">DESIGN BANNER</span>
              </div>
            )}
            {/* Color stripe action indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: brand_color }} />
          </div>

          <div className="p-6 space-y-5">
            {/* Header: Event and Metadata */}
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight leading-none text-neutral-900 uppercase">
                {name || 'LAGOS DESIGN SUMMIT'}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-500 font-mono">
                <span>{formattedDate(date)}</span>
                <span>•</span>
                <span>{time || '16:00'}</span>
              </div>
              <p className="text-xs text-neutral-500 font-sans tracking-tight">{venue}</p>
            </div>

            <hr className="border-neutral-100" />

            {/* Attendee Details */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-widest text-[#6C47FF] uppercase font-mono">TICKET HOLDER</span>
              <h4 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                {attendeeName}
              </h4>
              <div className="inline-block px-2.5 py-0.5 mt-1 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                {ticketType}
              </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Footer QR + Pass ID */}
            <div className="flex items-end justify-between gap-4">
              <div className="w-[84px] h-[84px] bg-neutral-100 p-1.5 rounded-lg border border-neutral-200">
                {renderQR('#111111', '#FFFFFF')}
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-neutral-400">ORGANIZED BY</p>
                <p className="text-xs font-medium text-neutral-700">{organizer_name}</p>
                <p className="text-[11px] font-mono font-medium tracking-wider text-neutral-800 bg-neutral-150 px-2 py-0.5 rounded inline-block mt-2">
                  {passId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'dark': {
      // 2. Template: Dark (#1B1B1B base background, bold event name, premium dark look)
      return (
        <div 
          id="pass-card-dark"
          className={`w-full max-w-[420px] bg-[#111111] border border-neutral-800 rounded-[20px] shadow-pass-dark text-[#F2F2F2] overflow-hidden transition-all duration-300 ${getFontFamilyClass()}`}
        >
          {/* Accent colored indicator left/top */}
          <div className="h-1.5 w-full" style={{ backgroundColor: brand_color }} />

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[9px] font-semibold tracking-widest uppercase text-neutral-500 font-mono">UPCOMING EXPERIENCE</span>
                <h3 className="text-3xl font-bold tracking-tighter leading-8 text-white uppercase">
                  {name || 'LAGOS DESIGN SUMMIT'}
                </h3>
              </div>
              {banner_url && (
                <img src={banner_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-neutral-800" />
              )}
            </div>

            {/* Event Meta */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-900/40 p-3 rounded-lg border border-neutral-900/60 font-mono text-xs text-neutral-400">
              <div>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest">DATE & TIME</p>
                <p className="font-semibold text-neutral-300 mt-0.5">{formattedDate(date)}</p>
                <p className="text-[11px] text-neutral-400">{time}</p>
              </div>
              <div>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest">LOCATION</p>
                <p className="font-semibold text-neutral-300 mt-0.5 truncate">{venue.split(',')[0]}</p>
                <p className="text-[11px] text-neutral-400 truncate">{venue.split(',').slice(1).join(',') || 'Online'}</p>
              </div>
            </div>

            {/* Attendee Info */}
            <div className="space-y-1 relative pl-4 border-l-2" style={{ borderLeftColor: brand_color }}>
              <p className="text-[9px] font-semibold tracking-widest text-neutral-500 uppercase font-mono">ATTENDEE PASS</p>
              <h4 className="text-xl font-bold tracking-tight text-white uppercase">{attendeeName}</h4>
              <div 
                className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-neutral-900 border"
                style={{ borderColor: brand_color, color: brand_color }}
              >
                {ticketType}
              </div>
            </div>

            {/* QR block */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
              <div className="w-[88px] h-[88px] bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                {renderQR('#FFFFFF', '#0A0A0A')}
              </div>
              <div className="text-right flex flex-col items-end space-y-1">
                <span className="text-[11px] font-mono text-neutral-500">{passId}</span>
                <span className="text-[9px] text-neutral-600 uppercase">HOSTED BY</span>
                <span className="text-xs font-medium text-neutral-300">{organizer_name}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'elegant': {
      // 3. Template: Elegant (Sleek, dark, refined luxury look with wider spacing)
      return (
        <div 
          id="pass-card-elegant"
          className={`w-full max-w-[420px] bg-[#161616] border border-[#2a2a2a] rounded-[24px] shadow-pass-dark text-[#EEEEEE] overflow-hidden transition-all duration-300 ${getFontFamilyClass()}`}
        >
          {banner_url && (
            <div className="w-full h-[90px] overflow-hidden">
              <img src={banner_url} alt="Banner" className="w-full h-full object-cover filter brightness-75" />
            </div>
          )}

          <div className="p-7 space-y-7">
            {/* Elegant Header with centered text */}
            <div className="text-center space-y-2">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-500">EXCLUSIVELY INVITED TO</p>
              <h3 className="text-2xl font-serif md:text-3xl font-bold tracking-tight text-white uppercase italic leading-none">
                {name || 'LAGOS DESIGN SUMMIT'}
              </h3>
              <p className="text-xs font-mono text-neutral-400 tracking-widest bg-neutral-900/60 inline-block px-3 py-1 rounded-full border border-neutral-800">
                {formattedDate(date)} • {time}
              </p>
            </div>

            <div className="border-t border-b border-neutral-900 py-4 text-center">
              <p className="text-[10px] font-semibold tracking-widest text-[#6C47FF] uppercase font-mono">PASS HOLDER</p>
              <h4 className="text-2xl font-bold tracking-tight text-white uppercase mt-1 mb-2">
                {attendeeName}
              </h4>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono tracking-widest text-neutral-300 uppercase bg-[#1B1B1B] border border-neutral-800">
                {ticketType} ACCESS
              </span>
            </div>

            {/* QR Block + Coordinates */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-[110px] h-[110px] bg-[#111111] p-2.5 rounded-xl border border-neutral-800 shadow-xl">
                {renderQR(brand_color, '#111111')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">{venue}</p>
                <div className="text-[11px] font-mono text-neutral-600 bg-neutral-950/20 px-2.5 py-1 rounded">
                  PASS CODE: <span className="text-neutral-300">{passId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'modern':
    default: {
      // 4. Template: Modern (The primary template, stylish colors, solid card layouts)
      return (
        <div 
          id="pass-card-modern"
          className={`w-full max-w-[420px] bg-[#1B1B1B] border border-[#333333] rounded-[28px] shadow-pass-dark text-[#F2F2F2] overflow-hidden transition-all duration-300 relative ${getFontFamilyClass()}`}
        >
          {/* Top Banner layout */}
          <div className="w-full h-[140px] bg-neutral-900 relative">
            {banner_url ? (
              <img src={banner_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center text-neutral-500">
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 mb-1 border border-neutral-800">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold tracking-wider opacity-65">EVENT BANNER PLACEHOLDER</span>
              </div>
            )}
            
            {/* Top brand circle anchor badge */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1 bg-black/75 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono border border-neutral-800 font-semibold text-white">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: brand_color }} />
              <span>TICSS PLATFORM</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Identity section */}
            <div className="space-y-1.5 focus-indigo">
              <span className="text-[10px] font-bold tracking-widest text-[#6C47FF] uppercase font-mono">OFFICIAL ENTRY PASS</span>
              <h3 className="text-3xl font-extrabold tracking-tight leading-none text-white uppercase break-words">
                {name || 'LAGOS DESIGN SUMMIT'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">{venue}</p>
            </div>

            {/* Middle Section with dotted separation */}
            <hr className="border-t border-dashed border-neutral-800" />

            <div className="flex justify-between items-center gap-4">
              <div className="space-y-1 flex-1">
                <span className="text-[10px] tracking-wider text-neutral-500 uppercase font-mono">HOLDER</span>
                <h4 className="text-lg font-bold text-neutral-200 truncate uppercase mt-0.5">{attendeeName}</h4>
                <div 
                  className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-opacity-15 font-mono"
                  style={{ backgroundColor: `${brand_color}20`, color: brand_color, border: `1px solid ${brand_color}30` }}
                >
                  {ticketType} PASS
                </div>
              </div>

              {/* Timing */}
              <div className="text-right space-y-0.5 text-xs">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-mono">TIMING</span>
                <p className="font-semibold text-neutral-300 font-mono mt-0.5 leading-tight">{formattedDate(date)}</p>
                <p className="text-neutral-400 font-mono leading-tight">{time}</p>
              </div>
            </div>

            <hr className="border-t border-dashed border-neutral-800" />

            {/* Bottom QR bar layout */}
            <div className="flex items-center gap-5 justify-between">
              <div className="w-20 h-20 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 flex-shrink-0">
                {renderQR('#FFFFFF', '#16161C')}
              </div>
              <div className="text-right space-y-1 text-xs">
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block font-mono">ORGANIZER</span>
                <p className="font-medium text-neutral-300 uppercase leading-none">{organizer_name}</p>
                <span className="text-[10px] font-mono text-neutral-500 bg-[#333333]/30 border border-neutral-800 px-2.5 py-0.5 rounded inline-block mt-1">
                  {passId}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
