import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { supabase, HAS_REAL_SUPABASE } from '../../lib/supabaseClient';
import { Event, Attendee, Pass } from '../../types';
import { 
  getEventOffline, 
  getAttendeesOffline, 
  getPassesOffline, 
  saveEventOffline,
  saveAttendeeOffline, 
  savePassOffline, 
  updatePassStatusOffline,
  deleteAttendeeOffline
} from '../../lib/offlineDb';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

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
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Download, 
  CheckCircle, 
  XCircle, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Star, 
  Info, 
  Heart,
  MoreVertical,
  Upload,
  Trash2,
  Link,
  QrCode,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import PassPreview from '../designer/PassPreview';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetailPage({ eventId, onBack }: EventDetailPageProps) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [passes, setPasses] = useState<Record<string, Pass>>({}); // attendeeId -> Pass
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create attendee state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAttName, setNewAttName] = useState('');
  const [newAttEmail, setNewAttEmail] = useState('');
  const [newAttTicket, setNewAttTicket] = useState<'General' | 'VIP' | 'Speaker' | 'Staff'>('General');
  const [isAdding, setIsAdding] = useState(false);

  // Selected attendee for previewing their standalone QR passcode
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);

  // Track open menu for attendee kebab list
  const [openMenuAttendeeId, setOpenMenuAttendeeId] = useState<string | null>(null);

  // File input ref for bulk CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic status toast helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDetails = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (supabase) {
        // Fetch event
        const { data: evData, error: evErr } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (evErr) throw evErr;
        const mappedEvent = evData ? { ...evData, date: evData.event_date || evData.date || '' } : null;
        setEvent(mappedEvent);
        if (mappedEvent) {
          saveEventOffline(mappedEvent);
        }

        // Fetch attendees
        const { data: attData, error: attErr } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', eventId);
        
        if (attErr) throw attErr;
        const attendeesList = attData || [];
        setAttendees(attendeesList);
        attendeesList.forEach((a: Attendee) => saveAttendeeOffline(a));

        // Fetch passes
        const { data: passData, error: passErr } = await supabase
          .from('passes')
          .select('*')
          .eq('event_id', eventId);

        if (!passErr && passData) {
          const passMap: Record<string, Pass> = {};
          passData.forEach((p: Pass) => {
            passMap[p.attendee_id] = p;
            savePassOffline(p);
          });
          setPasses(passMap);
        }
      } else {
        throw new Error('Supabase client is not initialized.');
      }
    } catch (err) {
      console.warn('Error fetching event details from Supabase (attempting local offline fallback):', err);
      
      // Fallback: load everything locally
      const offlineEv = getEventOffline(eventId);
      setEvent(offlineEv);

      const offlineAtts = getAttendeesOffline(eventId);
      setAttendees(offlineAtts);

      const offlinePasses = getPassesOffline(eventId);
      const passMap: Record<string, Pass> = {};
      offlinePasses.forEach((p: Pass) => {
        passMap[p.attendee_id] = p;
      });
      setPasses(passMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId || !user) return;
    fetchDetails();

    if (!supabase) return;

    // Set up real-time postgres changes subscription channels
    const attendeesChannel = supabase
      .channel(`attendees:${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendees', filter: `event_id=eq.${eventId}` },
        () => {
          fetchDetails();
        }
      )
      .subscribe();

    const passesChannel = supabase
      .channel(`passes:${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'passes', filter: `event_id=eq.${eventId}` },
        () => {
          fetchDetails();
        }
      )
      .subscribe();

    const eventChannel = supabase
      .channel(`event:${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `id=eq.${eventId}` },
        () => {
          fetchDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(attendeesChannel);
      supabase.removeChannel(passesChannel);
      supabase.removeChannel(eventChannel);
    };
  }, [eventId, user]);

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttName || !newAttEmail) return;
    setIsAdding(true);

    const attendeeId = generateUUID();
    const passUUID = generateUUID();
    const newAttendee: Attendee = {
      id: attendeeId,
      event_id: eventId,
      name: newAttName,
      email: newAttEmail,
      ticket_type: newAttTicket,
    };

    const newPass: Pass = {
      id: passUUID,
      attendee_id: attendeeId,
      event_id: eventId,
      pass_id: 'TCS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      qr_token: generateUUID(),
      status: 'unused',
    };

    try {
      if (supabase) {
        const { error: attError } = await supabase.from('attendees').insert([newAttendee]);
        if (attError) throw attError;

        const { error: passError } = await supabase.from('passes').insert([newPass]);
        if (passError) throw passError;
      } else {
        throw new Error('Supabase client is not initialized.');
      }
      
      // Save locally
      saveAttendeeOffline(newAttendee);
      savePassOffline(newPass);

      // Optimistic state update representing absolute speed
      const updatedAtts = [...attendees, newAttendee];
      const updatedPasses = { ...passes, [attendeeId]: newPass };
      
      setAttendees(updatedAtts);
      setPasses(updatedPasses);

      setNewAttName('');
      setNewAttEmail('');
      setShowAddModal(false);
    } catch (err: any) {
      console.warn('Supabase attendee save error, falling back to local offline DB:', err);
      
      // Save offline
      saveAttendeeOffline(newAttendee);
      savePassOffline(newPass);

      // Still update UI gracefully
      const updatedAtts = [...attendees, newAttendee];
      const updatedPasses = { ...passes, [attendeeId]: newPass };
      
      setAttendees(updatedAtts);
      setPasses(updatedPasses);

      setNewAttName('');
      setNewAttEmail('');
      setShowAddModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle Check-in status (simulation checker)
  const togglePassStatus = async (attendeeId: string) => {
    const currentPass = passes[attendeeId];
    if (!currentPass) return;

    const newStatus = currentPass.status === 'unused' ? 'used' : 'unused';
    const updatedPass: Pass = {
      ...currentPass,
      status: newStatus,
      scanned_at: newStatus === 'used' ? new Date().toISOString() : undefined
    };

    try {
      if (supabase) {
        const { error } = await supabase
          .from('passes')
          .update({ status: newStatus, scanned_at: updatedPass.scanned_at })
          .eq('id', currentPass.id);
        
        if (error) throw error;
      } else {
        throw new Error('Supabase client not initialized.');
      }

      // Save locally
      updatePassStatusOffline(currentPass.id, newStatus, updatedPass.scanned_at);

      const updatedPassMap = { ...passes, [attendeeId]: updatedPass };
      setPasses(updatedPassMap);
    } catch (err) {
      console.warn('Supabase pass update failed, updating local offline DB instead:', err);
      
      // Fallback: save to offline DB
      updatePassStatusOffline(currentPass.id, newStatus, updatedPass.scanned_at);

      const updatedPassMap = { ...passes, [attendeeId]: updatedPass };
      setPasses(updatedPassMap);
    }
  };

  // Export spreadsheet matching standard columns
  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    
    // Header
    const headers = ['Attendee Name', 'Email', 'Ticket Type', 'Pass Ticket ID', 'QR Status', 'Checked In At'];
    const rows = attendees.map(a => {
      const p = passes[a.id];
      return [
        a.name,
        a.email || 'N/A',
        a.ticket_type,
        p?.pass_id || '',
        p?.status || 'unknown',
        p?.scanned_at ? new Date(p.scanned_at).toLocaleString() : ''
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ticss_Attendee_Roster_${event?.name.replace(/\s+/g, '_') || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendees = attendees.filter(a => {
    const attendeeName = a.name || '';
    const attendeeEmail = a.email || '';
    return attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-[#121212]">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#6C47FF] animate-spin mb-3" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">SYNCHRONIZING EVENT ROSTER...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-[#121212] space-y-4 text-center">
        <p className="text-sm font-semibold text-rose-500">Event specified could not be resolved or was deleted.</p>
        <button onClick={onBack} className="text-[#6C47FF] underline text-xs font-semibold hover:opacity-85">Return to Dashboard</button>
      </div>
    );
  }

  // Statistics summaries
  const totalPasses = attendees.length;
  const generalCount = attendees.filter(a => a.ticket_type === 'General').length;
  const vipCount = attendees.filter(a => a.ticket_type === 'VIP').length;
  const speakerCount = attendees.filter(a => a.ticket_type === 'Speaker').length;
  const checkInCount = (Object.values(passes) as Pass[]).filter(p => p.status === 'used').length;

  // Selected attendee code to draw current standalone live pass preview
  const activeAtt = attendees.find(a => a.id === selectedAttendeeId) || attendees[0];
  const activePass = activeAtt ? passes[activeAtt.id] : null;

  return (
    <div id="event-detail-workspace" className="w-full flex-1 bg-slate-50 dark:bg-[#121212] font-sans selection:bg-[#6C47FF]/20 selection:text-[#6C47FF]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* Back navigational wire */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#6C47FF] hover:translate-x-[-2px] transition-transform pb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        {/* Layout breakdown grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Event overview and Live checkin badge */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Cover banner card */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/30 dark:border-neutral-850 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-44 w-full bg-neutral-100 dark:bg-neutral-850 relative">
                {event.banner_url ? (
                  <img src={event.banner_url} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#181818]" />
                )}
                {/* Accent brand indicator strip */}
                <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: event.brand_color || '#6C47FF' }} />
              </div>
              
              <div className="p-6 space-y-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
                    {event.name}
                  </h1>
                </div>

                <p className="text-xs text-neutral-400 dark:text-neutral-550 font-mono tracking-widest uppercase">
                  MANAGED BY: {event.organizer_name || 'Organizer'} · TEMPLATE: {(event.template || 'modern').toUpperCase()} STYLE
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6C47FF] shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {event.time || '10:00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6C47FF] shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Analytics Stripe */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/30 dark:border-neutral-850 p-4 rounded-xl text-left shadow-sm">
                <p className="text-[10px] text-neutral-400 font-mono font-bold tracking-wider leading-none uppercase">TOTAL PASSES</p>
                <p className="text-2xl font-black mt-2 text-neutral-900 dark:text-white font-mono">{totalPasses}</p>
                <div className="mt-1 text-[9px] text-neutral-400 font-medium">Fully deployed & synced</div>
              </div>

              <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/30 dark:border-neutral-850 p-4 rounded-xl text-left shadow-sm">
                <p className="text-[10px] text-neutral-400 font-mono font-bold tracking-wider leading-none uppercase">CHECKED-IN</p>
                <p className="text-2xl font-black mt-2 text-emerald-500 font-mono">
                  {checkInCount} / <span className="text-neutral-450 text-base">{totalPasses}</span>
                </p>
                {/* Progress ratio */}
                <div className="w-full bg-neutral-100 dark:bg-neutral-850 h-1 rounded overflow-hidden mt-1.5 self-center">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${totalPasses > 0 ? (checkInCount / totalPasses) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/30 dark:border-neutral-850 p-4 rounded-xl text-left shadow-sm">
                <p className="text-[10px] text-neutral-400 font-mono font-bold tracking-wider leading-none uppercase">VIP ROSTER</p>
                <p className="text-2xl font-black mt-2 text-neutral-800 dark:text-neutral-250 font-mono">{vipCount}</p>
                <div className="mt-1 text-[9px] text-neutral-400 font-medium">{speakerCount} Speakers assigned</div>
              </div>

              <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/30 dark:border-neutral-850 p-4 rounded-xl text-left shadow-sm">
                <p className="text-[10px] text-neutral-400 font-mono font-bold tracking-wider leading-none uppercase">GENERAL TICKET</p>
                <p className="text-2xl font-black mt-2 text-neutral-800 dark:text-neutral-250 font-mono">{generalCount}</p>
                <div className="mt-1 text-[9px] text-neutral-400 font-medium">Standard self-onboarded</div>
              </div>
            </div>

            {/* Roster Database Filter, Add, and export options */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/35 dark:border-neutral-850 rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="p-5 border-b border-neutral-105 dark:border-neutral-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Attendee Roster</h3>
                  <p className="text-xs text-neutral-400 leading-none mt-1">Simulate pass verification & check-ins below</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border border-neutral-300/30 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Attendee</span>
                  </button>
                </div>
              </div>

              {/* Roster Search bar */}
              <div className="px-5 py-3 border-b border-light-border-soft dark:border-neutral-850 flex items-center bg-neutral-50/50 dark:bg-neutral-900/30">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attendee name or email..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-855 outline-none text-neutral-900 dark:text-white focus:border-[#6C47FF]"
                  />
                </div>
              </div>
              {/* Attendees table list */}
              {attendees.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/10 rounded-2xl m-5 border border-dashed border-neutral-200/50 dark:border-neutral-800/40">
                  <div className="w-12 h-12 rounded-full bg-[#6C47FF]/5 flex items-center justify-center text-[#6C47FF] mb-3 animate-pulse">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase font-mono tracking-wider">No Attendees Enrolled</h4>
                  <p className="text-[11px] text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
                    This event has no registered attendees in Supabase yet. Add guests manually to instantly generate secure QR entry pass checkin slots.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest font-mono bg-[#6C47FF] hover:bg-[#5B39E0] text-white transition-all cursor-pointer shadow-sm uppercase active:scale-95"
                  >
                    Enroll First Guest
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900/30 text-neutral-400 font-mono tracking-wider font-semibold border-b border-neutral-150 dark:border-neutral-850">
                        <th className="py-3 px-5 uppercase">ATTENDEE DETAILS</th>
                        <th className="py-3 px-5 uppercase">TICKET TYPE</th>
                        <th className="py-3 px-5 uppercase">PASS REGISTER</th>
                        <th className="py-3 px-5 uppercase">CHECK-IN STATUS</th>
                        <th className="py-3 px-5 uppercase text-right">CONTROLS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850 font-medium">
                      {filteredAttendees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-neutral-400">no matched attendee records.</td>
                        </tr>
                      ) : (
                        filteredAttendees.map(a => {
                          const pass = passes[a.id];
                          const isCheckedIn = pass?.status === 'used';
                          const isCurrentlySelected = selectedAttendeeId === a.id;

                          let ticketBadgeColor = 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
                          if (a.ticket_type === 'VIP') ticketBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20';
                          if (a.ticket_type === 'Speaker') ticketBadgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-500/20';
                          if (a.ticket_type === 'Staff') ticketBadgeColor = 'bg-[#6C47FF]/10 text-[#6C47FF] border border-[#6C47FF]/15';

                          return (
                            <tr
                              key={a.id}
                              onClick={() => setSelectedAttendeeId(a.id)}
                              className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30 transition-colors cursor-pointer ${isCurrentlySelected ? 'bg-[#6C47FF]/5 dark:bg-[#6C47FF]/5' : ''}`}
                            >
                              <td className="py-3.5 px-5">
                                <p className="font-bold text-neutral-900 dark:text-white leading-tight">{a.name}</p>
                                <p className="text-[10px] text-neutral-400 font-normal leading-none mt-1">{a.email}</p>
                              </td>

                              <td className="py-3.5 px-5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${ticketBadgeColor}`}>
                                  {(a.ticket_type || 'General').toUpperCase()}
                                </span>
                              </td>

                              <td className="py-3.5 px-5 font-mono text-neutral-600 dark:text-neutral-400 font-semibold leading-none">
                                {pass?.pass_id || 'unassigned'}
                              </td>

                              <td className="py-3.5 px-5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePassStatus(a.id);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wide font-bold transition-all border shrink-0 ${
                                    isCheckedIn
                                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 border-neutral-300/30'
                                  }`}
                                >
                                  {isCheckedIn ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      <span>CHECKED-IN</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 text-neutral-405" />
                                      <span>NOT CHECKED</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-5 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAttendeeId(a.id);
                                  }}
                                  className="text-[#6C47FF] hover:underline font-bold text-[10px] font-mono tracking-wider cursor-pointer flex items-center gap-1 justify-end ml-auto"
                                >
                                  <span>LENS</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>

          {/* Right Block: Live Branded QR Seat Pass Layout Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200/25 dark:border-neutral-850 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase mb-4 self-start">
                BRAND PASS VERIFICATION LAYOUT
              </span>

              {/* Render vector QR checkin badge */}
              {activeAtt && activePass ? (
                <div className="space-y-4 w-full">
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/20 dark:border-neutral-850/50 rounded-xl p-4 flex flex-col items-center">
                    
                    {/* Render standard ticket PassPreview with customizable properties */}
                    <PassPreview 
                      event={{
                        ...event,
                        // Override/inject attendee traits inside preview structure
                        name: event.name,
                        organizer_name: `Attendee: ${activeAtt.name}`,
                        venue: `Ticket Type: ${activeAtt.ticket_type}`,
                        time: `Code: ${activePass.pass_id}`,
                        brand_color: event.brand_color || '#6C47FF',
                      }} 
                    />

                    {/* Sim Check-in Control box */}
                    <div className="w-full pt-4 mt-4 border-t border-neutral-200/35 dark:border-neutral-800 text-left space-y-3">
                      <div>
                        <p className="text-xs font-mono text-neutral-400">QR CODE CHECK-IN DECODER</p>
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeAtt.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{activePass.qr_token}</p>
                      </div>

                      <button
                        onClick={() => togglePassStatus(activeAtt.id)}
                        className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                          activePass.status === 'used'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-50/15'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-50/15'
                        }`}
                      >
                        {activePass.status === 'used' ? 'Reset Attendance to Not Checked' : 'Simulate Camera QR Verification Check-In'}
                      </button>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="py-20 text-neutral-400">
                  <Users className="w-8 h-8 mx-auto opacity-30 animate-pulse mb-2" />
                  <p className="text-xs">Select an attendee from roster to generate and inspect their branded vector boarding pass layout.</p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Manual Attendee Onboard modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1C1C1C] border border-neutral-200/40 dark:border-neutral-800/40 rounded-3xl p-6 md:p-8 space-y-5 text-left transition-all">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Register Pass Attendee</h3>
            <p className="text-xs text-neutral-500">Onboard attendees manually. This assigns an instant vector verification QR and ticket ID.</p>

            <form onSubmit={handleAddAttendee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Adeleke Temi"
                  value={newAttName}
                  onChange={(e) => setNewAttName(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-white focus:border-[#6C47FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="temi@ticss.io"
                  value={newAttEmail}
                  onChange={(e) => setNewAttEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-white focus:border-[#6C47FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Ticket Classification</label>
                <select
                  value={newAttTicket}
                  onChange={(e) => setNewAttTicket(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-[#6C47FF]"
                >
                  <option value="General">General Ticket</option>
                  <option value="VIP">VIP Ticket (Pass)</option>
                  <option value="Speaker">Speaker Access</option>
                  <option value="Staff">Event Staff</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6C47FF] hover:bg-[#5B39E0] transition-all disabled:opacity-50"
                >
                  {isAdding ? 'Onboarding...' : 'Onboard Attendee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
