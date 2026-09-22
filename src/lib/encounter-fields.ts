/**
 * The only columns an admin request may write to an encounter.
 *
 * This list is the enforcement point for the scope rule: there is no result,
 * value, reading or report column on it, so no request — however it is
 * shaped — can put clinical content into the tracking table.
 */
export const ENCOUNTER_FIELDS = [
  "patient_name",
  "patient_dob",
  "date_of_service",
  "practice_id",
  "ordering_provider",
  "test_types",
  "lab_id",
  "results_received",
  "results_received_on",
  "results_sent",
  "results_sent_on",
  "results_sent_method",
  "rl_sticks_requested",
  "rl_sticks_paid",
  "rl_insurance_paid",
  "payment_method",
  "amount_due",
  "amount_paid",
  "paid_on",
  "phlebotomist_id",
  "status",
  "notes",
  "archived_at",
] as const;
