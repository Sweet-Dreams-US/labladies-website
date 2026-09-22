/**
 * Shapes for the collection tracking board.
 *
 * SCOPE RULE — read this before adding a field. This system tracks the
 * business process around a collection, never its clinical content. The type
 * of test is data; the result of a test is not, and there is deliberately
 * nowhere in these types to put one. `resultsReceived` and `resultsSent` are
 * yes/no workflow flags, exactly as Michelle's sheet had them.
 */

export type PracticeKind = "np" | "md" | "practice" | "concierge" | "self_referred";

export const PRACTICE_KIND_LABEL: Record<PracticeKind, string> = {
  np: "Nurse Practitioner",
  md: "Physician",
  practice: "Practice / Group",
  concierge: "Concierge PCP",
  self_referred: "Self-referred",
};

export type Practice = {
  id: string;
  name: string;
  organization: string | null;
  kind: PracticeKind;
  phone: string | null;
  email: string | null;
  fax: string | null;
  notes: string | null;
  active: boolean;
  sort_order: number;
};

export type Lab = {
  id: string;
  name: string;
  short_code: string | null;
  /**
   * True for My Clinical and GSB: Lab Ladies holds chart access and owes the
   * ordering practitioner the results. This is what makes the result
   * follow-up columns — and the overdue alerts — apply at all.
   */
  is_reference_lab: boolean;
  /**
   * True for Quest and Labcorp: the ordering provider uses their own account.
   * Once the specimen is delivered Lab Ladies has no further access, so the
   * board must not ask for, or nag about, results.
   */
  requires_provider_account: boolean;
  notes: string | null;
  active: boolean;
  sort_order: number;
};

export type Phlebotomist = {
  id: string;
  name: string;
  initials: string;
  active: boolean;
};

export type PaymentMethod =
  | "none"
  | "self_pay"
  | "check"
  | "card"
  | "practice_billed"
  | "reference_lab";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  none: "Not recorded",
  self_pay: "Self-pay (cash)",
  check: "Check",
  card: "Credit card (BoA merchant)",
  practice_billed: "Billed to the practice",
  reference_lab: "Paid by the reference lab",
};

export type SendMethod = "email" | "fax" | "portal" | "phone" | "other";

export const SEND_METHOD_LABEL: Record<SendMethod, string> = {
  email: "Emailed",
  fax: "Faxed",
  portal: "Lab portal",
  phone: "Called",
  other: "Other",
};

export type EncounterStatus = "open" | "complete" | "on_hold" | "cancelled";

export const STATUS_LABEL: Record<EncounterStatus, string> = {
  open: "Open",
  complete: "Complete",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

export type Encounter = {
  id: string;
  patient_name: string;
  patient_dob: string | null;
  date_of_service: string | null;
  practice_id: string | null;
  ordering_provider: string | null;
  /** What was collected. Never a result. */
  test_types: string[];
  lab_id: string | null;
  results_received: boolean;
  results_received_on: string | null;
  results_sent: boolean;
  results_sent_on: string | null;
  /** How they went out. Her sheet already wrote "E" for emailed, "F" for faxed. */
  results_sent_method: SendMethod | null;
  rl_sticks_requested: boolean;
  rl_sticks_paid: boolean;
  rl_insurance_paid: boolean;
  payment_method: PaymentMethod;
  amount_due: string | number | null;
  amount_paid: string | number | null;
  paid_on: string | null;
  phlebotomist_id: string | null;
  status: EncounterStatus;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewEncounter = Partial<Omit<Encounter, "id" | "created_at" | "updated_at">> & {
  patient_name: string;
};

/**
 * The collection types Michelle actually runs, offered as chips on the form.
 * Free text is still allowed — this is a shortcut, not a whitelist.
 */
export const TEST_TYPE_OPTIONS = [
  "Blood draw",
  "Urine PCR",
  "Urine (clean catch)",
  "Diaper swab PCR",
  "Respiratory PCR",
  "Wound PCR",
  "GI PCR",
  "Culture & sensitivity",
  "Drug screen",
  "STD rapid",
  "Gender reveal DNA",
  "Courier pickup only",
] as const;

export type Reference = {
  practices: Practice[];
  labs: Lab[];
  phlebotomists: Phlebotomist[];
};

/** An encounter joined to the names it points at, for display. */
export type EncounterRow = Encounter & {
  practice: Practice | null;
  lab: Lab | null;
  phlebotomist: Phlebotomist | null;
};

export type AlertRule =
  | "results_overdue"
  | "forward_overdue"
  | "payment_overdue"
  | "inquiry_uncontacted";

export type Alert = {
  rule: AlertRule;
  label: string;
  /** Why this row is showing up, in Michelle's words. */
  detail: string;
  daysOverdue: number;
  /**
   * The row this is about, flattened so callers never branch on the kind:
   * `subject` is the name to show, `entityId` is what de-duplicates the
   * emails, and `when` is the date it hinges on.
   */
  entityId: string;
  subject: string;
  when: string | null;
  /** Only set for the three encounter rules; the inquiry rule has none. */
  encounter?: EncounterRow;
};

/** How long each step may sit before the board flags it. */
export const ALERT_DAYS: Record<AlertRule, number> = {
  results_overdue: 7,
  forward_overdue: 2,
  payment_overdue: 30,
  // Someone who fills in a form is usually ringing round several providers.
  inquiry_uncontacted: 1,
};
