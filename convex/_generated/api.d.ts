/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as doctor_registrations from "../doctor_registrations.js";
import type * as doctors from "../doctors.js";
import type * as messages from "../messages.js";
import type * as patients from "../patients.js";
import type * as schema_appointments from "../schema/appointments.js";
import type * as schema_doctor_registrations from "../schema/doctor_registrations.js";
import type * as schema_doctors from "../schema/doctors.js";
import type * as schema_logs from "../schema/logs.js";
import type * as schema_medical_records from "../schema/medical_records.js";
import type * as schema_messages from "../schema/messages.js";
import type * as schema_patients from "../schema/patients.js";
import type * as schema_vitals from "../schema/vitals.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  doctor_registrations: typeof doctor_registrations;
  doctors: typeof doctors;
  messages: typeof messages;
  patients: typeof patients;
  "schema/appointments": typeof schema_appointments;
  "schema/doctor_registrations": typeof schema_doctor_registrations;
  "schema/doctors": typeof schema_doctors;
  "schema/logs": typeof schema_logs;
  "schema/medical_records": typeof schema_medical_records;
  "schema/messages": typeof schema_messages;
  "schema/patients": typeof schema_patients;
  "schema/vitals": typeof schema_vitals;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
