import { Event, Attendee, Pass } from '../types';

const EVENTS_KEY = 'ticss_offline_events';
const ATTENDEES_KEY = 'ticss_offline_attendees';
const PASSES_KEY = 'ticss_offline_passes';

export function getEventsOffline(userId: string): Event[] {
  try {
    const dataObj = localStorage.getItem(EVENTS_KEY);
    if (!dataObj) return [];
    const events: Event[] = JSON.parse(dataObj);
    return events.filter(e => e.user_id === userId);
  } catch (err) {
    console.error('Error reading offline events:', err);
    return [];
  }
}

export function getEventOffline(eventId: string): Event | null {
  try {
    const dataObj = localStorage.getItem(EVENTS_KEY);
    if (!dataObj) return null;
    const events: Event[] = JSON.parse(dataObj);
    return events.find(e => e.id === eventId) || null;
  } catch (err) {
    console.error('Error reading offline event:', err);
    return null;
  }
}

export function saveEventOffline(event: Event) {
  try {
    const dataObj = localStorage.getItem(EVENTS_KEY);
    const events: Event[] = dataObj ? JSON.parse(dataObj) : [];
    const index = events.findIndex(e => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Error saving offline event:', err);
  }
}

export function getAttendeesOffline(eventId: string): Attendee[] {
  try {
    const dataObj = localStorage.getItem(ATTENDEES_KEY);
    if (!dataObj) return [];
    const attendees: Attendee[] = JSON.parse(dataObj);
    return attendees.filter(a => a.event_id === eventId);
  } catch (err) {
    console.error('Error reading offline attendees:', err);
    return [];
  }
}

export function saveAttendeeOffline(attendee: Attendee) {
  try {
    const dataObj = localStorage.getItem(ATTENDEES_KEY);
    const attendees: Attendee[] = dataObj ? JSON.parse(dataObj) : [];
    const index = attendees.findIndex(a => a.id === attendee.id);
    if (index >= 0) {
      attendees[index] = attendee;
    } else {
      attendees.push(attendee);
    }
    localStorage.setItem(ATTENDEES_KEY, JSON.stringify(attendees));
  } catch (err) {
    console.error('Error saving offline attendee:', err);
  }
}

export function getPassesOffline(eventId: string): Pass[] {
  try {
    const dataObj = localStorage.getItem(PASSES_KEY);
    if (!dataObj) return [];
    const passes: Pass[] = JSON.parse(dataObj);
    return passes.filter(p => p.event_id === eventId);
  } catch (err) {
    console.error('Error reading offline passes:', err);
    return [];
  }
}

export function savePassOffline(pass: Pass) {
  try {
    const dataObj = localStorage.getItem(PASSES_KEY);
    const passes: Pass[] = dataObj ? JSON.parse(dataObj) : [];
    const index = passes.findIndex(p => p.id === pass.id || (p.attendee_id === pass.attendee_id && p.event_id === pass.event_id));
    if (index >= 0) {
      passes[index] = { ...passes[index], ...pass };
    } else {
      passes.push(pass);
    }
    localStorage.setItem(PASSES_KEY, JSON.stringify(passes));
  } catch (err) {
    console.error('Error saving offline pass:', err);
  }
}

export function updatePassStatusOffline(passId: string, status: 'unused' | 'used' | 'invalidated', scannedAt?: string) {
  try {
    const dataObj = localStorage.getItem(PASSES_KEY);
    if (!dataObj) return;
    const passes: Pass[] = JSON.parse(dataObj);
    const index = passes.findIndex(p => p.id === passId);
    if (index >= 0) {
      passes[index].status = status;
      passes[index].scanned_at = scannedAt;
      localStorage.setItem(PASSES_KEY, JSON.stringify(passes));
    }
  } catch (err) {
    console.error('Error updating offline pass:', err);
  }
}

export function deleteAttendeeOffline(attendeeId: string) {
  try {
    const dataObj = localStorage.getItem(ATTENDEES_KEY);
    if (dataObj) {
      const attendees: Attendee[] = JSON.parse(dataObj);
      const filtered = attendees.filter(a => a.id !== attendeeId);
      localStorage.setItem(ATTENDEES_KEY, JSON.stringify(filtered));
    }
    
    // Also delete their passes
    const passObj = localStorage.getItem(PASSES_KEY);
    if (passObj) {
      const passes: Pass[] = JSON.parse(passObj);
      const filtered = passes.filter(p => p.attendee_id !== attendeeId);
      localStorage.setItem(PASSES_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Error deleting offline attendee:', err);
  }
}

