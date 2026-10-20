/* ==========================================================================
   Ayurved Clinic demo — shared data layer
   Everything lives in localStorage so the demo runs with no backend.
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'ayurved_demo_v2';
  const SESSION_KEY = 'ayurved_session_v2';
  const DEMO_OTP = '123456';

  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  };
  const parseISO = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const todayISO = () => iso(new Date());
  const stamp = () => {
    const d = new Date();
    return `${iso(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const DEFAULT_SETTINGS = {
    name: 'Ayurved Clinic',
    tagline: 'Classical Ayurveda, modern care',
    address: '',
    phone: '',
    email: '',
    open: '10:00',
    close: '20:00',
    slotMinutes: 30,
    leadTimeHours: 2,
    bookingDays: 30,
    cancelPolicy:
      'Appointments cannot be cancelled or rescheduled online. Please call the clinic and our team will help you.',
  };

  const DOCTOR = {
    id: 'd1',
    name: 'Dr. Meera Kulkarni',
    qualification: 'BAMS, MD (Kayachikitsa)',
    experience: '14 years',
    about:
      'Practising classical Ayurveda with a focus on digestive health, joint care and stress-related conditions. Treatment plans combine diet, lifestyle and panchakarma therapies.',
    days: [0, 1, 2, 3, 4, 5, 6],
  };

  const TREATMENTS = [
    {
      id: 't1',
      name: 'Ayurvedic Consultation',
      category: 'Consultation',
      duration: 30,
      sessions: 1,
      price: 500,
      summary: 'Nadi pariksha (pulse), prakriti assessment and a personal treatment plan.',
      inclusions: ['Pulse and prakriti assessment', 'Diet and lifestyle plan', 'Written prescription'],
      published: true,
      featured: true,
    },
    {
      id: 't2',
      name: 'Abhyanga Therapy',
      category: 'Therapy',
      duration: 30,
      sessions: 3,
      price: 2400,
      summary: 'Warm medicated-oil full body massage to ease stiffness and improve circulation.',
      inclusions: ['3 sessions of 30 minutes', 'Medicated oil selection', 'Post-therapy advice'],
      published: true,
      featured: true,
    },
    {
      id: 't3',
      name: 'Shirodhara',
      category: 'Therapy',
      duration: 30,
      sessions: 5,
      price: 4500,
      summary: 'Continuous oil stream on the forehead for sleep, anxiety and migraine support.',
      inclusions: ['5 sessions of 30 minutes', 'Scalp and neck massage', 'Follow-up review'],
      published: true,
      featured: true,
    },
    {
      id: 't4',
      name: 'Panchakarma Detox',
      category: 'Package',
      duration: 30,
      sessions: 7,
      price: 18000,
      summary: 'A supervised seven-session detox plan with diet guidance and daily review.',
      inclusions: ['7 therapy sessions', 'Daily doctor review', 'Detox diet plan', 'Closing consultation'],
      published: true,
      featured: true,
    },
    {
      id: 't5',
      name: 'Nasya Therapy',
      category: 'Therapy',
      duration: 30,
      sessions: 3,
      price: 1800,
      summary: 'Nasal instillation for sinus congestion, allergies and recurrent headaches.',
      inclusions: ['3 sessions of 30 minutes', 'Face and neck massage', 'Steam therapy'],
      published: true,
      featured: false,
    },
    {
      id: 't6',
      name: 'Follow-up Consultation',
      category: 'Consultation',
      duration: 30,
      sessions: 1,
      price: 300,
      summary: 'Review of progress, prescription adjustment and next-step planning.',
      inclusions: ['Progress review', 'Prescription update', 'Diet fine-tuning'],
      published: true,
      featured: false,
    },
  ];

  const PATIENTS = [
    { id: 'p1', name: 'Asha Verma', mobile: '9876543210', gender: 'Female', dob: '1988-04-12', email: 'asha@example.com', address: 'Kothrud, Pune', createdAt: '2026-08-18' },
    { id: 'p2', name: 'Rohan Mehta', mobile: '9822011223', gender: 'Male', dob: '1993-11-02', email: 'rohan@example.com', address: 'Baner, Pune', createdAt: '2026-09-02' },
    { id: 'p3', name: 'Sunita Patil', mobile: '9765432109', gender: 'Female', dob: '1965-01-27', email: '', address: 'Aundh, Pune', createdAt: '2026-09-21' },
  ];

  function seedAppointments() {
    const t = new Date();
    const day = (n) => iso(addDays(t, n));
    return [
      { id: 'a1', bookingId: 'AYC-' + day(0).replace(/-/g, '').slice(2) + '-001', patientId: 'p1', doctorId: 'd1', treatmentId: 't2', date: day(0), time: '10:30', status: 'confirmed', source: 'website', notes: '', createdAt: day(-2) + ' 09:14' },
      { id: 'a2', bookingId: 'AYC-' + day(0).replace(/-/g, '').slice(2) + '-002', patientId: 'p2', doctorId: 'd1', treatmentId: 't1', date: day(0), time: '12:00', status: 'confirmed', source: 'website', notes: 'Knee pain follow-up', createdAt: day(-1) + ' 18:40' },
      { id: 'a3', bookingId: 'AYC-' + day(0).replace(/-/g, '').slice(2) + '-003', patientId: 'p3', doctorId: 'd1', treatmentId: 't3', date: day(0), time: '16:30', status: 'confirmed', source: 'phone', notes: '', createdAt: day(-3) + ' 11:05' },
      { id: 'a4', bookingId: 'AYC-' + day(1).replace(/-/g, '').slice(2) + '-001', patientId: 'p1', doctorId: 'd1', treatmentId: 't1', date: day(1), time: '11:00', status: 'confirmed', source: 'website', notes: '', createdAt: day(-1) + ' 10:12' },
      { id: 'a5', bookingId: 'AYC-' + day(2).replace(/-/g, '').slice(2) + '-001', patientId: 'p2', doctorId: 'd1', treatmentId: 't5', date: day(2), time: '17:00', status: 'confirmed', source: 'phone', notes: 'Sinus congestion', createdAt: day(-1) + ' 16:20' },
      { id: 'a6', bookingId: 'AYC-' + day(-1).replace(/-/g, '').slice(2) + '-001', patientId: 'p1', doctorId: 'd1', treatmentId: 't6', date: day(-1), time: '12:30', status: 'completed', source: 'website', notes: '', createdAt: day(-4) + ' 08:55' },
      { id: 'a7', bookingId: 'AYC-' + day(-3).replace(/-/g, '').slice(2) + '-001', patientId: 'p3', doctorId: 'd1', treatmentId: 't2', date: day(-3), time: '10:00', status: 'no-show', source: 'website', notes: '', createdAt: day(-6) + ' 19:02' },
      { id: 'a8', bookingId: 'AYC-' + day(-2).replace(/-/g, '').slice(2) + '-001', patientId: 'p2', doctorId: 'd1', treatmentId: 't1', date: day(-2), time: '15:00', status: 'completed', source: 'walk-in', notes: '', createdAt: day(-2) + ' 09:30' },
      { id: 'a9', bookingId: 'AYC-' + day(3).replace(/-/g, '').slice(2) + '-001', patientId: 'p3', doctorId: 'd1', treatmentId: 't4', date: day(3), time: '13:00', status: 'cancelled', source: 'website', notes: 'Cancelled on phone', createdAt: day(-2) + ' 12:11' },
      { id: 'a10', bookingId: 'AYC-' + day(-5).replace(/-/g, '').slice(2) + '-001', patientId: 'p1', doctorId: 'd1', treatmentId: 't2', date: day(-5), time: '18:00', status: 'completed', source: 'website', notes: '', createdAt: day(-9) + ' 07:45' },
    ];
  }

  function seedHealthRecords() {
    const t = new Date();
    const day = (n) => iso(addDays(t, n));
    return [
      {
        id: 'h1', patientId: 'p1', appointmentId: 'a6', doctorId: 'd1', date: day(-1),
        complaint: 'Low appetite and bloating after meals',
        diagnosis: 'Agnimandya (weak digestion) with vata-pitta imbalance',
        prakriti: 'Vata-Pitta', allergies: 'None known',
        medications: 'Triphala 1 tsp at night, 30 days',
        notes: 'Warm, light diet for four weeks. Avoid cold drinks and late dinners. Review in 21 days.',
        shared: true,
      },
      {
        id: 'h2', patientId: 'p1', appointmentId: 'a10', doctorId: 'd1', date: day(-5),
        complaint: 'Stiffness in lower back',
        diagnosis: 'Vata aggravation, occupational posture strain',
        prakriti: 'Vata-Pitta', allergies: 'None known',
        medications: 'Maharasnadi kwath 15 ml twice daily',
        notes: 'Abhyanga three sessions. Daily stretching routine demonstrated.',
        shared: true,
      },
      {
        id: 'h3', patientId: 'p2', appointmentId: 'a8', doctorId: 'd1', date: day(-2),
        complaint: 'Recurring headaches in the afternoon',
        diagnosis: 'Pitta imbalance with mild dehydration',
        prakriti: 'Pitta-Kapha', allergies: 'Dust',
        medications: 'Guduchi satva 500 mg twice daily for 14 days',
        notes: 'Internal note: check sleep pattern next visit.',
        shared: false,
      },
    ];
  }

  function seedNotifications() {
    const t = new Date();
    const day = (n) => iso(addDays(t, n));
    return [
      { id: 'n1', appointmentId: 'a1', channel: 'WhatsApp', template: 'booking_confirmed', status: 'delivered', sentAt: day(-2) + ' 09:14', to: '9876543210', preview: 'Namaste Asha, your appointment is confirmed for today at 10:30 AM with Dr. Meera Kulkarni.' },
      { id: 'n2', appointmentId: 'a2', channel: 'WhatsApp', template: 'booking_confirmed', status: 'delivered', sentAt: day(-1) + ' 18:40', to: '9822011223', preview: 'Namaste Rohan, your appointment is confirmed for today at 12:00 PM with Dr. Meera Kulkarni.' },
      { id: 'n3', appointmentId: 'a3', channel: 'SMS', template: 'booking_confirmed', status: 'failed', sentAt: day(-3) + ' 11:05', to: '9765432109', preview: 'Namaste Sunita, your appointment is confirmed for today at 4:30 PM. Reply HELP for support.' },
    ];
  }

  function seedAudit() {
    const t = new Date();
    const day = (n) => iso(addDays(t, n));
    return [
      { id: 'au1', at: day(-1) + ' 18:42', actor: 'Front Desk', action: 'Appointment confirmed', entity: 'AYC booking', detail: 'Rohan Mehta · today 12:00 PM' },
      { id: 'au2', at: day(-2) + ' 12:12', actor: 'Front Desk', action: 'Appointment cancelled', entity: 'AYC booking', detail: 'Cancelled on phone for Sunita Patil' },
      { id: 'au3', at: day(-2) + ' 10:05', actor: 'Dr. Meera Kulkarni', action: 'Health record updated', entity: 'Patient p2', detail: 'Added consultation note' },
      { id: 'au4', at: day(-4) + ' 16:30', actor: 'Admin', action: 'Package price updated', entity: 'Shirodhara', detail: '₹4,800 → ₹4,500' },
    ];
  }

  function seed() {
    return {
      version: 2,
      settings: { ...DEFAULT_SETTINGS },
      doctor: { ...DOCTOR },
      treatments: TREATMENTS.map((x) => ({ ...x })),
      patients: PATIENTS.map((x) => ({ ...x })),
      appointments: seedAppointments(),
      healthRecords: seedHealthRecords(),
      notifications: seedNotifications(),
      audit: seedAudit(),
      enquiries: [
        { id: 'e1', name: 'Neha Joshi', mobile: '9911223344', message: 'Do you offer treatment for thyroid support?', at: iso(new Date()) + ' 09:20', status: 'new' },
      ],
      counters: { patient: 4, appointment: 11, record: 4, notification: 4, enquiry: 2 },
    };
  }

  let cache = null;

  function read() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        cache = JSON.parse(raw);
        if (cache && cache.version === 2) return cache;
      }
    } catch (err) {
      console.warn('Could not read demo data, starting fresh.', err);
    }
    cache = seed();
    write();
    return cache;
  }

  function write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch (err) {
      console.warn('Could not save demo data.', err);
    }
  }

  function db() {
    return read();
  }

  function commit() {
    write();
  }

  /* ---------- formatting ---------- */
  function fmtDate(dateISO, opts) {
    if (!dateISO) return '';
    const d = parseISO(dateISO);
    return d.toLocaleDateString('en-IN', opts || { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function fmtLongDate(dateISO) {
    return fmtDate(dateISO, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${pad(m)} ${suffix}`;
  }

  function minutesOf(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function money(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  function slots() {
    const s = db().settings;
    const out = [];
    for (let t = minutesOf(s.open); t + s.slotMinutes <= minutesOf(s.close); t += s.slotMinutes) {
      out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
    }
    return out;
  }

  function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function blockedStatus(status) {
    return status === 'confirmed' || status === 'completed' || status === 'pending';
  }

  function appointmentAt(date, time) {
    return db().appointments.find((a) => a.date === date && a.time === time && blockedStatus(a.status)) || null;
  }

  function slotState(dateISO, time) {
    const s = db().settings;
    const today = todayISO();
    if (dateISO < today) return 'past';
    if (dateISO === today && minutesOf(time) < nowMinutes()) return 'past';
    if (dateISO === today && minutesOf(time) < nowMinutes() + s.leadTimeHours * 60) return 'late';
    const maxDate = iso(addDays(new Date(), s.bookingDays));
    if (dateISO > maxDate) return 'closed';
    if (appointmentAt(dateISO, time)) return 'taken';
    return 'open';
  }

  function availableSlots(dateISO) {
    return slots().filter((t) => slotState(dateISO, t) === 'open');
  }

  function nextAvailable(limit) {
    const out = [];
    const start = new Date();
    for (let i = 0; i < (db().settings.bookingDays || 30) && out.length < (limit || 3); i++) {
      const date = iso(addDays(start, i));
      for (const time of availableSlots(date)) {
        out.push({ date, time });
        if (out.length >= (limit || 3)) break;
      }
    }
    return out;
  }

  /* ---------- patients ---------- */
  function findPatientByMobile(mobile) {
    const clean = String(mobile || '').replace(/\D/g, '').slice(-10);
    return db().patients.find((p) => p.mobile === clean) || null;
  }

  function patientById(id) {
    return db().patients.find((p) => p.id === id) || null;
  }

  function createPatient(data) {
    const d = db();
    const id = 'p' + d.counters.patient++;
    const patient = {
      id,
      name: data.name.trim(),
      mobile: String(data.mobile).replace(/\D/g, '').slice(-10),
      gender: data.gender || '',
      dob: data.dob || '',
      email: data.email || '',
      address: data.address || '',
      createdAt: todayISO(),
    };
    d.patients.push(patient);
    commit();
    return patient;
  }

  function updatePatient(id, patch) {
    const p = patientById(id);
    if (!p) return null;
    Object.assign(p, patch);
    commit();
    return p;
  }

  function maskMobile(m) {
    if (!m || m.length < 4) return m || '';
    return '••••••' + m.slice(-4);
  }

  /* ---------- session ---------- */
  function session() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function setSession(value) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function patientSession() {
    const s = session();
    return s && s.type === 'patient' ? patientById(s.patientId) : null;
  }

  function staffSession() {
    const s = session();
    return s && s.type === 'staff' ? s : null;
  }

  /* ---------- treatments ---------- */
  function treatments(publishedOnly) {
    return db().treatments.filter((t) => (publishedOnly ? t.published : true));
  }

  function treatmentById(id) {
    return db().treatments.find((t) => t.id === id) || null;
  }

  function updateTreatment(id, patch) {
    const t = treatmentById(id);
    if (!t) return null;
    Object.assign(t, patch);
    commit();
    return t;
  }

  /* ---------- appointments ---------- */
  function bookingId(dateISO) {
    const d = db();
    const seq = String(d.counters.appointment).padStart(3, '0');
    return 'AYC-' + dateISO.replace(/-/g, '').slice(2) + '-' + seq;
  }

  function book(payload) {
    const d = db();
    const state = slotState(payload.date, payload.time);
    if (payload.force) {
      if (appointmentAt(payload.date, payload.time)) return { ok: false, error: 'That slot is already booked.' };
    } else if (state !== 'open') {
      return { ok: false, error: 'That slot is no longer available.' };
    }
    const id = 'a' + d.counters.appointment++;
    const appt = {
      id,
      bookingId: 'AYC-' + payload.date.replace(/-/g, '').slice(2) + '-' + String(d.counters.appointment).padStart(3, '0'),
      patientId: payload.patientId,
      doctorId: 'd1',
      treatmentId: payload.treatmentId,
      date: payload.date,
      time: payload.time,
      status: 'confirmed',
      source: payload.source || 'website',
      notes: payload.notes || '',
      createdAt: stamp(),
    };
    d.appointments.push(appt);
    const patient = patientById(payload.patientId);
    const t = treatmentById(payload.treatmentId) || { name: 'Consultation' };
    d.notifications.unshift({
      id: 'n' + d.counters.notification++,
      appointmentId: id,
      channel: 'WhatsApp',
      template: 'booking_confirmed',
      status: 'delivered',
      sentAt: stamp(),
      to: patient ? patient.mobile : '',
      preview: `Namaste ${patient ? patient.name.split(' ')[0] : 'there'}, your ${t.name} is confirmed for ${fmtDate(appt.date, { day: 'numeric', month: 'short' })} at ${fmtTime(appt.time)}. Clinic: ${d.settings.name}.`,
    });
    audit(payload.actor || (patient ? patient.name : 'Patient'), 'Appointment booked', appt.bookingId, `${t.name} · ${fmtDate(appt.date)} ${fmtTime(appt.time)}`);
    commit();
    return { ok: true, appointment: appt };
  }

  function appointmentById(id) {
    return db().appointments.find((a) => a.id === id) || null;
  }

  function setStatus(id, status, actor) {
    const a = appointmentById(id);
    if (!a) return false;
    a.status = status;
    audit(actor || 'Staff', 'Appointment ' + status, a.bookingId, `${fmtDate(a.date)} ${fmtTime(a.time)}`);
    commit();
    return true;
  }

  function cancel(id, actor, reason) {
    const a = appointmentById(id);
    if (!a) return false;
    a.status = 'cancelled';
    if (reason) a.notes = (a.notes ? a.notes + ' · ' : '') + reason;
    const patient = patientById(a.patientId);
    db().notifications.unshift({
      id: 'n' + db().counters.notification++,
      appointmentId: a.id,
      channel: 'WhatsApp',
      template: 'booking_cancelled',
      status: 'delivered',
      sentAt: stamp(),
      to: patient ? patient.mobile : '',
      preview: `Namaste ${patient ? patient.name.split(' ')[0] : ''}, your appointment on ${fmtDate(a.date)} at ${fmtTime(a.time)} has been cancelled. Call us to rebook.`,
    });
    audit(actor || 'Staff', 'Appointment cancelled', a.bookingId, reason || 'Cancelled by clinic');
    commit();
    return true;
  }

  function reschedule(id, date, time, actor) {
    const a = appointmentById(id);
    if (!a) return { ok: false, error: 'Appointment not found.' };
    if (appointmentAt(date, time)) return { ok: false, error: 'That slot is already booked.' };
    const old = `${fmtDate(a.date)} ${fmtTime(a.time)}`;
    a.date = date;
    a.time = time;
    a.status = 'confirmed';
    audit(actor || 'Staff', 'Appointment rescheduled', a.bookingId, `${old} → ${fmtDate(date)} ${fmtTime(time)}`);
    commit();
    return { ok: true };
  }

  function nextBookingId() {
    return 'AYC-' + todayISO().replace(/-/g, '').slice(2) + '-' + String(db().counters.appointment).padStart(3, '0');
  }

  function appointmentsFor(patientId) {
    return db().appointments.filter((a) => a.patientId === patientId).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }

  function upcomingFor(patientId) {
    const now = new Date();
    const today = todayISO();
    const nowHM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return db()
      .appointments.filter((a) => {
        if (a.patientId !== patientId || a.status !== 'confirmed') return false;
        if (a.date > today) return true;
        return a.date === today && a.time >= nowHM;
      })
      .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));
  }

  /* ---------- health records ---------- */
  function recordsFor(patientId, sharedOnly) {
    return db()
      .healthRecords.filter((r) => r.patientId === patientId && (!sharedOnly || r.shared))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function addRecord(data, actor) {
    const d = db();
    const rec = {
      id: 'h' + d.counters.record++,
      patientId: data.patientId,
      appointmentId: data.appointmentId || '',
      doctorId: 'd1',
      date: data.date || todayISO(),
      complaint: data.complaint || '',
      diagnosis: data.diagnosis || '',
      prakriti: data.prakriti || '',
      allergies: data.allergies || '',
      medications: data.medications || '',
      notes: data.notes || '',
      shared: !!data.shared,
    };
    d.healthRecords.unshift(rec);
    audit(actor || 'Doctor', 'Health record added', rec.patientId, rec.diagnosis || rec.complaint);
    commit();
    return rec;
  }

  /* ---------- notifications ---------- */
  function notifications() {
    return db().notifications.slice().sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
  }

  function resendNotification(id) {
    const n = db().notifications.find((x) => x.id === id);
    if (!n) return false;
    const copy = {
      ...n,
      id: 'n' + db().counters.notification++,
      status: 'delivered',
      sentAt: stamp(),
    };
    db().notifications.unshift(copy);
    audit('Staff', 'Notification resent', n.appointmentId, n.channel + ' · ' + n.template);
    commit();
    return copy;
  }

  function addEnquiry(data) {
    const d = db();
    const e = {
      id: 'e' + d.counters.enquiry++,
      name: data.name,
      mobile: data.mobile,
      message: data.message,
      at: stamp(),
      status: 'new',
    };
    d.enquiries.unshift(e);
    audit('Website', 'Enquiry received', e.name, e.message.slice(0, 60));
    commit();
    return e;
  }

  /* ---------- audit ---------- */
  function audit(actor, action, entity, detail) {
    const d = db();
    d.audit.unshift({
      id: 'au' + Date.now() + Math.floor(Math.random() * 99),
      at: stamp(),
      actor,
      action,
      entity,
      detail,
    });
    d.audit = d.audit.slice(0, 60);
    commit();
  }

  function auditLog() {
    return db().audit.slice();
  }

  /* ---------- settings ---------- */
  function updateSettings(patch) {
    Object.assign(db().settings, patch);
    commit();
  }

  /* ---------- reports ---------- */
  function stats() {
    const d = db();
    const today = todayISO();
    const todays = d.appointments.filter((a) => a.date === today);
    const range = d.appointments.filter((a) => a.date >= iso(addDays(new Date(), -30)));
    const completed = range.filter((a) => a.status === 'completed').length;
    const noShow = range.filter((a) => a.status === 'no-show').length;
    const byTreatment = {};
    range.forEach((a) => {
      const t = treatmentById(a.treatmentId);
      const key = t ? t.name : 'Consultation';
      byTreatment[key] = (byTreatment[key] || 0) + 1;
    });
    const top = Object.entries(byTreatment).sort((x, y) => y[1] - x[1]);
    return {
      todayTotal: todays.length,
      todayConfirmed: todays.filter((a) => a.status === 'confirmed').length,
      todayCompleted: todays.filter((a) => a.status === 'completed').length,
      todayCancelled: todays.filter((a) => a.status === 'cancelled').length,
      todayNoShow: todays.filter((a) => a.status === 'no-show').length,
      rangeTotal: range.length,
      completed,
      noShow,
      noShowRate: completed + noShow ? Math.round((noShow / (completed + noShow)) * 100) : 0,
      top,
      totalPatients: d.patients.length,
      totalRecords: d.healthRecords.length,
    };
  }

  function csv(rows) {
    return rows.map((r) => r.map((c) => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  }

  /* ---------- reset ---------- */
  function reset() {
    cache = seed();
    write();
    localStorage.removeItem(SESSION_KEY);
    return cache;
  }

  window.Store = {
    DEMO_OTP,
    db,
    reset,
    todayISO,
    addDays,
    iso,
    fmtDate,
    fmtLongDate,
    fmtTime,
    money,
    masks: maskMobile,
    slotState,
    slots,
    availableSlots,
    nextAvailable,
    appointmentAt,
    patients: () => db().patients.slice(),
    patientById,
    findPatientByMobile,
    createPatient,
    updatePatient,
    session,
    setSession,
    clearSession,
    patientSession,
    staffSession,
    treatments,
    treatmentById,
    updateTreatment,
    bookingId: nextBookingId,
    book,
    appointmentById,
    appointmentsFor,
    upcomingFor,
    setStatus,
    cancel,
    reschedule,
    recordsFor,
    addRecord,
    notifications,
    resendNotification,
    addEnquiry,
    audit,
    auditLog,
    settings: () => ({ ...db().settings }),
    updateSettings,
    stats,
    csv,
    doctor: () => ({ ...db().doctor }),
    enquiries: () => db().enquiries.slice(),
  };
})();
