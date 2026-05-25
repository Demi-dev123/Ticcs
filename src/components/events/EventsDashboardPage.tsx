import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase, HAS_REAL_SUPABASE } from '../../lib/supabaseClient';
import { Event } from '../../types';
import { getEventsOffline, saveEventOffline } from '../../lib/offlineDb';
import { Calendar, MapPin, Users, PlusCircle, Search, SlidersHorizontal, ArrowRight, Shield, RefreshCw } from 'lucide-react';

interface EventsDashboardPageProps {
  onCreateEventClick: () => void;
  onEventClick: (eventId: string) => void;
}

export default function EventsDashboardPage({ onCreateEventClick, onEventClick }: EventsDashboardPageProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchEventsAndAttendees = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      if (supabase) {
        // Fetch from real Supabase
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('event_date', { ascending: true });

        if (error) {
          throw error;
        } else {
          const mappedEvents = (data || []).map((e: any) => ({
            ...e,
            date: e.event_date || e.date || '',
          }));
          setEvents(mappedEvents);
          
          // Cache each event offline for immediate accessibility
          mappedEvents.forEach(e => saveEventOffline(e));

          // Fetch attendee counts if available
          const counts: Record<string, number> = {};
          if (data && data.length > 0) {
            for (const ev of data) {
              const { count, error: countErr } = await supabase
                .from('attendees')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', ev.id);
              counts[ev.id] = !countErr ? (count || 0) : 0;
            }
          }
          setAttendeeCounts(counts);
          
          // Cache attendee counts
          localStorage.setItem('ticss_cached_attendee_counts', JSON.stringify(counts));
        }
      } else {
        throw new Error('Supabase client not initialized.');
      }
    } catch (err: any) {
      console.warn('Fetch operation failed, loading offline storage:', err);
      
      // Load offline events
      const offlineEvents = getEventsOffline(user.id);
      setEvents(offlineEvents);

      // Load cached counts or count from offline attendees count
      const fallbackCounts: Record<string, number> = {};
      try {
        const cachedCountsStr = localStorage.getItem('ticss_cached_attendee_counts');
        if (cachedCountsStr) {
          Object.assign(fallbackCounts, JSON.parse(cachedCountsStr));
        }
      } catch {}

      // Complement with specific offline counts
      for (const ev of offlineEvents) {
        if (fallbackCounts[ev.id] === undefined) {
          const { getAttendeesOffline } = await import('../../lib/offlineDb');
          fallbackCounts[ev.id] = getAttendeesOffline(ev.id).length;
        }
      }
      setAttendeeCounts(fallbackCounts);

      // Display a beautiful dark offline notification
      setErrorMsg('Offline/Fallback Session: Currently reading local browser storage because the online cloud server could not be reached.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchEventsAndAttendees();

    if (!supabase) return;

    // Set up real-time postgres changes subscription
    const dashboardChannel = supabase
      .channel('dashboard-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
        () => {
          fetchEventsAndAttendees();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendees' },
        () => {
          fetchEventsAndAttendees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dashboardChannel);
    };
  }, [user]);

  // Handle status sorting rules
  const sortedAndFiltered = events.filter(e => {
    const eventName = e.name || '';
    const eventVenue = e.venue || '';
    const matchesSearch = eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          eventVenue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
    const now = new Date();
    const isUpcoming = eventDate >= now;

    if (filterStatus === 'upcoming') return matchesSearch && isUpcoming;
    if (filterStatus === 'past') return matchesSearch && !isUpcoming;
    return matchesSearch;
  });

  const getStatus = (dateStr: string, timeStr: string) => {
    const eventDate = new Date(`${dateStr}T${timeStr || '00:00'}`);
    const now = new Date();
    return eventDate >= now ? 'UPCOMING' : 'COMPLETED';
  };

  return (
    <div id="events-dashboard" className="w-full flex-1 bg-slate-50 dark:bg-[#121212] font-sans selection:bg-[#6C47FF]/20 selection:text-[#6C47FF] min-h-[calc(100vh-112px)] flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex-1">
        
        {/* Navigation & Stats Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
              Events Dashboard
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Register metadata, review pass volumes, and generate checkout credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEventsAndAttendees}
              aria-label="Refresh list"
              className="p-2.5 rounded-full border border-neutral-200/50 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-850 hover:text-neutral-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onCreateEventClick}
              className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white flex items-center gap-2 transition-all cursor-pointer shadow-focus active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-100 px-1.5 py-0.5 rounded">
                Database Note
              </span>
              <span>{errorMsg}</span>
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-amber-500 hover:text-amber-850 dark:hover:text-amber-100 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main State Panel */}
        {loading ? (
          <div className="w-full h-64 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-neutral-850 border-t-[#6C47FF] animate-spin mb-3" />
            <p className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Synchronizing event database...</p>
          </div>
        ) : events.length === 0 ? (
          /* FULL EMPTY STATE UI - CENTERED LAYOUT */
          <div className="w-full text-center py-24 px-6 bg-white dark:bg-[#1C1C1C] border border-neutral-200/20 dark:border-neutral-800/25 rounded-3xl shadow-sm space-y-5 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-850 border border-neutral-200/25 dark:border-neutral-800 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                No active events found
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Create your initial high-fidelity event configuration and design instant QR attendee passes.
              </p>
            </div>
            <button
              onClick={onCreateEventClick}
              className="px-6 py-3 rounded-full text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Event</span>
            </button>
          </div>
        ) : (
          /* EVENTS EXIST: SHOW SEARCH, FILTERS & THE GRID LIST */
          <>
            {/* Filters and Utilities Bar */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/25 dark:border-neutral-850 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search event name or venue..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] outline-none transition-all text-neutral-950 dark:text-white"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center gap-1 p-1 bg-neutral-150/50 dark:bg-neutral-900 rounded-xl border border-neutral-200/20 dark:border-neutral-850">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-[#FFFFFE] dark:bg-[#1E1E1E] text-[#6C47FF] shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    All ({events.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('upcoming')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterStatus === 'upcoming'
                        ? 'bg-[#FFFFFE] dark:bg-[#1E1E1E] text-[#6C47FF] shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setFilterStatus('past')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterStatus === 'past'
                        ? 'bg-[#FFFFFE] dark:bg-[#1E1E1E] text-[#6C47FF] shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>
            </div>

            {sortedAndFiltered.length === 0 ? (
              /* FILTERED OUT OR SEARCH EMPTY STATE */
              <div className="w-full text-center py-16 px-6 bg-white dark:bg-[#1C1C1C] border border-neutral-200/20 dark:border-neutral-800/25 rounded-3xl shadow-sm space-y-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  No active events match "{searchQuery}" or status filter "{filterStatus}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-all cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              /* THE CARDS GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAndFiltered.map((ev) => {
                  const attendeesCount = attendeeCounts[ev.id] || 0;
                  const status = getStatus(ev.date, ev.time);
                  const eventDateStr = new Date(ev.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={ev.id}
                      onClick={() => onEventClick(ev.id)}
                      className="group bg-white dark:bg-[#1C1C1C] border border-neutral-200/30 dark:border-neutral-850 rounded-2xl overflow-hidden hover:border-[#6C47FF] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col h-[320px]"
                    >
                      {/* Banner Image */}
                      <div className="h-28 w-full bg-neutral-200 dark:bg-neutral-850 relative overflow-hidden">
                        {ev.banner_url ? (
                          <img
                            src={ev.banner_url}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center" style={{ borderTop: `4px solid ${ev.brand_color || '#6C47FF'}` }}>
                            <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">{ev.template} Style</span>
                          </div>
                        )}
                        {/* Status badge */}
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#121212]/90 backdrop-blur border border-neutral-300/10 dark:border-neutral-800 rounded-md px-2 py-0.5 text-[8px] font-mono font-bold text-neutral-800 dark:text-neutral-300">
                          {status}
                        </div>
                      </div>

                      {/* Body Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-[#6C47FF] transition-colors leading-tight">
                            {ev.name}
                          </h4>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono tracking-wider uppercase mt-1 leading-none">
                            By {ev.organizer_name}
                          </p>

                          <div className="space-y-2 mt-4">
                            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                              <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                              <span className="truncate">{eventDateStr} at {ev.time || '10:00'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                              <span className="truncate">{ev.venue}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom strip */}
                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-[#6C47FF]" />
                            <span className="text-xs font-bold font-mono text-neutral-800 dark:text-neutral-300">
                              {attendeesCount} passes
                            </span>
                          </div>
                          
                          <div className="text-neutral-400 group-hover:text-[#6C47FF] transition-colors flex items-center gap-1 text-[10px] font-bold tracking-wider font-mono">
                            <span>OPEN</span>
                            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
