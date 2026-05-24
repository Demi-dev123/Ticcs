export type TemplateId = 'minimal' | 'modern' | 'dark' | 'elegant';

export interface Event {
  id: string;
  user_id?: string;
  name: string;
  date: string;
  event_date?: string;
  time: string;
  venue: string;
  organizer_name: string;
  brand_color: string;
  banner_url?: string;
  template: TemplateId;
  font_style: 'default' | 'sans' | 'mono';
  created_at?: string;
  updated_at?: string;
}

export interface Attendee {
  id: string;
  event_id: string;
  name: string;
  email?: string;
  ticket_type: 'General' | 'VIP' | 'Speaker' | 'Staff';
  created_at?: string;
}

export interface Pass {
  id: string;
  attendee_id: string;
  event_id: string;
  pass_id: string; // e.g. TCS-8F3K29A
  qr_token: string; // UUID token for scanning
  status: 'unused' | 'used' | 'invalidated';
  scanned_at?: string;
  generated_at?: string;
}
