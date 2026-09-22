/**
 * Website inquiries.
 *
 * Same scope rule as the tracking board: this records who wants a call back
 * and roughly what about, never clinical detail. There is no date-of-birth
 * field and no diagnosis field, and the form asks people not to put medical
 * information in the message.
 */

export type InquiryStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "booked"
  | "closed"
  | "spam";

/** Order matters: this is the pipeline, left to right, in the admin UI. */
export const INQUIRY_FLOW: InquiryStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "booked",
  "closed",
];

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  booked: "Visit done",
  closed: "Closed",
  spam: "Spam",
};

export const INQUIRY_STATUS_HINT: Record<InquiryStatus, string> = {
  new: "Nobody has reached out yet.",
  contacted: "You have spoken to them or left a message.",
  scheduled: "A visit is on the calendar.",
  booked: "The collection has been done.",
  closed: "Nothing further to do.",
  spam: "Junk — hidden from the main list.",
};

export type Inquiry = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  prefer: string | null;
  inquiry_for: string | null;
  service: string | null;
  area: string | null;
  message: string | null;
  source_path: string | null;
  status: InquiryStatus;
  admin_notes: string | null;
  contacted_at: string | null;
  archived_at: string | null;
  email_status: string | null;
  created_at: string;
  updated_at: string;
};

export type NewInquiry = {
  name: string;
  phone?: string | null;
  email?: string | null;
  prefer?: string | null;
  inquiry_for?: string | null;
  service?: string | null;
  area?: string | null;
  message?: string | null;
  source_path?: string | null;
};

/** What the form offers. Free text is not accepted for these — pick or skip. */
export const INQUIRY_FOR_OPTIONS = [
  "Myself",
  "A family member",
  "A resident in our community",
  "A patient in our practice",
  "Our business",
] as const;

export const SERVICE_OPTIONS = [
  "Mobile blood draw",
  "PCR testing",
  "Culture & sensitivity",
  "Drug testing",
  "STD rapid testing",
  "Gender reveal DNA testing",
  "Medical courier / contracted pickups",
  "Not sure yet",
] as const;

export const PREFER_OPTIONS = ["Phone call", "Text message", "Email"] as const;

/**
 * How long a new inquiry may sit before the board flags it.
 *
 * Deliberately tight. Someone who fills in a form is usually ringing round
 * several providers, and the first callback tends to win the work.
 */
export const INQUIRY_ALERT_HOURS = 24;
