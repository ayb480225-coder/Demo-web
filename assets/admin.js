/* ==========================================================================
   Ayurved Clinic demo — staff panel
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ROLE = {
    admin: { label: 'Admin', person: 'Clinic Admin', email: 'admin@clinic.demo', modules: ['dashboard', 'appointments', 'patients', 'packages', 'notifications', 'reports', 'activity', 'settings'] },
    doctor: { label: 'Doctor', person: 'Dr. Meera Kulkarni', email: 'doctor@clinic.demo', modules: ['dashboard', 'appointments', 'patients', 'notifications'] },
    frontdesk: { label: 'Front Desk', person: 'Priya Nair', email: 'frontdesk@clinic.demo', modules: ['dashboard', 'appointments', 'patients', 'notifications', 'reports'] },
  };

  const ICON = {
    dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    appointments: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18" stroke-linecap="round"/></svg>',
    patients: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" stroke-linecap="round"/></svg>',
    packages: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
    notifications: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4" stroke-linecap="round"/></svg>',
    reports: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke-linecap="round"/></svg>',
    activity: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>',
    settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
  };

  const MODULE_TITLES = {
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    patients: 'Patients',
    packages: 'Packages & treatments',
    notifications: 'Notifications',
    reports: 'Reports',
    activity: 'Activity log',
    settings: 'Clinic settings',
  };

  const state = {
    module: 'dashboard',
    period: 'today',
    status: 'all',
    q: '',
    patientQ: '',
    patientId: null,
    patientTab: 'appointments',
    reportFrom: '',
    reportTo: '',
  };

  let staff = null;

  /* ---------- helpers ---------- */
  function toast(message) {
    let host = $('#toast');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast';
      host.setAttribute('role', 'status');
      host.style.cssText =
        'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:120;background:#0f3d2c;color:#fff;padding:.7rem 1.1rem;border-radius:999px;font-size:.88rem;box-shadow:0 12px 30px rgba(9,28,19,.35);max-width:92vw;text-align:center';
      document.body.appendChild(host);
    }
    host.textContent = message;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => host.remove(), 3000);
  }

  function badge(status) {
    return `<span class="badge badge-${esc(status)}">${esc(String(status).replace('-', ' '))}</span>`;
  }

  function patientOf(a) {
    return Store.patientById(a.patientId) || { name: 'Unknown patient', mobile: '' };
  }

  function treatmentOf(a) {
    return Store.treatmentById(a.treatmentId) || { name: 'Consultation', price: 0 };
  }

  function openModal(inner, setup) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${inner}</div>`;
    document.body.appendChild(wrap);
    document.body.classList.add('modal-open');
    const close = () => {
      wrap.remove();
      document.body.classList.remove('modal-open');
    };
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-close]')) close();
    });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
    if (setup) setup(wrap, close);
    return close;
  }

  function hasPerm(module) {
    return !!staff && ROLE[staff.role] && ROLE[staff.role].modules.includes(module);
  }

  function actor() {
    return staff ? `${staff.name} (${ROLE[staff.role].label})` : 'Staff';
  }

  function sortedAppointments(list) {
    return list.slice().sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  }

  function csvDownload(filename, rows) {
    const blob = new Blob([Store.csv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /* ---------- login / shell ---------- */
  function initLogin() {
    const roleSelect = $('#role');
    const email = $('#email');
    roleSelect.addEventListener('change', () => {
      email.value = ROLE[roleSelect.value].email;
    });
    $('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const role = roleSelect.value;
      const pass = $('#password').value;
      if (pass !== 'demo123') {
        $('#login-err').textContent = 'Wrong password. Use demo123 for this demo.';
        return;
      }
      const session = { type: 'staff', role, name: ROLE[role].person, email: email.value.trim() || ROLE[role].email };
      Store.setSession(session);
      start(session);
    });
  }

  function start(session) {
    staff = session;
    $('#admin-login').hidden = true;
    $('#admin-shell').hidden = false;
    $('#side-who').textContent = staff.name;
    $('#side-role').textContent = ROLE[staff.role].label;
    $('#admin-date').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    const nav = $('#admin-nav');
    nav.innerHTML = ROLE[staff.role].modules
      .map((m) => `<button type="button" data-module="${m}"><span class="nav-ico" aria-hidden="true">${ICON[m] || ''}</span>${esc(MODULE_TITLES[m])}</button>`)
      .join('');

    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-module]');
      if (!btn) return;
      go(btn.dataset.module);
      $('#admin-side').classList.remove('is-open');
    });

    $('#menu-toggle').addEventListener('click', () => $('#admin-side').classList.toggle('is-open'));
    $('#logout').addEventListener('click', () => {
      Store.clearSession();
      location.href = 'admin.html';
    });

    $('#admin-content').addEventListener('click', onClick);
    $('#admin-content').addEventListener('input', onInput);
    $('#admin-content').addEventListener('change', onChange);
    $('#admin-content').addEventListener('submit', onSubmit);

    const fromHash = (location.hash || '').replace('#', '');
    go(hasPerm(fromHash) ? fromHash : 'dashboard');
    window.addEventListener('hashchange', () => {
      const m = (location.hash || '').replace('#', '');
      if (hasPerm(m) && m !== state.module) go(m, true);
    });
  }

  function go(module, fromHash) {
    if (!hasPerm(module)) module = 'dashboard';
    state.module = module;
    if (!fromHash) {
      if (location.hash !== '#' + module) location.hash = module;
    }
    $$('#admin-nav button').forEach((b) => b.classList.toggle('is-active', b.dataset.module === module));
    $('#admin-title').textContent = MODULE_TITLES[module];
    render();
    window.scrollTo({ top: 0 });
  }

  /* ---------- renderer ---------- */
  function render() {
    switch (state.module) {
      case 'dashboard': return renderDashboard();
      case 'appointments': return renderAppointments();
      case 'patients': return renderPatients();
      case 'packages': return renderPackages();
      case 'notifications': return renderNotifications();
      case 'reports': return renderReports();
      case 'activity': return renderActivity();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  }

  function renderDashboard() {
    const s = Store.stats();
    const today = Store.todayISO();
    const todays = sortedAppointments(Store.db().appointments.filter((a) => a.date === today));
    const activity = Store.auditLog().slice(0, 6);
    $('#admin-content').innerHTML = `
      <div class="kpi-grid">
        <div class="kpi"><span>Today</span><strong>${s.todayTotal}</strong><small>appointments</small></div>
        <div class="kpi"><span>Confirmed</span><strong>${s.todayConfirmed}</strong><small>still to arrive</small></div>
        <div class="kpi"><span>Completed</span><strong>${s.todayCompleted}</strong><small>today</small></div>
        <div class="kpi"><span>No-shows</span><strong>${s.todayNoShow}</strong><small>today</small></div>
        <div class="kpi"><span>Patients</span><strong>${s.totalPatients}</strong><small>records total</small></div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h2>Today’s schedule</h2>
          <div style="display:flex;gap:.5rem;align-items:center">
            <span class="muted">${esc(Store.fmtLongDate(today))}</span>
            <button class="btn btn-primary btn-sm" type="button" data-action="new-appointment">+ New appointment</button>
          </div>
        </div>
        ${
          todays.length
            ? `<div class="schedule">${todays
                .map((a) => {
                  const p = patientOf(a);
                  const t = treatmentOf(a);
                  return `<div class="sched-row">
                    <span class="time">${esc(Store.fmtTime(a.time))}</span>
                    <span class="who">${esc(p.name)}<small>${esc(t.name)} · ${esc(a.bookingId)}</small></span>
                    <span style="display:flex;gap:.35rem;align-items:center">
                      ${badge(a.status)}
                      ${a.status === 'confirmed' ? `<button class="tiny-btn" type="button" data-action="complete" data-id="${a.id}">Mark done</button>` : ''}
                    </span>
                  </div>`;
                })
                .join('')}</div>`
            : '<div class="empty-state"><strong>No appointments today</strong>New online bookings will appear here.</div>'
        }
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.2rem">
        <div class="panel">
          <div class="panel-head"><h2>Quick actions</h2></div>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem">
            <button class="btn btn-primary btn-sm" type="button" data-action="new-appointment">New appointment</button>
            <button class="btn btn-ghost btn-sm" type="button" data-action="goto-appointments">Appointment list</button>
            <button class="btn btn-ghost btn-sm" type="button" data-action="goto-patients">Find patient</button>
            ${hasPerm('packages') ? '<button class="btn btn-ghost btn-sm" type="button" data-action="goto-packages">Manage packages</button>' : ''}
          </div>
          <div class="stat-inline mt-2">
            <div><b>${s.noShowRate}%</b><span>no-show rate (30 days)</span></div>
            <div><b>${s.rangeTotal}</b><span>bookings (30 days)</span></div>
            <div><b>${s.totalRecords}</b><span>health records</span></div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Recent activity</h2></div>
          <ul class="activity">
            ${activity.map((a) => `<li><strong>${esc(a.actor)}</strong> · ${esc(a.action)}<time>${esc(a.at)} — ${esc(a.detail || '')}</time></li>`).join('')}
          </ul>
        </div>
      </div>`;
  }

  /* ---------- appointments ---------- */
  function filteredAppointments() {
    const today = Store.todayISO();
    let list = Store.db().appointments.slice();
    if (state.period === 'today') list = list.filter((a) => a.date === today);
    else if (state.period === 'upcoming') list = list.filter((a) => a.date >= today);
    else if (state.period === 'past') list = list.filter((a) => a.date < today);
    if (state.status !== 'all') list = list.filter((a) => a.status === state.status);
    if (state.q.trim()) {
      const q = state.q.trim().toLowerCase();
      list = list.filter((a) => {
        const p = patientOf(a);
        return p.name.toLowerCase().includes(q) || p.mobile.includes(q) || a.bookingId.toLowerCase().includes(q);
      });
    }
    return sortedAppointments(list);
  }

  function apptRows(list) {
    if (!list.length) {
      return '<tr><td colspan="6" style="text-align:center;padding:1.6rem;color:var(--muted)">No appointments match these filters.</td></tr>';
    }
    return list
      .map((a) => {
        const p = patientOf(a);
        const t = treatmentOf(a);
        return `<tr>
          <td><strong>${esc(Store.fmtDate(a.date))}</strong><span class="sub">${esc(Store.fmtTime(a.time))}</span></td>
          <td>${esc(p.name)}<span class="sub">${esc(Store.masks(p.mobile))}</span></td>
          <td>${esc(t.name)}<span class="sub">${esc(a.bookingId)} · ${esc(a.source)}</span></td>
          <td>${badge(a.status)}</td>
          <td class="nowrap">${esc(a.notes || '—')}</td>
          <td>
            <div class="row-actions">
              ${a.status === 'confirmed' ? `<button class="tiny-btn" type="button" data-action="complete" data-id="${a.id}">Done</button>` : ''}
              ${a.status === 'confirmed' ? `<button class="tiny-btn" type="button" data-action="noshow" data-id="${a.id}">No-show</button>` : ''}
              ${a.status !== 'cancelled' ? `<button class="tiny-btn" type="button" data-action="reschedule" data-id="${a.id}">Move</button>` : ''}
              ${a.status !== 'cancelled' ? `<button class="tiny-btn danger" type="button" data-action="cancel" data-id="${a.id}">Cancel</button>` : ''}
            </div>
          </td>
        </tr>`;
      })
      .join('');
  }

  function renderAppointments() {
    const list = filteredAppointments();
    $('#admin-content').innerHTML = `
      <div class="panel">
        <div class="toolbar">
          <div class="field">
            <label for="f-period">Show</label>
            <select class="select" id="f-period">
              <option value="today"${state.period === 'today' ? ' selected' : ''}>Today</option>
              <option value="upcoming"${state.period === 'upcoming' ? ' selected' : ''}>Upcoming</option>
              <option value="past"${state.period === 'past' ? ' selected' : ''}>Past</option>
              <option value="all"${state.period === 'all' ? ' selected' : ''}>All dates</option>
            </select>
          </div>
          <div class="field">
            <label for="f-status">Status</label>
            <select class="select" id="f-status">
              ${['all', 'confirmed', 'completed', 'cancelled', 'no-show'].map((s) => `<option value="${s}"${state.status === s ? ' selected' : ''}>${s === 'all' ? 'All statuses' : s.replace('-', ' ')}</option>`).join('')}
            </select>
          </div>
          <div class="field grow">
            <label for="f-q">Search</label>
            <input class="input" id="f-q" value="${esc(state.q)}" placeholder="Patient name, mobile or booking ID">
          </div>
          <button class="btn btn-primary btn-sm" type="button" data-action="new-appointment" style="min-height:42px">+ New appointment</button>
        </div>
        <p class="muted" style="font-size:.82rem;margin-top:0">${list.length} appointment${list.length === 1 ? '' : 's'} shown · staff can book even inside the 2-hour online cutoff.</p>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Date &amp; time</th><th>Patient</th><th>Service</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody id="appt-rows">${apptRows(list)}</tbody>
          </table>
        </div>
      </div>`;
  }

  /* ---------- patients ---------- */
  function renderPatients() {
    if (state.patientId) return renderPatientDetail();

    const q = state.patientQ.trim().toLowerCase();
    const list = Store.patients()
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.mobile.includes(q) || p.id.includes(q))
      .sort((a, b) => (a.name > b.name ? 1 : -1));

    $('#admin-content').innerHTML = `
      <div class="panel">
        <div class="toolbar">
          <div class="field grow">
            <label for="p-q">Search patients</label>
            <input class="input" id="p-q" value="${esc(state.patientQ)}" placeholder="Name, mobile or patient ID">
          </div>
          <button class="btn btn-primary btn-sm" type="button" data-action="new-appointment" style="min-height:42px">+ New appointment</button>
        </div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Patient</th><th>Mobile</th><th>Visits</th><th>Last visit</th><th>Health records</th><th></th></tr></thead>
            <tbody>
              ${
                list.length
                  ? list
                      .map((p) => {
                        const appts = Store.appointmentsFor(p.id);
                        const past = appts.filter((a) => a.status === 'completed').sort((a, b) => (a.date < b.date ? 1 : -1));
                        return `<tr>
                          <td><strong>${esc(p.name)}</strong><span class="sub">${esc(p.id.toUpperCase())} · ${esc(p.gender || '—')}</span></td>
                          <td>${esc(Store.masks(p.mobile))}</td>
                          <td>${appts.length}</td>
                          <td>${past.length ? esc(Store.fmtDate(past[0].date)) : '—'}</td>
                          <td>${Store.recordsFor(p.id).length}</td>
                          <td><button class="tiny-btn" type="button" data-action="open-patient" data-id="${p.id}">Open 360°</button></td>
                        </tr>`;
                      })
                      .join('')
                  : '<tr><td colspan="6" style="text-align:center;padding:1.6rem;color:var(--muted)">No patients match this search.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function renderPatientDetail() {
    const p = Store.patientById(state.patientId);
    if (!p) {
      state.patientId = null;
      return renderPatients();
    }
    const appts = Store.appointmentsFor(p.id);
    const records = Store.recordsFor(p.id);
    const completed = appts.filter((a) => a.status === 'completed').length;
    const noShows = appts.filter((a) => a.status === 'no-show').length;

    $('#admin-content').innerHTML = `
      <button class="btn btn-ghost btn-sm" type="button" data-action="back-patients">← All patients</button>
      <div class="panel mt-2">
        <div class="panel-head">
          <div>
            <h2 style="font-size:1.4rem">${esc(p.name)}</h2>
            <span class="muted">${esc(p.id.toUpperCase())} · ${esc(Store.masks(p.mobile))} · ${esc(p.gender || 'Gender not recorded')}${p.dob ? ' · born ' + esc(Store.fmtDate(p.dob, { day: 'numeric', month: 'short', year: 'numeric' })) : ''}</span>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            ${hasPerm('patients') && (staff.role === 'doctor' || staff.role === 'admin') ? '<button class="btn btn-primary btn-sm" type="button" data-action="add-record" data-id="' + p.id + '">+ Health record</button>' : ''}
          </div>
        </div>
        <div class="stat-inline">
          <div><b>${appts.length}</b><span>appointments</span></div>
          <div><b>${completed}</b><span>completed</span></div>
          <div><b>${noShows}</b><span>no-shows</span></div>
          <div><b>${records.length}</b><span>health records</span></div>
        </div>
        <p class="mt-2 mb-0" style="font-size:.88rem"><strong>Contact:</strong> ${esc(p.email || '—')} · ${esc(p.address || 'Address not recorded')}</p>
      </div>

      <div class="panel">
        <div class="drawer-tabs">
          <button type="button" data-action="patient-tab" data-tab="appointments" class="${state.patientTab === 'appointments' ? 'is-active' : ''}">Appointments</button>
          <button type="button" data-action="patient-tab" data-tab="records" class="${state.patientTab === 'records' ? 'is-active' : ''}">Health records</button>
        </div>
        ${
          state.patientTab === 'appointments'
            ? `<div class="table-wrap"><table class="data">
                <thead><tr><th>Date &amp; time</th><th>Service</th><th>Doctor</th><th>Status</th><th>Source</th></tr></thead>
                <tbody>${appts
                  .map(
                    (a) => `<tr>
                      <td><strong>${esc(Store.fmtDate(a.date))}</strong><span class="sub">${esc(Store.fmtTime(a.time))}</span></td>
                      <td>${esc(treatmentOf(a).name)}<span class="sub">${esc(a.bookingId)}</span></td>
                      <td>${esc(Store.doctor().name)}</td>
                      <td>${badge(a.status)}</td>
                      <td>${esc(a.source)}</td>
                    </tr>`
                  )
                  .join('') || '<tr><td colspan="5" style="text-align:center;padding:1.4rem;color:var(--muted)">No appointments yet.</td></tr>'}</tbody>
              </table></div>`
            : records.length
            ? records.map(recordCard).join('')
            : '<div class="empty-state"><strong>No health records</strong>Doctors can add consultation notes from here.</div>'
        }
      </div>`;
  }

  function recordCard(r) {
    return `<article class="record">
      <div class="record-head">
        <h3>${esc(Store.fmtDate(r.date, { day: 'numeric', month: 'long', year: 'numeric' }))}</h3>
        <span style="display:flex;gap:.4rem;align-items:center">
          <span class="badge ${r.shared ? 'badge-confirmed' : 'badge-pending'}">${r.shared ? 'shared with patient' : 'internal only'}</span>
        </span>
      </div>
      <dl>
        ${r.complaint ? `<dt>Complaint</dt><dd>${esc(r.complaint)}</dd>` : ''}
        ${r.diagnosis ? `<dt>Diagnosis</dt><dd>${esc(r.diagnosis)}</dd>` : ''}
        ${r.prakriti ? `<dt>Prakriti</dt><dd>${esc(r.prakriti)}</dd>` : ''}
        ${r.allergies ? `<dt>Allergies</dt><dd>${esc(r.allergies)}</dd>` : ''}
        ${r.medications ? `<dt>Medication</dt><dd>${esc(r.medications)}</dd>` : ''}
        ${r.notes ? `<dt>Notes</dt><dd>${esc(r.notes)}</dd>` : ''}
      </dl>
    </article>`;
  }

  /* ---------- packages ---------- */
  function renderPackages() {
    const list = Store.treatments();
    $('#admin-content').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h2>Treatments &amp; packages</h2>
          <span class="muted">Published items appear on the public website immediately.</span>
        </div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Name</th><th>Category</th><th>Sessions</th><th>Duration</th><th>Price</th><th>Website</th><th></th></tr></thead>
            <tbody>
              ${list
                .map(
                  (t) => `<tr>
                    <td><strong>${esc(t.name)}</strong><span class="sub">${esc(t.summary)}</span></td>
                    <td>${esc(t.category)}</td>
                    <td>${t.sessions}</td>
                    <td>${t.duration} min</td>
                    <td>${Store.money(t.price)}</td>
                    <td>${t.published ? '<span class="badge badge-confirmed">published</span>' : '<span class="badge badge-pending">hidden</span>'}</td>
                    <td><div class="row-actions">
                      <button class="tiny-btn" type="button" data-action="edit-package" data-id="${t.id}">Edit</button>
                      <button class="tiny-btn ${t.published ? 'danger' : ''}" type="button" data-action="toggle-package" data-id="${t.id}">${t.published ? 'Unpublish' : 'Publish'}</button>
                    </div></td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
        <p class="form-note mt-2">Unpublished treatments disappear from the website but stay visible here.</p>
      </div>`;
  }

  /* ---------- notifications ---------- */
  function renderNotifications() {
    const list = Store.notifications();
    const failed = list.filter((n) => n.status === 'failed').length;
    $('#admin-content').innerHTML = `
      <div class="kpi-grid">
        <div class="kpi"><span>Messages</span><strong>${list.length}</strong><small>in the log</small></div>
        <div class="kpi"><span>Delivered</span><strong>${list.length - failed}</strong><small>WhatsApp / SMS</small></div>
        <div class="kpi"><span>Failed</span><strong>${failed}</strong><small>need a resend</small></div>
        <div class="kpi"><span>Provider</span><strong style="font-size:1.1rem;line-height:2.4">Simulated</strong><small>no provider connected</small></div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <h2>Delivery log</h2>
          <span class="muted">Confirmation is sent on booking; reminders are not scheduled in the demo.</span>
        </div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Sent</th><th>Channel</th><th>To</th><th>Template</th><th>Status</th><th>Message</th><th></th></tr></thead>
            <tbody>
              ${list
                .map(
                  (n) => `<tr>
                    <td class="nowrap">${esc(n.sentAt)}</td>
                    <td>${esc(n.channel)}</td>
                    <td>${esc(Store.masks(n.to))}</td>
                    <td>${esc(n.template)}</td>
                    <td>${badge(n.status)}</td>
                    <td style="max-width:320px">${esc(n.preview)}</td>
                    <td><button class="tiny-btn" type="button" data-action="resend" data-id="${n.id}">Resend</button></td>
                  </tr>`
                )
                .join('') || '<tr><td colspan="7" style="text-align:center;padding:1.4rem;color:var(--muted)">No messages yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Templates</h2><span class="muted">WhatsApp first, SMS as fallback once a provider is connected.</span></div>
        <div class="record"><h3 style="font-size:1rem">booking_confirmed</h3><p class="muted mb-0">Namaste {name}, your {service} is confirmed for {date} at {time} with {doctor}. {clinic}, {address}.</p></div>
        <div class="record"><h3 style="font-size:1rem">booking_cancelled</h3><p class="muted mb-0">Namaste {name}, your appointment on {date} at {time} has been cancelled. Call {phone} to rebook.</p></div>
        <div class="record"><h3 style="font-size:1rem">reminder_24h / reminder_2h</h3><p class="muted mb-0">Reminder: {service} with {doctor} on {date} at {time}. Reply HELP for support.</p></div>
      </div>`;
  }

  /* ---------- reports ---------- */
  function reportRange() {
    const to = state.reportTo || Store.todayISO();
    const from = state.reportFrom || Store.iso(Store.addDays(new Date(to + 'T00:00:00'), -29));
    return { from, to };
  }

  function renderReports() {
    const { from, to } = reportRange();
    const all = Store.db().appointments.filter((a) => a.date >= from && a.date <= to);
    const count = (s) => all.filter((a) => a.status === s).length;
    const completed = count('completed');
    const noShow = count('no-show');
    const rate = completed + noShow ? Math.round((noShow / (completed + noShow)) * 100) : 0;
    const byTreatment = {};
    all.forEach((a) => {
      const name = treatmentOf(a).name;
      byTreatment[name] = (byTreatment[name] || 0) + 1;
    });
    const top = Object.entries(byTreatment).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = top.length ? top[0][1] : 1;

    $('#admin-content').innerHTML = `
      <div class="panel">
        <div class="toolbar">
          <div class="field"><label for="r-from">From</label><input class="input" type="date" id="r-from" value="${from}"></div>
          <div class="field"><label for="r-to">To</label><input class="input" type="date" id="r-to" value="${to}"></div>
          <button class="btn btn-ghost btn-sm" type="button" data-action="export-csv" style="min-height:42px">Export CSV</button>
        </div>
        <div class="stat-inline">
          <div><b>${all.length}</b><span>appointments</span></div>
          <div><b>${completed}</b><span>completed</span></div>
          <div><b>${count('cancelled')}</b><span>cancelled</span></div>
          <div><b>${noShow}</b><span>no-shows</span></div>
          <div><b>${rate}%</b><span>no-show rate</span></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Most booked treatments</h2><span class="muted">${esc(from)} → ${esc(to)}</span></div>
        <div class="bar-list">
          ${
            top.length
              ? top
                  .map(
                    ([name, n]) => `<div class="bar-row">
                      <span>${esc(name)}</span>
                      <span class="bar-track"><span class="bar-fill" style="width:${Math.round((n / max) * 100)}%"></span></span>
                      <strong>${n}</strong>
                    </div>`
                  )
                  .join('')
              : '<p class="muted">No bookings in this range.</p>'
          }
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Appointments in range</h2><span class="muted">${all.length} rows</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Service</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>${sortedAppointments(all)
              .map(
                (a) => `<tr>
                  <td>${esc(Store.fmtDate(a.date))}</td>
                  <td>${esc(Store.fmtTime(a.time))}</td>
                  <td>${esc(patientOf(a).name)}</td>
                  <td>${esc(treatmentOf(a).name)}</td>
                  <td>${badge(a.status)}</td>
                  <td>${esc(a.source)}</td>
                </tr>`
              )
              .join('') || '<tr><td colspan="6" style="text-align:center;padding:1.4rem;color:var(--muted)">No appointments in this range.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
  }

  /* ---------- activity ---------- */
  function renderActivity() {
    const log = Store.auditLog();
    $('#admin-content').innerHTML = `
      <div class="panel">
        <div class="panel-head"><h2>Activity log</h2><span class="muted">Latest ${log.length} entries · newest first</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Reference</th><th>Detail</th></tr></thead>
            <tbody>${log
              .map(
                (a) => `<tr>
                  <td class="nowrap">${esc(a.at)}</td>
                  <td>${esc(a.actor)}</td>
                  <td>${esc(a.action)}</td>
                  <td>${esc(a.entity)}</td>
                  <td>${esc(a.detail || '')}</td>
                </tr>`
              )
              .join('')}</tbody>
          </table>
        </div>
      </div>`;
  }

  /* ---------- settings ---------- */
  function renderSettings() {
    const s = Store.settings();
    $('#admin-content').innerHTML = `
      <div class="panel" style="max-width:760px">
        <div class="panel-head"><h2>Clinic profile</h2><span class="muted">Shown across the website and confirmation messages.</span></div>
        <form id="settings-form">
          <div class="form-grid">
            <div class="field"><label for="s-name">Clinic name</label><input class="input" id="s-name" value="${esc(s.name)}"></div>
            <div class="field"><label for="s-phone">Phone</label><input class="input" id="s-phone" value="${esc(s.phone)}" placeholder="To be added"></div>
            <div class="field full"><label for="s-address">Address</label><input class="input" id="s-address" value="${esc(s.address)}" placeholder="To be added"></div>
            <div class="field"><label for="s-email">Email</label><input class="input" id="s-email" type="email" value="${esc(s.email)}" placeholder="To be added"></div>
            <div class="field"><label for="s-cancel">Cancellation policy</label><input class="input" id="s-cancel" value="${esc(s.cancelPolicy)}"></div>
          </div>
          <div class="alert alert-info">
            Hours <strong>${esc(Store.fmtTime(s.open))} – ${esc(Store.fmtTime(s.close))}</strong>, ${s.slotMinutes}-minute slots, online booking closes ${s.leadTimeHours} hours before a slot. These are fixed for the demo.
          </div>
          <button class="btn btn-primary" type="submit">Save settings</button>
        </form>
      </div>

      <div class="panel" style="max-width:760px">
        <div class="panel-head"><h2>Launch checklist</h2></div>
        <div class="status-line"><span class="ok">✓</span> One doctor configured</div>
        <div class="status-line"><span class="ok">✓</span> 10:00 AM – 8:00 PM, 30-minute slots</div>
        <div class="status-line"><span class="todo">•</span> Final clinic name, logo, address and phone</div>
        <div class="status-line"><span class="todo">•</span> Weekly off, lunch break and holidays</div>
        <div class="status-line"><span class="todo">•</span> Cancellation fees and no-show rules</div>
        <div class="status-line"><span class="todo">•</span> WhatsApp / SMS provider and business number</div>
      </div>

      <div class="panel" style="max-width:760px">
        <div class="panel-head"><h2>Demo data</h2></div>
        <p class="muted" style="font-size:.88rem">Everything in this demo is stored in this browser only. Resetting restores the sample patients and appointments.</p>
        <button class="btn btn-danger btn-sm" type="button" data-action="reset-demo">Reset demo data</button>
      </div>`;
  }

  /* ---------- events ---------- */
  function onClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'new-appointment') return newAppointmentModal();
    if (action === 'goto-appointments') return go('appointments');
    if (action === 'goto-patients') return go('patients');
    if (action === 'goto-packages') return go('packages');
    if (action === 'complete') {
      Store.setStatus(id, 'completed', actor());
      toast('Appointment marked completed.');
      return render();
    }
    if (action === 'noshow') {
      Store.setStatus(id, 'no-show', actor());
      toast('Appointment marked no-show.');
      return render();
    }
    if (action === 'cancel') {
      const a = Store.appointmentById(id);
      if (!a) return;
      if (confirm(`Cancel ${a.bookingId} for ${patientOf(a).name}? The patient will be notified by phone.`)) {
        Store.cancel(id, actor(), 'Cancelled by clinic');
        toast('Appointment cancelled and slot released.');
        render();
      }
      return;
    }
    if (action === 'reschedule') return rescheduleModal(id);
    if (action === 'open-patient') {
      state.patientId = id;
      state.patientTab = 'appointments';
      return render();
    }
    if (action === 'back-patients') {
      state.patientId = null;
      return render();
    }
    if (action === 'patient-tab') {
      state.patientTab = btn.dataset.tab;
      return render();
    }
    if (action === 'add-record') return healthRecordModal(id);
    if (action === 'edit-package') return packageModal(id);
    if (action === 'toggle-package') {
      const t = Store.treatmentById(id);
      if (!t) return;
      Store.updateTreatment(id, { published: !t.published });
      Store.audit(actor(), t.published ? 'Package unpublished' : 'Package published', t.name, '');
      toast(t.published ? 'Removed from the public website.' : 'Published on the public website.');
      return render();
    }
    if (action === 'resend') {
      Store.resendNotification(id);
      toast('Message resent (simulated delivery).');
      return render();
    }
    if (action === 'export-csv') {
      const { from, to } = reportRange();
      const rows = [['Date', 'Time', 'Booking ID', 'Patient', 'Mobile', 'Service', 'Status', 'Source']];
      Store.db()
        .appointments.filter((a) => a.date >= from && a.date <= to)
        .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1))
        .forEach((a) => {
          const p = patientOf(a);
          rows.push([a.date, a.time, a.bookingId, p.name, p.mobile, treatmentOf(a).name, a.status, a.source]);
        });
      csvDownload(`appointments-${from}-to-${to}.csv`, rows);
      toast('CSV exported.');
      return;
    }
    if (action === 'reset-demo') {
      if (confirm('Reset all demo data? This clears bookings you made in this browser.')) {
        Store.reset();
        toast('Demo data reset.');
        setTimeout(() => location.reload(), 600);
      }
    }
  }

  function onInput(e) {
    if (e.target.id === 'f-q') {
      state.q = e.target.value;
      $('#appt-rows').innerHTML = apptRows(filteredAppointments());
    }
    if (e.target.id === 'p-q') {
      state.patientQ = e.target.value;
      const table = $('#admin-content table.data');
      if (!table) return;
      const q = state.patientQ.trim().toLowerCase();
      const list = Store.patients().filter((p) => !q || p.name.toLowerCase().includes(q) || p.mobile.includes(q) || p.id.includes(q));
      const tbody = $('tbody', table);
      if (tbody) {
        tbody.innerHTML = list.length
          ? list
              .map((p) => {
                const appts = Store.appointmentsFor(p.id);
                const past = appts.filter((a) => a.status === 'completed').sort((a, b) => (a.date < b.date ? 1 : -1));
                return `<tr>
                  <td><strong>${esc(p.name)}</strong><span class="sub">${esc(p.id.toUpperCase())} · ${esc(p.gender || '—')}</span></td>
                  <td>${esc(Store.masks(p.mobile))}</td>
                  <td>${appts.length}</td>
                  <td>${past.length ? esc(Store.fmtDate(past[0].date)) : '—'}</td>
                  <td>${Store.recordsFor(p.id).length}</td>
                  <td><button class="tiny-btn" type="button" data-action="open-patient" data-id="${p.id}">Open 360°</button></td>
                </tr>`;
              })
              .join('')
          : '<tr><td colspan="6" style="text-align:center;padding:1.6rem;color:var(--muted)">No patients match this search.</td></tr>';
      }
    }
  }

  function onChange(e) {
    if (e.target.id === 'f-period') {
      state.period = e.target.value;
      renderAppointments();
    }
    if (e.target.id === 'f-status') {
      state.status = e.target.value;
      renderAppointments();
    }
    if (e.target.id === 'r-from' || e.target.id === 'r-to') {
      const from = $('#r-from').value;
      const to = $('#r-to').value;
      if (from && to && from <= to) {
        state.reportFrom = from;
        state.reportTo = to;
        renderReports();
      }
    }
  }

  function onSubmit(e) {
    if (e.target.id === 'settings-form') {
      e.preventDefault();
      Store.updateSettings({
        name: $('#s-name').value.trim() || 'Ayurved Clinic',
        phone: $('#s-phone').value.trim(),
        address: $('#s-address').value.trim(),
        email: $('#s-email').value.trim(),
        cancelPolicy: $('#s-cancel').value.trim(),
      });
      Store.audit(actor(), 'Clinic settings updated', 'Settings', 'Profile and cancellation policy');
      toast('Settings saved.');
      render();
    }
  }

  /* ---------- modals ---------- */
  function timeOptions(date, excludeId) {
    return Store.slots()
      .filter((t) => {
        const taken = Store.appointmentAt(date, t);
        if (taken && taken.id !== excludeId) return false;
        if (date === Store.todayISO()) {
          const [h, m] = t.split(':').map(Number);
          const now = new Date();
          if (h * 60 + m < now.getHours() * 60 + now.getMinutes()) return false;
        }
        return true;
      })
      .map((t) => `<option value="${t}">${esc(Store.fmtTime(t))}</option>`)
      .join('');
  }

  function newAppointmentModal() {
    const today = Store.todayISO();
    const max = Store.iso(Store.addDays(new Date(), 30));
    const treatments = Store.treatments(true);
    const services = treatments.length ? treatments : Store.treatments();
    openModal(
      `<h2>New appointment</h2>
       <p class="muted" style="font-size:.86rem;margin-top:0">Walk-in, phone booking or staff reschedule. No online payment is recorded.</p>
       <div class="form-grid">
         <div class="field"><label for="na-mobile">Patient mobile *</label><input class="input" id="na-mobile" inputmode="numeric" maxlength="10" placeholder="98765 43210"><span class="hint">Existing patients are matched automatically.</span></div>
         <div class="field"><label for="na-name">Patient name *</label><input class="input" id="na-name" placeholder="Full name"></div>
         <div class="field"><label for="na-treatment">Service</label>
           <select class="select" id="na-treatment">${services.map((t) => `<option value="${t.id}">${esc(t.name)} · ${Store.money(t.price)}</option>`).join('')}</select>
         </div>
         <div class="field"><label for="na-source">Booking source</label>
           <select class="select" id="na-source"><option value="walk-in">Walk-in</option><option value="phone">Phone</option><option value="website">Website</option></select>
         </div>
         <div class="field"><label for="na-date">Date</label><input class="input" type="date" id="na-date" min="${today}" max="${max}" value="${today}"></div>
         <div class="field"><label for="na-time">Time</label><select class="select" id="na-time">${timeOptions(today)}</select></div>
       </div>
       <p class="field-error" id="na-err"></p>
       <div class="modal-actions"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="na-save">Create appointment</button></div>`,
      (wrap, close) => {
        const mobile = $('#na-mobile', wrap);
        const name = $('#na-name', wrap);
        const date = $('#na-date', wrap);
        const time = $('#na-time', wrap);
        mobile.addEventListener('input', () => {
          mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10);
          const existing = mobile.value.length === 10 ? Store.findPatientByMobile(mobile.value) : null;
          if (existing) {
            name.value = existing.name;
            name.readOnly = true;
          } else {
            name.readOnly = false;
          }
        });
        date.addEventListener('change', () => {
          time.innerHTML = timeOptions(date.value);
        });
        $('#na-save', wrap).addEventListener('click', () => {
          const err = $('#na-err', wrap);
          if (!/^[6-9]\d{9}$/.test(mobile.value)) {
            err.textContent = 'Enter a valid 10-digit mobile number.';
            return;
          }
          if (name.value.trim().length < 2) {
            err.textContent = 'Enter the patient name.';
            return;
          }
          if (!date.value || !time.value) {
            err.textContent = 'Choose a date and time.';
            return;
          }
          let patient = Store.findPatientByMobile(mobile.value);
          if (!patient) patient = Store.createPatient({ name: name.value.trim(), mobile: mobile.value });
          const result = Store.book({
            patientId: patient.id,
            treatmentId: $('#na-treatment', wrap).value,
            date: date.value,
            time: time.value,
            source: $('#na-source', wrap).value,
            force: true,
            actor: actor(),
          });
          if (!result.ok) {
            err.textContent = result.error;
            return;
          }
          close();
          toast('Appointment created: ' + result.appointment.bookingId);
          render();
        });
      }
    );
  }

  function rescheduleModal(id) {
    const a = Store.appointmentById(id);
    if (!a) return;
    const today = Store.todayISO();
    const max = Store.iso(Store.addDays(new Date(), 30));
    openModal(
      `<h2>Move appointment</h2>
       <p class="muted" style="font-size:.88rem;margin-top:0">${esc(patientOf(a).name)} · ${esc(a.bookingId)} · currently ${esc(Store.fmtDate(a.date))} at ${esc(Store.fmtTime(a.time))}</p>
       <div class="form-grid">
         <div class="field"><label for="mv-date">New date</label><input class="input" type="date" id="mv-date" min="${today}" max="${max}" value="${a.date}"></div>
         <div class="field"><label for="mv-time">New time</label><select class="select" id="mv-time">${timeOptions(a.date, a.id)}</select></div>
       </div>
       <p class="field-error" id="mv-err"></p>
       <div class="modal-actions"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="mv-save">Move appointment</button></div>`,
      (wrap, close) => {
        const date = $('#mv-date', wrap);
        const time = $('#mv-time', wrap);
        date.addEventListener('change', () => {
          time.innerHTML = timeOptions(date.value, a.id);
        });
        $('#mv-save', wrap).addEventListener('click', () => {
          if (!date.value || !time.value) {
            $('#mv-err', wrap).textContent = 'Choose a new date and time.';
            return;
          }
          const res = Store.reschedule(a.id, date.value, time.value, actor());
          if (!res.ok) {
            $('#mv-err', wrap).textContent = res.error;
            return;
          }
          close();
          toast('Appointment moved.');
          render();
        });
      }
    );
  }

  function healthRecordModal(patientId) {
    const p = Store.patientById(patientId);
    if (!p) return;
    openModal(
      `<h2>Add health record</h2>
       <p class="muted" style="font-size:.88rem;margin-top:0">${esc(p.name)} · ${esc(p.id.toUpperCase())}</p>
       <div class="form-grid">
         <div class="field full"><label for="hr-complaint">Chief complaint</label><input class="input" id="hr-complaint" placeholder="e.g. bloating after meals"></div>
         <div class="field full"><label for="hr-diagnosis">Diagnosis / assessment</label><input class="input" id="hr-diagnosis"></div>
         <div class="field"><label for="hr-prakriti">Prakriti</label><input class="input" id="hr-prakriti" placeholder="Vata-Pitta"></div>
         <div class="field"><label for="hr-allergies">Allergies</label><input class="input" id="hr-allergies"></div>
         <div class="field full"><label for="hr-medications">Prescription</label><input class="input" id="hr-medications"></div>
         <div class="field full"><label for="hr-notes">Notes / advice</label><textarea class="textarea" id="hr-notes"></textarea></div>
       </div>
       <label class="check"><input type="checkbox" id="hr-shared" checked><span>Share this summary with the patient in their account</span></label>
       <p class="field-error" id="hr-err"></p>
       <div class="modal-actions"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="hr-save">Save record</button></div>`,
      (wrap, close) => {
        $('#hr-save', wrap).addEventListener('click', () => {
          const complaint = $('#hr-complaint', wrap).value.trim();
          if (!complaint) {
            $('#hr-err', wrap).textContent = 'A chief complaint is required.';
            return;
          }
          Store.addRecord(
            {
              patientId,
              complaint,
              diagnosis: $('#hr-diagnosis', wrap).value.trim(),
              prakriti: $('#hr-prakriti', wrap).value.trim(),
              allergies: $('#hr-allergies', wrap).value.trim(),
              medications: $('#hr-medications', wrap).value.trim(),
              notes: $('#hr-notes', wrap).value.trim(),
              shared: $('#hr-shared', wrap).checked,
            },
            actor()
          );
          close();
          toast('Health record saved.');
          render();
        });
      }
    );
  }

  function packageModal(id) {
    const t = Store.treatmentById(id);
    if (!t) return;
    openModal(
      `<h2>Edit ${esc(t.name)}</h2>
       <div class="form-grid">
         <div class="field full"><label for="pk-name">Name</label><input class="input" id="pk-name" value="${esc(t.name)}"></div>
         <div class="field"><label for="pk-price">Price (₹)</label><input class="input" id="pk-price" type="number" min="0" step="50" value="${t.price}"></div>
         <div class="field"><label for="pk-sessions">Sessions</label><input class="input" id="pk-sessions" type="number" min="1" max="60" value="${t.sessions}"></div>
         <div class="field full"><label for="pk-summary">Short description</label><input class="input" id="pk-summary" value="${esc(t.summary)}"></div>
       </div>
       <label class="check"><input type="checkbox" id="pk-published" ${t.published ? 'checked' : ''}><span>Published on the public website</span></label>
       <p class="field-error" id="pk-err"></p>
       <div class="modal-actions"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="pk-save">Save</button></div>`,
      (wrap, close) => {
        $('#pk-save', wrap).addEventListener('click', () => {
          const name = $('#pk-name', wrap).value.trim();
          const price = Number($('#pk-price', wrap).value);
          const sessions = Number($('#pk-sessions', wrap).value);
          if (!name) {
            $('#pk-err', wrap).textContent = 'Name is required.';
            return;
          }
          if (!Number.isFinite(price) || price < 0) {
            $('#pk-err', wrap).textContent = 'Enter a valid price.';
            return;
          }
          if (!Number.isFinite(sessions) || sessions < 1) {
            $('#pk-err', wrap).textContent = 'Sessions must be at least 1.';
            return;
          }
          Store.updateTreatment(id, {
            name,
            price,
            sessions,
            summary: $('#pk-summary', wrap).value.trim(),
            published: $('#pk-published', wrap).checked,
          });
          Store.audit(actor(), 'Package updated', name, `${Store.money(price)} · ${sessions} session(s)`);
          close();
          toast('Package updated.');
          render();
        });
      }
    );
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    const session = Store.staffSession();
    if (session && ROLE[session.role]) start(session);
  });
})();
