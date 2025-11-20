import { defineSchema } from "convex/server";
import { patients } from "./schema/patients";
import { doctors } from "./schema/doctors";
import { doctor_registrations } from "./schema/doctor_registrations";
import { appointments } from "./schema/appointments";
import { medical_records } from "./schema/medical_records";
import { messages } from "./schema/messages";
import { vitals } from "./schema/vitals";

import { logs } from "./schema/logs";

export default defineSchema({
    patients,
    doctors,
    doctor_registrations,
    appointments,
    medical_records,
    messages,
    vitals,
    logs,
});
