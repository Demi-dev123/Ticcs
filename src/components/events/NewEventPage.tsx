import React, { useState } from 'react';
import { Event, TemplateId } from '../../types';
import PassPreview from '../designer/PassPreview';
import { supabase, HAS_REAL_SUPABASE } from '../../lib/supabaseClient';
import { useAuth } from '../AuthContext';
import { saveEventOffline } from '../../lib/offlineDb';
import { Calendar, Clock, MapPin, User, Layout, Palette, Type, Check, Sparkles, Sliders, ArrowLeft } from 'lucide-react';
import MapVenueInput from './MapVenueInput';

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // ignore
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface NewEventPageProps {
  onEventCreated?: (event: Event) => void;
  onNavigateToDashboard?: () => void;
}

const PRESET_COLORS = [
  '#6C47FF', // Brand (Actions Only / Purple default)
  '#2563EB', // Blue
  '#059669', // Emerald
  '#DC2626', // Red
  '#D97706', // Amber
  '#0891B2', // Cyan
  '#EC4899', // Pink
  '#000000', // Ink Black
];

const PRESET_BANNERS = [
  { name: 'Nebula', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80' },
  { name: 'Modern Grid', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
  { name: 'Brutalist Line', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Warm Gradient', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&q=80' },
];

const SUPABASE_RLS_SQL = `-- Supabase SQL Script to fix Row Level Security (RLS) policies
-- Run this in your Supabase SQL Editor to allow authenticated users to create and manage events.

-- 1. Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

-- 2. CREATE POLICIES FOR 'events'
CREATE POLICY "Allow authenticated users to create events" ON events 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to view their own events" ON events 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own events" ON events 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own events" ON events 
  FOR DELETE USING (auth.uid() = user_id);

-- 3. CREATE POLICIES FOR 'attendees'
CREATE POLICY "Allow select of attendees" ON attendees 
  FOR SELECT USING (true);

CREATE POLICY "Allow insert of attendees" ON attendees 
  FOR INSERT WITH CHECK (true);

-- 4. CREATE POLICIES FOR 'passes'
CREATE POLICY "Allow select of passes" ON passes 
  FOR SELECT USING (true);

CREATE POLICY "Allow insert of passes" ON passes 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update of passes for check-in" ON passes 
  FOR UPDATE USING (true) WITH CHECK (true);`;

export default function NewEventPage({ onEventCreated, onNavigateToDashboard }: NewEventPageProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Event>>({
    name: 'LAGOS DEVELOPER FESTIVAL',
    date: '2026-11-20',
    time: '09:00',
    venue: 'Landmark Centre, Plot 2 & 3, Water Corporation Dr, Lagos',
    organizer_name: 'TechCircles Nigeria',
    brand_color: '#6C47FF',
    template: 'modern',
    font_style: 'default',
    banner_url: PRESET_BANNERS[0].url,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customColor, setCustomColor] = useState('#6C47FF');
  const [activeTab, setActiveTab] = useState<'details' | 'designer'>('details');
  const [supabaseErrorState, setSupabaseErrorState] = useState<{ message: string; hint?: string } | null>(null);
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const updateField = (field: keyof Event, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetColorSelect = (color: string) => {
    updateField('brand_color', color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    updateField('brand_color', color);
  };

  const handleBannerUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dummyUrl = URL.createObjectURL(file);
      updateField('banner_url', dummyUrl);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.venue || !formData.organizer_name) {
      alert('Please fill out all required fields.');
      return;
    }

    if (!user) {
      alert('You must be signed in to create an event.');
      return;
    }

    setIsSubmitting(true);
    
    const eventId = generateUUID();
    const generatedEvent: Event = {
      id: eventId,
      user_id: user.id,
      name: formData.name || '',
      date: formData.date || '',
      event_date: formData.date || '',
      time: formData.time || '10:00',
      venue: formData.venue || '',
      organizer_name: formData.organizer_name || '',
      brand_color: formData.brand_color || '#6C47FF',
      template: formData.template || 'modern',
      font_style: formData.font_style || 'default',
      banner_url: formData.banner_url || '',
      created_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        const dbPayload: any = { ...generatedEvent };
        // Delete standard date field statically as user replaced it with event_date in real DB schema
        delete dbPayload.date;

        let attempt = 0;
        let success = false;
        let lastError: any = null;

        while (attempt < 5 && !success) {
          attempt++;
          const { error } = await supabase
            .from('events')
            .insert([dbPayload]);

          if (error) {
            lastError = error;
            console.warn(`Event insert attempt ${attempt} failed:`, error);
            const errMsg = error.message || '';
            
            // Handle schema mismatches: if any specific column is missing from Supabase's schema cache, 
            // strip it out dynamically and try inserting the rest of the payload.
            const match = errMsg.match(/Could not find the ['"]?(\w+)['"]? column of/i);
            if (match && match[1]) {
              const missingCol = match[1];
              console.warn(`PostgREST schema cache mismatch: dynamically omitting '${missingCol}' and retrying...`);
              delete dbPayload[missingCol];
            } else {
              break;
            }
          } else {
            success = true;
          }
        }

        if (!success && lastError) {
          throw lastError;
        }
      } else {
        throw new Error('Supabase client is not initialized.');
      }

      // Save locally as cache
      saveEventOffline(generatedEvent);
      setIsSubmitting(false);
      if (onEventCreated) {
        onEventCreated(generatedEvent);
      }
    } catch (err: any) {
      console.warn('Supabase save error, falling back to offline browser database:', err);
      // Fallback: save to local storage
      saveEventOffline(generatedEvent);
      setIsSubmitting(false);
      
      const errMsg = err?.message || String(err);
      const isRlsError = errMsg.toLowerCase().includes('row-level security') || 
                         errMsg.toLowerCase().includes('row_level_security') || 
                         errMsg.toLowerCase().includes('violates row-level security policy') ||
                         err?.code === '42501';

      if (isRlsError) {
        setSupabaseErrorState({
          message: 'PostgreSQL Row-level Security policy check failed: ' + errMsg,
          hint: 'This means Row-Level Security (RLS) is enabled on your remote Supabase "events" table, but there is no custom configuration policy allowing standard users to execute INSERT operations. Your event is safely saved in local storage, so you can continue using the app fully!'
        });
        setShowRlsHelper(true);
      } else {
        // Notify the user but do NOT block them
        alert('Event saved successfully inline! Note: Connection to the online cloud database could not be established (unreachable or blocked), but the event has been saved locally in your browser for testing and pass designing.');
      }
      
      if (onEventCreated) {
        onEventCreated(generatedEvent);
      }
    }
  };

  return (
    <div id="new-event-container" className="w-full min-h-[calc(100vh-56px)] select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C47FF] hover:text-[#5B39E0] transition-colors mb-3 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-neutral-900 dark:text-white">
            Create Event & Design Pass
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
            Construct details, select premium templates, customize indicators, and preview the live layout on-the-fly.
          </p>
        </div>

        {/* Supabase RLS Error Diagnostic & Troubleshooting Banner */}
        {supabaseErrorState && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/45 rounded-2xl shadow-sm text-neutral-800 dark:text-neutral-200">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                    Supabase Policy Restriction
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    Row-Level Security (RLS) Policy Error Detected
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                  {supabaseErrorState.message}. {supabaseErrorState.hint}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRlsHelper(!showRlsHelper)}
                  className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  {showRlsHelper ? 'Hide Fix Guide' : 'How to Fix This'}
                </button>
                <button
                  type="button"
                  onClick={() => setSupabaseErrorState(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {showRlsHelper && (
              <div className="mt-6 border-t border-red-200/50 dark:border-red-950/50 pt-6 space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#6C47FF] dark:text-[#8B70FF]">
                    HOW TO REPAIR ROW-LEVEL SECURITY IN SUPABASE:
                  </h4>
                  <ol className="list-decimal list-inside text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
                    <li>Go to your <strong className="text-neutral-900 dark:text-white">Supabase Dashboard</strong>.</li>
                    <li>Navigate to the <strong className="text-neutral-900 dark:text-white">SQL Editor</strong> in the left sidebar.</li>
                    <li>Click <strong className="text-neutral-900 dark:text-white">New Query</strong>.</li>
                    <li>Copy and paste the database schema block below, then click <strong className="text-neutral-900 dark:text-white">Run</strong>.</li>
                  </ol>
                </div>

                <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto max-h-72">
                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-[10px] font-bold tracking-wide rounded-lg text-white hover:text-[#6C47FF] transition-colors cursor-pointer"
                    >
                      {copiedSql ? 'COPIED!' : 'COPY SQL SCRIPT'}
                    </button>
                  </div>
                  <pre className="pr-20 overflow-x-auto select-all text-neutral-350">{SUPABASE_RLS_SQL}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Sticky Live Preview Panel (5/12 widths) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-card-light dark:shadow-card-dark flex flex-col items-center">
              
              {/* Header Label inside design sandbox */}
              <div className="w-full flex justify-between items-center mb-6">
                <span className="text-xs font-mono font-semibold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">
                  LIVE VISUAL CANVAS
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] font-mono text-neutral-400">SYNCED ACTIVE</span>
                </div>
              </div>

              {/* Centered Pass Wrapper */}
              <div className="w-full flex justify-center py-4 bg-neutral-100/40 dark:bg-neutral-950/20 backdrop-blur rounded-xl border border-dotted border-neutral-200 dark:border-neutral-800/60 p-4">
                <PassPreview event={formData} />
              </div>

              {/* Helpful instructions under preview */}
              <div className="w-full mt-6 bg-[#6C47FF]/5 dark:bg-[#6C47FF]/10 p-3 rounded-lg border border-[#6C47FF]/15 text-xs text-neutral-600 dark:text-neutral-300">
                <p className="leading-relaxed">
                  Changes update immediately with no compile filters or shadows.
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Config Input Form (7/12 widths) */}
          <div className="lg:col-span-7 bg-[#FFFFFE] dark:bg-[#222222] border border-neutral-200 dark:border-[#333333] rounded-2xl p-6 shadow-card-light dark:shadow-card-dark">
            
            {/* Form Steps Selector Toggle */}
            <div className="flex border-b border-neutral-100/30 dark:border-neutral-850/30 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 text-sm font-semibold tracking-tight border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'details'
                    ? 'border-[#6C47FF] text-[#6C47FF]'
                    : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>1. Event Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('designer')}
                className={`py-3 px-4 text-sm font-semibold tracking-tight border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'designer'
                    ? 'border-[#6C47FF] text-[#6C47FF]'
                    : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>2. Customize Pass Design</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {activeTab === 'details' && (
                <div className="space-y-5">
                  {/* Event Name */}
                  <div className="space-y-1.5Packed">
                    <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                      <span>EVENT NAME *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="e.g. LAGOS BLOCKCHAIN WORKSHOP 2026"
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl py-3 px-4 text-sm font-sans placeholder-neutral-400 dark:placeholder-neutral-600 transition-all border-solid font-medium"
                    />
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-450" />
                        <span>DATE *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => updateField('date', e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl py-3 px-4 text-sm font-mono transition-all font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-450" />
                        <span>TIME *</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => updateField('time', e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl py-3 px-4 text-sm font-mono transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Venue / Location */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-450" />
                      <span>VENUE / PHYSICAL PATH *</span>
                    </label>
                    <MapVenueInput
                      value={formData.venue || ''}
                      onChange={(val) => updateField('venue', val)}
                      brandColor={formData.brand_color || '#6C47FF'}
                    />
                  </div>

                  {/* Organizer Details */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-neutral-450" />
                      <span>ORGANIZER AUTHOR *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organizer_name}
                      onChange={(e) => updateField('organizer_name', e.target.value)}
                      placeholder="e.g. TechCircles Network Group"
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl py-3 px-4 text-sm font-sans placeholder-neutral-400 dark:placeholder-neutral-600 transition-all font-medium"
                    />
                  </div>

                  {/* Callout Info */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#6C47FF] mt-0.5 flex-shrink-0" />
                    <span>Once you specify these coordinate values, they form the structured block that validates your users via the camera. Click 'Next Step' above or at the bottom to configure designs.</span>
                  </div>
                  
                  {/* Action row */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('designer')}
                      className="w-full md:w-auto px-6 py-3 rounded-full text-xs font-semibold tracking-wider bg-[#6C47FF] hover:bg-[#5B39E0] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-focus"
                    >
                      <span>Continue to Design</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'designer' && (
                <div className="space-y-6">
                  
                  {/* 1. Template Picker */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">
                      CHOOSE A BASE PASS TEMPLATE
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['modern', 'minimal', 'dark', 'elegant'] as TemplateId[]).map((tId) => {
                        const isSelected = formData.template === tId;
                        return (
                          <button
                            key={tId}
                            type="button"
                            onClick={() => updateField('template', tId)}
                            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center relative cursor-pointer ${
                              isSelected
                                ? 'bg-[#FFFFFE] dark:bg-neutral-900 border-[#6C47FF] text-[#6C47FF] scale-[1.02] shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-tight">{tId}</span>
                            <span className="text-[9px] opacity-70">
                              {tId === 'modern' && 'Pristine Core'}
                              {tId === 'minimal' && 'Soft White'}
                              {tId === 'dark' && 'Cyber Midnight'}
                              {tId === 'elegant' && 'Luxury Serif'}
                            </span>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-[#6C47FF] text-white rounded-full p-[2px] w-4 h-4 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Brand Color Swatch Picker ( actions only ) */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">
                      BRAND ACCENT COLOR (FOR ACTIONS + INDICATORS)
                    </label>
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => {
                          const isSelected = formData.brand_color === color;
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handlePresetColorSelect(color)}
                              className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:opacity-90 relative"
                              style={{ backgroundColor: color }}
                            >
                              {isSelected && (
                                <span className="absolute inset-0 m-auto w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                        {/* Custom Hex Indicator */}
                        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                          <input
                            type="color"
                            value={customColor}
                            onChange={handleCustomColorChange}
                            className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-800 cursor-pointer p-0 overflow-hidden bg-transparent"
                          />
                          <input
                            type="text"
                            maxLength={7}
                            value={customColor}
                            onChange={(e) => {
                              setCustomColor(e.target.value);
                              updateField('brand_color', e.target.value);
                            }}
                            className="w-20 font-mono text-xs uppercase bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-1.5 py-1 rounded text-neutral-700 dark:text-neutral-300"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        *Rule context: This color acts as the primary accent indicator on your users' digital passes (bars, badges & QR fills). Zero gradients or neon surface colors are allowed.
                      </p>
                    </div>
                  </div>

                  {/* 3. Typography Selection */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold tracking-widest text-[#888] uppercase block">
                      TYPOGRAPHY PARING FAMILY
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        { id: 'default', label: 'Space Grotesk', sub: 'Geometric / Tech-Native' },
                        { id: 'sans', label: 'Inter Sans', sub: 'Minimal Swiss / Neutral' },
                        { id: 'mono', label: 'JetBrains Mono', sub: 'Brutalist Monospace Accent' },
                      ].map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => updateField('font_style', font.id)}
                          className={`px-4 py-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            formData.font_style === font.id
                              ? 'bg-white dark:bg-neutral-900 border-[#6C47FF] text-[#6C47FF]'
                              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500'
                          }`}
                        >
                          <p className="text-xs font-semibold">{font.label}</p>
                          <p className="text-[9px] opacity-75 truncate">{font.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Banner Cover Image picker */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                        EVENT BANNER COVER PHOTO
                      </label>
                      <label className="text-[10px] font-semibold text-[#6C47FF] cursor-pointer hover:underline">
                        <span>Upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUploadMock}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {PRESET_BANNERS.map((banner) => (
                        <button
                          key={banner.name}
                          type="button"
                          onClick={() => updateField('banner_url', banner.url)}
                          className={`group h-14 rounded-lg overflow-hidden border relative cursor-pointer ${
                            formData.banner_url === banner.url
                              ? 'border-[#6C47FF]'
                              : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={banner.url} alt={banner.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[8px] tracking-wide font-mono uppercase font-bold text-white">{banner.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submission and Save actions */}
                  <div className="pt-6 border-t border-neutral-100 dark:border-neutral-850 flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="px-5 py-3 rounded-full text-xs font-semibold tracking-wide border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 cursor-pointer active:scale-97 text-center transition-all md:order-1"
                    >
                      ← Back to Details
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-[#6C47FF] hover:bg-[#5B39E0] disabled:bg-neutral-400 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-focus active:scale-97 md:order-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Generating Event...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Event & Deploy Passes</span>
                          <span>✓</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
