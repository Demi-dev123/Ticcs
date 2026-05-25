import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
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
  MoreVertical,
  Trash2,
  Link,
  FileText,
  ScanLine,
  Image as ImageIcon
} from 'lucide-react';
import PassPreview from '../designer/PassPreview';
 
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
 
interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  onScanClick: () => void; // ← add this

}
 
export default function EventDetailPage({ eventId, onBack, onScanClick }: EventDetailPageProps) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [passes, setPasses] = useState<Record<string, Pass>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
 
  // Create attendee state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAttName, setNewAttName] = useState('');
  const [newAttEmail, setNewAttEmail] = useState('');
  const [newAttTicket, setNewAttTicket] = useState<'General' | 'VIP' | 'Speaker' | 'Staff'>('General');
  const [isAdding, setIsAdding] = useState(false);
 
  // Edit attendee state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTicket, setEditTicket] = useState<'General' | 'VIP' | 'Speaker' | 'Staff'>('General');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
 
  // Selected attendee for pass preview
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);
 
  // Kebab menu state
  const [openMenuAttendeeId, setOpenMenuAttendeeId] = useState<string | null>(null);
 
  // File input ref for bulk CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
 
  // ─── Data Fetching ────────────────────────────────────────────────────────────
 
  const fetchDetails = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (supabase) {
        const { data: evData, error: evErr } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        if (evErr) throw evErr;
        const mappedEvent = evData ? { ...evData, date: evData.event_date || evData.date || '' } : null;
        setEvent(mappedEvent);
        if (mappedEvent) saveEventOffline(mappedEvent);
 
        const { data: attData, error: attErr } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', eventId);
        if (attErr) throw attErr;
        const attendeesList = attData || [];
        setAttendees(attendeesList);
        attendeesList.forEach((a: Attendee) => saveAttendeeOffline(a));
 
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
      console.warn('Supabase fetch failed, using offline fallback:', err);
      const offlineEv = getEventOffline(eventId);
      setEvent(offlineEv);
      const offlineAtts = getAttendeesOffline(eventId);
      setAttendees(offlineAtts);
      const offlinePasses = getPassesOffline(eventId);
      const passMap: Record<string, Pass> = {};
      offlinePasses.forEach((p: Pass) => { passMap[p.attendee_id] = p; });
      setPasses(passMap);
    } finally {
      setLoading(false);
    }
  };
 
  // ─── Effects ──────────────────────────────────────────────────────────────────
 
  useEffect(() => {
    if (!eventId || !user) return;
    fetchDetails();
    if (!supabase) return;
 
    const attendeesChannel = supabase
      .channel(`attendees:${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendees', filter: `event_id=eq.${eventId}` }, () => fetchDetails())
      .subscribe();
 
    const passesChannel = supabase
      .channel(`passes:${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'passes', filter: `event_id=eq.${eventId}` }, () => fetchDetails())
      .subscribe();
 
    const eventChannel = supabase
      .channel(`event:${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `id=eq.${eventId}` }, () => fetchDetails())
      .subscribe();
 
    return () => {
      supabase.removeChannel(attendeesChannel);
      supabase.removeChannel(passesChannel);
      supabase.removeChannel(eventChannel);
    };
  }, [eventId, user]);
 
  // Close kebab menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuAttendeeId(null);
    if (openMenuAttendeeId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuAttendeeId]);
 
  // ─── Handlers ─────────────────────────────────────────────────────────────────
 
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
        throw new Error('Supabase not initialized.');
      }
      saveAttendeeOffline(newAttendee);
      savePassOffline(newPass);
      setAttendees([...attendees, newAttendee]);
      setPasses({ ...passes, [attendeeId]: newPass });
      setNewAttName('');
      setNewAttEmail('');
      setShowAddModal(false);
      showToast('Attendee added successfully');
    } catch (err: any) {
      console.warn('Supabase insert failed, saving offline:', err);
      saveAttendeeOffline(newAttendee);
      savePassOffline(newPass);
      setAttendees([...attendees, newAttendee]);
      setPasses({ ...passes, [attendeeId]: newPass });
      setNewAttName('');
      setNewAttEmail('');
      setShowAddModal(false);
      showToast('Saved locally');
    } finally {
      setIsAdding(false);
    }
  };
 
  const handleOpenEdit = (a: Attendee) => {
    setEditingAttendee(a);
    setEditName(a.name);
    setEditEmail(a.email || '');
    setEditTicket((a.ticket_type as any) || 'General');
    setShowEditModal(true);
    setOpenMenuAttendeeId(null);
  };
 
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;
    setIsSavingEdit(true);
    const updated: Attendee = { ...editingAttendee, name: editName, email: editEmail, ticket_type: editTicket };
    try {
      if (supabase) {
        const { error } = await supabase
          .from('attendees')
          .update({ name: editName, email: editEmail, ticket_type: editTicket })
          .eq('id', editingAttendee.id);
        if (error) throw error;
      }
      setAttendees(prev => prev.map(a => a.id === editingAttendee.id ? updated : a));
      showToast('Attendee updated');
      setShowEditModal(false);
      setEditingAttendee(null);
    } catch (err) {
      console.warn('Edit failed:', err);
      setAttendees(prev => prev.map(a => a.id === editingAttendee.id ? updated : a));
      showToast('Saved locally');
      setShowEditModal(false);
    } finally {
      setIsSavingEdit(false);
    }
  };
 
  const handleDelete = async (attendeeId: string) => {
    setIsDeletingId(attendeeId);
    setOpenMenuAttendeeId(null);
    try {
      if (supabase) {
        const { error } = await supabase.from('attendees').delete().eq('id', attendeeId);
        if (error) throw error;
      }
      deleteAttendeeOffline(attendeeId);
      setAttendees(prev => prev.filter(a => a.id !== attendeeId));
      const updatedPasses = { ...passes };
      delete updatedPasses[attendeeId];
      setPasses(updatedPasses);
      if (selectedAttendeeId === attendeeId) setSelectedAttendeeId(null);
      showToast('Attendee removed');
    } catch (err) {
      console.warn('Delete failed:', err);
      deleteAttendeeOffline(attendeeId);
      setAttendees(prev => prev.filter(a => a.id !== attendeeId));
      showToast('Removed locally');
    } finally {
      setIsDeletingId(null);
    }
  };
 
  const togglePassStatus = async (attendeeId: string) => {
    const currentPass = passes[attendeeId];
    if (!currentPass) return;
    const newStatus = currentPass.status === 'unused' ? 'used' : 'unused';
    const updatedPass: Pass = {
      ...currentPass,
      status: newStatus,
      scanned_at: newStatus === 'used' ? new Date().toISOString() : undefined,
    };
    try {
      if (supabase) {
        const { error } = await supabase
          .from('passes')
          .update({ status: newStatus, scanned_at: updatedPass.scanned_at })
          .eq('id', currentPass.id);
        if (error) throw error;
      }
      updatePassStatusOffline(currentPass.id, newStatus, updatedPass.scanned_at);
      setPasses({ ...passes, [attendeeId]: updatedPass });
    } catch (err) {
      console.warn('Pass update failed, saving offline:', err);
      updatePassStatusOffline(currentPass.id, newStatus, updatedPass.scanned_at);
      setPasses({ ...passes, [attendeeId]: updatedPass });
    }
  };
 
  const handleShareLink = (pass: Pass) => {
    const url = `${window.location.origin}/pass/${pass.pass_id}`;
    navigator.clipboard.writeText(url).then(() => showToast('Pass link copied to clipboard'));
    setOpenMenuAttendeeId(null);
  };
 
  // Export PNG — selects the attendee first, waits for render, then exports
  const handleExportPNG = async (attendee: Attendee) => {
    setOpenMenuAttendeeId(null);
    setSelectedAttendeeId(attendee.id);
    await new Promise(resolve => setTimeout(resolve, 200));
    const node = document.getElementById(`pass-render-${attendee.id}`);
    if (!node) {
      showToast('Pass preview not ready — try again');
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${attendee.name.replace(/\s+/g, '_')}_Ticss_Pass.png`;
      link.href = dataUrl;
      link.click();
      showToast('PNG downloaded');
    } catch (err) {
      console.error(err);
      showToast('PNG export failed');
    }
  };
 
  // Export PDF — selects the attendee first, waits for render, then exports
  const handleExportPDF = async (attendee: Attendee) => {
    setOpenMenuAttendeeId(null);
    setSelectedAttendeeId(attendee.id);
    await new Promise(resolve => setTimeout(resolve, 200));
    const node = document.getElementById(`pass-render-${attendee.id}`);
    if (!node) {
      showToast('Pass preview not ready — try again');
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [320, 480] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 320, 480);
      pdf.save(`${attendee.name.replace(/\s+/g, '_')}_Ticss_Pass.pdf`);
      showToast('PDF downloaded');
    } catch (err) {
      console.error(err);
      showToast('PDF export failed');
    }
  };
 
  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const headers = ['Attendee Name', 'Email', 'Ticket Type', 'Pass Ticket ID', 'QR Status', 'Checked In At'];
    const rows = attendees.map(a => {
      const p = passes[a.id];
      return [
        a.name,
        a.email || 'N/A',
        a.ticket_type,
        p?.pass_id || '',
        p?.status || 'unknown',
        p?.scanned_at ? new Date(p.scanned_at).toLocaleString() : '',
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ticss_Attendee_Roster_${event?.name.replace(/\s+/g, '_') || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  // ─── Derived State ────────────────────────────────────────────────────────────
 
  const filteredAttendees = attendees.filter(a => {
    const name = a.name || '';
    const email = a.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });
 
  const totalPasses = attendees.length;
  const generalCount = attendees.filter(a => a.ticket_type === 'General').length;
  const vipCount = attendees.filter(a => a.ticket_type === 'VIP').length;
  const speakerCount = attendees.filter(a => a.ticket_type === 'Speaker').length;
  const checkInCount = (Object.values(passes) as Pass[]).filter(p => p.status === 'used').length;
 
  const activeAtt = attendees.find(a => a.id === selectedAttendeeId) || attendees[0];
  const activePass = activeAtt ? passes[activeAtt.id] : null;
 
  // ─── Loading / Error States ───────────────────────────────────────────────────
 
  if (loading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-[#1B1B1B]">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-neutral-700 border-t-[#6C47FF] animate-spin mb-3" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">SYNCHRONIZING EVENT ROSTER...</span>
      </div>
    );
  }
 
  if (!event) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-[#1B1B1B] space-y-4 text-center">
        <p className="text-sm font-semibold text-rose-500">Event could not be resolved or was deleted.</p>
        <button onClick={onBack} className="text-[#6C47FF] underline text-xs font-semibold hover:opacity-80">
          Return to Dashboard
        </button>
      </div>
    );
  }
 
  // ─── Render ───────────────────────────────────────────────────────────────────
 
  return (
    <div
      id="event-detail-workspace"
      className="w-full flex-1 bg-slate-50 dark:bg-[#1B1B1B] font-sans selection:bg-[#6C47FF]/20 selection:text-[#6C47FF]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
 
        {/* Back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#6C47FF] hover:translate-x-[-2px] transition-transform pb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
          {/* ── Left Column ── */}
          <div className="lg:col-span-8 space-y-6">
 
            {/* Event Banner Card */}
            <div className="bg-white dark:bg-[#222222] border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-44 w-full bg-neutral-100 dark:bg-neutral-800 relative">
                {event.banner_url ? (
                  <img src={event.banner_url} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1B1B1B]" />
                )}
                <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: event.brand_color || '#6C47FF' }} />
              </div>
 
              <div className="p-6 space-y-4 text-left">
                <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
                  {event.name}
                </h1>
                <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
                  MANAGED BY: {event.organizer_name || 'Organizer'} · TEMPLATE: {(event.template || 'modern').toUpperCase()} STYLE
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6C47FF] shrink-0" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {event.time || '10:00'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6C47FF] shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'TOTAL PASSES', value: totalPasses, sub: 'Fully deployed & synced', color: 'text-neutral-900 dark:text-white' },
                { label: 'CHECKED-IN', value: `${checkInCount}`, sub: `of ${totalPasses} total`, color: 'text-emerald-500', progress: totalPasses > 0 ? (checkInCount / totalPasses) * 100 : 0 },
                { label: 'VIP ROSTER', value: vipCount, sub: `${speakerCount} Speakers assigned`, color: 'text-neutral-900 dark:text-white' },
                { label: 'GENERAL TICKET', value: generalCount, sub: 'Standard self-onboarded', color: 'text-neutral-900 dark:text-white' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#222222] border border-neutral-200/40 dark:border-neutral-800/40 p-4 rounded-xl text-left shadow-sm">
                  <p className="text-[10px] text-neutral-400 font-mono font-bold tracking-wider leading-none uppercase">{stat.label}</p>
                  <p className={`text-2xl font-black mt-2 font-mono ${stat.color}`}>{stat.value}</p>
                  {stat.progress !== undefined && (
                    <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-1 rounded overflow-hidden mt-1.5">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${stat.progress}%` }} />
                    </div>
                  )}
                  <div className="mt-1 text-[9px] text-neutral-400 font-medium">{stat.sub}</div>
                </div>
              ))}
            </div>
 
            {/* ── Roster Table Card ── */}
            <div className="bg-white dark:bg-[#222222] border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl shadow-sm overflow-visible text-left">
 
              {/* Roster Header */}
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Attendee Roster</h3>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Attendee</span>
                  </button>


<button
  onClick={onScanClick}
  className="flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
>
  <ScanLine className="w-3.5 h-3.5" />
  <span>Scan Passes</span>
</button>
                </div>
              </div>
 
              {/* Search Bar */}
              <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center bg-neutral-50/50 dark:bg-neutral-900/20">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attendee name or email..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#6C47FF] transition-colors"
                  />
                </div>
              </div>
 
              {/* Table or Empty State */}
              {attendees.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/10 rounded-2xl m-5 border border-dashed border-neutral-200/60 dark:border-neutral-700/40">
                  <div className="w-12 h-12 rounded-full bg-[#6C47FF]/5 flex items-center justify-center text-[#6C47FF] mb-3 animate-pulse">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase font-mono tracking-wider">No Attendees Enrolled</h4>
                  <p className="text-[11px] text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
                    Add guests manually to instantly generate secure QR entry passes.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest font-mono bg-[#6C47FF] hover:bg-[#5B39E0] text-white transition-all cursor-pointer uppercase active:scale-95"
                  >
                    Enroll First Guest
                  </button>
                </div>
              ) : (
                // overflow-visible so the kebab dropdown isn't clipped
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900/40 text-neutral-400 font-mono tracking-wider font-semibold border-b border-neutral-100 dark:border-neutral-800/50">
                        <th className="py-3 px-5 uppercase">Attendee Details</th>
                        <th className="py-3 px-5 uppercase">Ticket Type</th>
                        <th className="py-3 px-5 uppercase">Pass Register</th>
                        <th className="py-3 px-5 uppercase">Check-In Status</th>
                        <th className="py-3 px-5 uppercase text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40 font-medium">
                      {filteredAttendees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-neutral-400">No matched attendee records.</td>
                        </tr>
                      ) : (
                        filteredAttendees.map(a => {
                          const pass = passes[a.id];
                          const isCheckedIn = pass?.status === 'used';
                          const isCurrentlySelected = selectedAttendeeId === a.id;
 
                          let ticketBadgeColor = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300';
                          if (a.ticket_type === 'VIP') ticketBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20';
                          if (a.ticket_type === 'Speaker') ticketBadgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-500/20';
                          if (a.ticket_type === 'Staff') ticketBadgeColor = 'bg-[#6C47FF]/10 text-[#6C47FF] border border-[#6C47FF]/15';
 
                          return (
                            <tr
                              key={a.id}
                              onClick={() => setSelectedAttendeeId(a.id)}
                              className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer ${
                                isCurrentlySelected ? 'bg-neutral-50 dark:bg-neutral-800/20' : ''
                              }`}
                            >
                              {/* Attendee Name + Email */}
                              <td className="py-3.5 px-5">
                                <p className="font-bold text-neutral-900 dark:text-white leading-tight">{a.name}</p>
                                <p className="text-[10px] text-neutral-400 font-normal leading-none mt-1">{a.email}</p>
                              </td>
 
                              {/* Ticket Badge */}
                              <td className="py-3.5 px-5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${ticketBadgeColor}`}>
                                  {(a.ticket_type || 'General').toUpperCase()}
                                </span>
                              </td>
 
                              {/* Pass ID */}
                              <td className="py-3.5 px-5 font-mono text-neutral-500 dark:text-neutral-400 font-semibold leading-none">
                                {pass?.pass_id || 'unassigned'}
                              </td>
 
                              {/* Check-in toggle */}
                              <td className="py-3.5 px-5">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); togglePassStatus(a.id); }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wide font-bold transition-all border shrink-0 ${
                                    isCheckedIn
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 border-neutral-200 dark:border-neutral-700'
                                  }`}
                                >
                                  {isCheckedIn ? (
                                    <><CheckCircle className="w-3 h-3" /><span>CHECKED-IN</span></>
                                  ) : (
                                    <><XCircle className="w-3 h-3" /><span>NOT CHECKED</span></>
                                  )}
                                </button>
                              </td>
 
                              {/* Kebab Menu — positioned relative to this cell */}
                              <td
                                className="py-3.5 px-5 text-right"
                                style={{ position: 'relative' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuAttendeeId(openMenuAttendeeId === a.id ? null : a.id);
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center ml-auto text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
 
                                {openMenuAttendeeId === a.id && (
                                  <div
                                    className="absolute right-3 top-9 z-[60] w-44 bg-white dark:bg-[#2A2A2A] border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl shadow-lg overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* View Pass */}
                                    <button
                                      onClick={() => { setSelectedAttendeeId(a.id); setOpenMenuAttendeeId(null); }}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                      <span>View Pass</span>
                                    </button>
 
                                    {/* Edit */}
                                    <button
                                      onClick={() => handleOpenEdit(a)}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                      <span>Edit Attendee</span>
                                    </button>
 
                                    {/* Share Link */}
                                    {pass && (
                                      <button
                                        onClick={() => handleShareLink(pass)}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
                                      >
                                        <Link className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                        <span>Copy Pass Link</span>
                                      </button>
                                    )}
 
                                    {/* Export PNG */}
                                    <button
                                      onClick={() => handleExportPNG(a)}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                      <span>Export as PNG</span>
                                    </button>
 
                                    {/* Export PDF */}
                                    <button
                                      onClick={() => handleExportPDF(a)}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                      <span>Export as PDF</span>
                                    </button>
 
                                    {/* Divider */}
                                    <div className="h-px bg-neutral-100 dark:bg-neutral-700/50 mx-3 my-1" />
 
                                    {/* Delete */}
                                    <button
                                      onClick={() => handleDelete(a.id)}
                                      disabled={isDeletingId === a.id}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left disabled:opacity-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>{isDeletingId === a.id ? 'Deleting...' : 'Delete Attendee'}</span>
                                    </button>
                                  </div>
                                )}
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
 
          {/* ── Right Column: Pass Preview Panel ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white dark:bg-[#222222] border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-mono font-bold text-neutral-400 tracking-widest uppercase mb-4 self-start">
                BRAND PASS VERIFICATION LAYOUT
              </span>
 
              {activeAtt && activePass ? (
                <div className="space-y-4 w-full">
                  <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/40 dark:border-neutral-700/40 rounded-xl p-4 flex flex-col items-center">
 
                    {/* Pass render target — ID used by PNG/PDF export */}
                    <div id={`pass-render-${activeAtt.id}`}>
                      <PassPreview
  event={event}
  attendeeName={activeAtt.name}
  ticketType={activeAtt.ticket_type}
  passId={activePass.pass_id}
  qrToken={activePass.qr_token}
/>
                    </div>
 
                    {/* Check-in controls */}
                    <div className="w-full pt-4 mt-4 border-t border-neutral-200/40 dark:border-neutral-700/40 text-left space-y-3">
                      <div>
                        <p className="text-xs font-mono text-neutral-400">QR CODE CHECK-IN DECODER</p>
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeAtt.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5 break-all">{activePass.qr_token}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-neutral-400">
                  <Users className="w-8 h-8 mx-auto opacity-30 animate-pulse mb-2" />
                  <p className="text-xs">Select an attendee from the roster to preview their pass.</p>
                </div>
              )}
            </div>
          </div>
 
        </div>
      </div>
 
      {/* ── Add Attendee Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#222222] border border-neutral-200/40 dark:border-neutral-700/40 rounded-3xl p-6 md:p-8 space-y-5 text-left">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Register Pass Attendee</h3>
            <p className="text-xs text-neutral-500">Onboard attendees manually. This assigns an instant QR and ticket ID.</p>
 
            <form onSubmit={handleAddAttendee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Adeleke Temi"
                  value={newAttName}
                  onChange={(e) => setNewAttName(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:border-[#6C47FF] outline-none transition-colors"
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
                  className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:border-[#6C47FF] outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Ticket Classification</label>
                <select
                  value={newAttTicket}
                  onChange={(e) => setNewAttTicket(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#6C47FF] outline-none transition-colors"
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
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
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
 
      {/* ── Edit Attendee Modal ── */}
      {showEditModal && editingAttendee && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#222222] border border-neutral-200/40 dark:border-neutral-700/40 rounded-3xl p-6 md:p-8 space-y-5 text-left">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Attendee</h3>
            <p className="text-xs text-neutral-500">Update attendee details. Pass ID and QR code remain the same.</p>
 
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:border-[#6C47FF] outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:border-[#6C47FF] outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 font-bold">Ticket Classification</label>
                <select
                  value={editTicket}
                  onChange={(e) => setEditTicket(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#6C47FF] outline-none transition-colors"
                >
                  <option value="General">General Ticket</option>
                  <option value="VIP">VIP Ticket</option>
                  <option value="Speaker">Speaker Access</option>
                  <option value="Staff">Event Staff</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingAttendee(null); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6C47FF] hover:bg-[#5B39E0] transition-all disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-full shadow-lg pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );}
