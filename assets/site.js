/* ==========================================================================
   Ayurved Clinic demo — public website
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const page = document.body.dataset.page || '';
  const esc = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICONS = {
    leaf: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 4C11 4 4 8.5 4 15a5 5 0 0 0 5 5c6.5 0 11-7 11-16Z" fill="currentColor" opacity=".9"/><path d="M4 20C8 14 12 11 17 9" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>',
    clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>',
    calendar: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18" stroke-linecap="round"/></svg>',
    phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" stroke-linejoin="round"/></svg>',
    pin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pulse: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 12h4l2-5 3 10 2-5h7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    leaf2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 4C11 4 4 8.5 4 15a5 5 0 0 0 5 5c6.5 0 11-7 11-16Z"/><path d="M4 20C8 14 12 11 17 9" stroke-linecap="round"/></svg>',
  };

  /* ---------- shared chrome ---------- */
  function renderHeader() {
    const host = $('#site-header');
    if (!host) return;
    const links = [
      ['index.html', 'Home'],
      ['treatments.html', 'Treatments'],
      ['packages.html', 'Packages'],
      ['doctors.html', 'Doctor'],
      ['contact.html', 'Contact'],
      ['account.html', 'My appointments'],
    ];
    const current = location.pathname.split('/').pop() || 'index.html';
    host.className = 'site-header';
    host.innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark" aria-hidden="true">${ICONS.leaf}</span>
          <span class="brand-text">
            <span class="brand-name">Ayurved Clinic</span>
            <span class="brand-sub">Ayurveda &amp; Panchakarma</span>
          </span>
        </a>
        <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Menu">
          <span></span>
        </button>
        <nav class="nav" id="primaryNav" aria-label="Primary">
          ${links.map(([href, text]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${text}</a>`).join('')}
          <a class="btn btn-primary btn-sm" href="book.html">Book appointment</a>
        </nav>
        <div class="header-actions">
          <a class="btn btn-primary btn-sm" href="book.html">Book appointment</a>
        </div>
      </div>`;
    const toggle = $('#navToggle');
    const nav = $('#primaryNav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function contactLine() {
    const s = Store.settings();
    if (s.phone) return `<a href="tel:${esc(s.phone.replace(/\s/g, ''))}">${esc(s.phone)}</a>`;
    return '<span class="placeholder-note">Phone number to be added</span>';
  }

  function renderFooter() {
    const host = $('#site-footer');
    if (!host) return;
    const s = Store.settings();
    host.className = 'site-footer';
    host.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="index.html">
              <span class="brand-mark" aria-hidden="true">${ICONS.leaf}</span>
              <span class="brand-text"><span class="brand-name">${esc(s.name)}</span><span class="brand-sub">Ayurveda &amp; Panchakarma</span></span>
            </a>
            <p class="mt-2" style="max-width:34ch">${esc(s.tagline)}. One doctor, unhurried consultations, and treatment plans built around your routine.</p>
            <p class="form-note">Demo build · logo, address and phone number will be added before launch.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="treatments.html">Treatments</a>
            <a href="packages.html">Packages</a>
            <a href="doctors.html">Doctor</a>
            <a href="book.html">Book appointment</a>
            <a href="account.html">My appointments</a>
          </div>
          <div>
            <h3>Visit</h3>
            <p style="margin:0 0 .4rem">${ICONS.clock} ${esc(s.hoursLabel || '10:00 AM – 8:00 PM')}</p>
            <p style="margin:0 0 .4rem">${ICONS.pin} ${s.address ? esc(s.address) : '<span class="placeholder-note">Address to be added</span>'}</p>
            <p style="margin:0 0 .4rem">${ICONS.phone} ${contactLine()}</p>
            <p class="form-note" style="margin-top:.6rem">Cancellation: call the clinic. Online cancellation is not available.</p>
          </div>
        </div>
        <div class="footer-note">
          <span>© ${new Date().getFullYear()} ${esc(s.name)}. Demo data only.</span>
          <span><a href="admin.html">Clinic staff login</a></span>
        </div>
      </div>`;
  }

  function hoursLabel() {
    const s = Store.settings();
    return `${Store.fmtTime(s.open)} – ${Store.fmtTime(s.close)}`;
  }

  function statusBadge(status) {
    const label = String(status || '').replace('-', ' ');
    return `<span class="badge badge-${esc(status)}">${esc(label)}</span>`;
  }

  function showToast(message) {
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
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => host.remove(), 3200);
  }

  /* ---------- home ---------- */
  function initHome() {
    const slotsHost = $('#next-slots');
    if (slotsHost) {
      const next = Store.nextAvailable(3);
      slotsHost.innerHTML = next.length
        ? next
            .map(
              (slot) => `
          <a class="mini-slot" href="book.html?date=${slot.date}&time=${encodeURIComponent(slot.time)}">
            <span><span class="d">${esc(Store.fmtDate(slot.date))}${slot.date === Store.todayISO() ? ' · Today' : ''}</span><br><span class="t">${esc(Store.fmtTime(slot.time))}</span></span>
            <span class="go">Select →</span>
          </a>`
            )
            .join('')
        : '<p class="form-note">No open slots in the next few days. Please call the clinic.</p>';
    }

    const grid = $('#featured-treatments');
    if (grid) {
      const list = Store.treatments(true).filter((t) => t.featured).slice(0, 4);
      grid.innerHTML = list.map(treatmentCard).join('');
    }

    const stats = $('#home-trust');
    if (stats) {
      const s = Store.settings();
      stats.innerHTML = `
        <div><strong>1</strong><span>Doctor at launch</span></div>
        <div><strong>30 min</strong><span>Slot duration</span></div>
        <div><strong>${esc(Store.fmtTime(s.open))}</strong><span>Doors open daily</span></div>`;
    }

    const doctorHost = $('#home-doctor');
    if (doctorHost) {
      const d = Store.doctor();
      doctorHost.innerHTML = `
        <div class="doctor-portrait" aria-hidden="true"><span class="monogram">MK</span></div>
        <div>
          <span class="tag">Your doctor</span>
          <h2 style="margin-bottom:.3rem">${esc(d.name)}</h2>
          <p class="muted mb-0">${esc(d.qualification)} · ${esc(d.experience)} of practice</p>
          <div class="doctor-facts">
            <span class="chip">${ICONS.clock} ${esc(hoursLabel())}</span>
            <span class="chip">${ICONS.calendar} All seven days</span>
          </div>
          <p>${esc(d.about)}</p>
          <a class="btn btn-outline" href="book.html">Book with ${esc(d.name.replace(/^Dr\.?\s*/, '').split(' ')[0])}</a>
        </div>`;
    }
  }

  function treatmentCard(t) {
    return `
      <article class="tcard">
        <span class="tag">${esc(t.category)}</span>
        <h3>${esc(t.name)}</h3>
        <p class="desc">${esc(t.summary)}</p>
        <div class="meta">
          <span>${ICONS.clock} ${t.duration} min</span>
          <span>${ICONS.calendar} ${t.sessions} session${t.sessions > 1 ? 's' : ''}</span>
        </div>
        <div class="tcard-foot">
          <span class="price">${Store.money(t.price)} <small>${t.sessions > 1 ? 'total' : 'per visit'}</small></span>
          <a class="btn btn-primary btn-sm" href="book.html?treatment=${encodeURIComponent(t.id)}">Book</a>
        </div>
      </article>`;
  }

  /* ---------- treatments ---------- */
  function initTreatments() {
    const grid = $('#treatment-grid');
    if (!grid) return;
    const pillsHost = $('#treatment-filters');
    const categories = ['All', ...Array.from(new Set(Store.treatments(true).map((t) => t.category)))];
    let active = 'All';
    const render = () => {
      const list = Store.treatments(true).filter((t) => active === 'All' || t.category === active);
      grid.innerHTML = list.map(treatmentCard).join('');
      $$('.pill', pillsHost).forEach((b) => b.classList.toggle('is-active', b.dataset.cat === active));
    };
    pillsHost.innerHTML = categories
      .map((c) => `<button class="pill${c === 'All' ? ' is-active' : ''}" data-cat="${esc(c)}" type="button">${esc(c)}</button>`)
      .join('');
    pillsHost.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      active = btn.dataset.cat;
      render();
    });
    render();
  }

  /* ---------- packages ---------- */
  function initPackages() {
    const grid = $('#package-grid');
    if (!grid) return;
    const list = Store.treatments(true).filter((t) => t.sessions > 1);
    grid.innerHTML = list
      .map(
        (t) => `
      <article class="tcard">
        <span class="tag">${esc(t.sessions)}-session plan</span>
        <h3>${esc(t.name)}</h3>
        <p class="desc">${esc(t.summary)}</p>
        <ul style="padding-left:1.1rem;color:var(--muted);font-size:.88rem;margin:.2rem 0 1rem">
          ${t.inclusions.map((i) => `<li>${esc(i)}</li>`).join('')}
        </ul>
        <div class="tcard-foot">
          <span class="price">${Store.money(t.price)} <small>for ${t.sessions} sessions</small></span>
          <a class="btn btn-primary btn-sm" href="book.html?treatment=${encodeURIComponent(t.id)}">Book first slot</a>
        </div>
      </article>`
      )
      .join('');
  }

  /* ---------- doctor page ---------- */
  function initDoctorPage() {
    const host = $('#doctor-detail');
    if (!host) return;
    const d = Store.doctor();
    const s = Store.settings();
    host.innerHTML = `
      <div class="doctor-portrait" aria-hidden="true"><span class="monogram">MK</span></div>
      <div>
        <span class="tag">BAMS · MD (Kayachikitsa)</span>
        <h1 style="font-size:2rem">${esc(d.name)}</h1>
        <p class="muted">${esc(d.qualification)} · ${esc(d.experience)} of clinical practice</p>
        <p>${esc(d.about)}</p>
        <div class="doctor-facts">
          <span class="chip">${ICONS.clock} ${esc(hoursLabel())}</span>
          <span class="chip">${ICONS.calendar} 30-minute consultations</span>
          <span class="chip">${ICONS.pin} Single clinic</span>
        </div>
        <div class="alert alert-info" style="max-width:560px">
          ${ICONS.clock} Slots are 30 minutes, from ${esc(Store.fmtTime(s.open))} to ${esc(Store.fmtTime(s.close))}. The last bookable slot starts at 7:30 PM.
        </div>
        <a class="btn btn-primary" href="book.html">Check availability</a>
      </div>`;
  }

  /* ---------- contact ---------- */
  function initContact() {
    const form = $('#contact-form');
    if (!form) return;
    const s = Store.settings();
    const info = $('#contact-info');
    if (info) {
      info.innerHTML = `
        <div class="summary-row"><span>Clinic</span><span>${esc(s.name)}</span></div>
        <div class="summary-row"><span>Hours</span><span>${esc(hoursLabel())}, all days</span></div>
        <div class="summary-row"><span>Phone</span><span>${s.phone ? esc(s.phone) : 'To be added'}</span></div>
        <div class="summary-row"><span>Address</span><span>${s.address ? esc(s.address) : 'To be added'}</span></div>
        <div class="summary-row"><span>Email</span><span>${s.email ? esc(s.email) : 'To be added'}</span></div>
        <p class="summary-note">Details marked “to be added” are placeholders in this demo.</p>`;
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#c-name').value.trim();
      const mobile = $('#c-mobile').value.replace(/\D/g, '');
      const message = $('#c-message').value.trim();
      let ok = true;
      const setErr = (id, msg) => {
        $(id).textContent = msg || '';
        if (msg) ok = false;
      };
      setErr('#c-name-err', name.length < 2 ? 'Please enter your name.' : '');
      setErr('#c-mobile-err', !/^[6-9]\d{9}$/.test(mobile) ? 'Enter a valid 10-digit mobile number.' : '');
      setErr('#c-message-err', message.length < 5 ? 'Please add a short message.' : '');
      if (!ok) return;
      Store.addEnquiry({ name, mobile, message });
      form.reset();
      const success = $('#contact-success');
      success.hidden = false;
      success.focus();
      showToast('Enquiry saved — staff can see it in the admin panel.');
    });
  }

  /* ---------- booking ---------- */
  function initBooking() {
    const root = $('#booking');
    if (!root) return;

    const params = new URLSearchParams(location.search);
    const patient = Store.patientSession();
    const state = {
      step: 1,
      treatmentId: params.get('treatment') || '',
      date: params.get('date') || Store.todayISO(),
      time: params.get('time') || '',
      name: patient ? patient.name : '',
      mobile: patient ? patient.mobile : '',
      notes: '',
      otpSent: false,
      otpVerified: !!patient,
      consent: false,
    };

    if (!Store.treatmentById(state.treatmentId)) state.treatmentId = '';
    if (state.date < Store.todayISO()) state.date = Store.todayISO();
    if (!params.get('date') && Store.availableSlots(state.date).length < 3) {
      for (let i = 1; i <= 7; i++) {
        const candidate = Store.iso(Store.addDays(new Date(), i));
        if (Store.availableSlots(candidate).length >= 3) {
          state.date = candidate;
          break;
        }
      }
    }

    const panels = $$('.step-panel', root);
    const summary = $('#booking-summary');
    const stepper = $('#booking-stepper');

    function treatment() {
      return Store.treatmentById(state.treatmentId);
    }

    function renderStepper() {
      const labels = ['Service', 'Date & time', 'Your details', 'Confirm'];
      stepper.innerHTML = labels
        .map((label, i) => {
          const n = i + 1;
          const cls = n === state.step ? 'is-active' : n < state.step ? 'is-done' : '';
          return `<span class="stepper-step ${cls}"><b>${n < state.step ? '✓' : n}</b>${label}</span>`;
        })
        .join('');
    }

    function renderSummary() {
      const t = treatment();
      const s = Store.settings();
      summary.innerHTML = `
        <h3>Booking summary</h3>
        <div class="summary-row"><span>Service</span><span>${t ? esc(t.name) : 'Not selected'}</span></div>
        <div class="summary-row"><span>Date</span><span>${state.date ? esc(Store.fmtDate(state.date, { weekday: 'short', day: 'numeric', month: 'short' })) : 'Not selected'}</span></div>
        <div class="summary-row"><span>Time</span><span>${state.time ? esc(Store.fmtTime(state.time)) : 'Not selected'}</span></div>
        <div class="summary-row"><span>Doctor</span><span>${esc(Store.doctor().name)}</span></div>
        <div class="summary-row"><span>Duration</span><span>${t ? t.duration + ' min' : '—'}</span></div>
        <div class="summary-total"><span>To pay at clinic</span><strong>${t ? Store.money(t.price) : '—'}</strong></div>
        <p class="summary-note">${s.address ? esc(s.address) : 'Clinic address to be added.'} ${s.phone ? '· ' + esc(s.phone) : ''}</p>
        <p class="summary-note">No online payment. Cancel or reschedule by calling the clinic.</p>`;
    }

    function renderServices() {
      const list = Store.treatments(true);
      $('#service-list').innerHTML = list
        .map(
          (t) => `
        <label class="choice${state.treatmentId === t.id ? ' is-selected' : ''}">
          <input type="radio" name="service" value="${esc(t.id)}" ${state.treatmentId === t.id ? 'checked' : ''}>
          <span class="choice-body">
            <strong>${esc(t.name)}</strong>
            <small>${esc(t.summary)}</small>
          </span>
          <span class="choice-price">${Store.money(t.price)}</span>
        </label>`
        )
        .join('');
      $$('#service-list input').forEach((input) =>
        input.addEventListener('change', () => {
          state.treatmentId = input.value;
          $$('#service-list .choice').forEach((c) => c.classList.toggle('is-selected', c.contains(input) && input.checked));
          renderSummary();
          renderButtons();
        })
      );
    }

    function renderDates() {
      const strip = $('#date-strip');
      const days = [];
      for (let i = 0; i < 14; i++) days.push(Store.iso(Store.addDays(new Date(), i)));
      strip.innerHTML = days
        .map((d) => {
          const date = new Date(d + 'T00:00:00');
          const dow = date.toLocaleDateString('en-IN', { weekday: 'short' });
          const mon = date.toLocaleDateString('en-IN', { month: 'short' });
          const disabled = Store.slots().every((t) => Store.slotState(d, t) !== 'open');
          return `<button type="button" class="date-chip${state.date === d ? ' is-active' : ''}" data-date="${d}" ${disabled ? 'disabled' : ''}>
            <span class="dow">${esc(dow)}</span><span class="dom">${date.getDate()}</span><span class="mon">${esc(mon)}</span>
          </button>`;
        })
        .join('');
      $$('.date-chip', strip).forEach((btn) =>
        btn.addEventListener('click', () => {
          state.date = btn.dataset.date;
          state.time = '';
          renderDates();
          renderSlots();
          renderSummary();
          renderButtons();
        })
      );
      const picker = $('#date-picker');
      picker.min = Store.todayISO();
      picker.max = Store.iso(Store.addDays(new Date(), Store.settings().bookingDays));
      picker.value = state.date;
    }

    function renderSlots() {
      const grid = $('#slot-grid');
      const label = $('#slot-date-label');
      label.textContent = Store.fmtLongDate(state.date);
      grid.innerHTML = Store.slots()
        .map((t) => {
          const st = Store.slotState(state.date, t);
          const disabled = st !== 'open';
          return `<button type="button" class="slot${state.time === t ? ' is-selected' : ''}" data-time="${t}" ${disabled ? 'disabled' : ''} title="${slotHint(st)}">${esc(Store.fmtTime(t))}</button>`;
        })
        .join('');
      $$('.slot', grid).forEach((btn) =>
        btn.addEventListener('click', () => {
          state.time = btn.dataset.time;
          $$('.slot', grid).forEach((b) => b.classList.toggle('is-selected', b === btn));
          renderSummary();
          renderButtons();
        })
      );
      $('#slot-empty').hidden = Store.availableSlots(state.date).length > 0;
    }

    function slotHint(st) {
      return {
        past: 'This time has passed',
        late: 'Bookings close 2 hours before the slot',
        taken: 'Already booked',
        open: 'Available',
        closed: 'Outside the booking window',
      }[st] || '';
    }

    function renderDetails() {
      $('#d-name').value = state.name;
      $('#d-mobile').value = state.mobile;
      $('#d-notes').value = state.notes;
      $('#logged-in-note').hidden = !patient;
      $('#guest-fields').hidden = !!patient;
      $('#otp-box').hidden = !state.otpSent || !!patient;
      $('#otp-demo').textContent = Store.DEMO_OTP;
      $('#d-consent').checked = state.consent;
    }

    function renderButtons() {
      const next = $('#btn-next');
      const back = $('#btn-back');
      next.textContent = state.step === 4 ? 'Confirm booking' : 'Continue';
      next.disabled = !canContinue();
      back.hidden = state.step === 1;
      if (state.step === 4) {
        next.disabled = !state.consent || !state.time || !state.treatmentId || !patientValid();
      }
    }

    function patientValid() {
      if (patient) return true;
      return state.otpVerified && /^[6-9]\d{9}$/.test(state.mobile) && state.name.trim().length >= 2;
    }

    function canContinue() {
      if (state.step === 1) return !!state.treatmentId;
      if (state.step === 2) return !!state.time;
      if (state.step === 3) return patientValid();
      return true;
    }

    function showStep(n, shouldScroll) {
      state.step = n;
      panels.forEach((p) => (p.hidden = Number(p.dataset.step) !== n));
      renderStepper();
      renderSummary();
      renderButtons();
      if (n === 2) {
        if (state.time && Store.slotState(state.date, state.time) !== 'open') state.time = '';
        renderDates();
        renderSlots();
      }
      if (n === 3) renderDetails();
      if (n === 4) renderReview();
      if (shouldScroll !== false) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderReview() {
      const t = treatment();
      const p = patient || { name: state.name, mobile: state.mobile };
      const s = Store.settings();
      $('#review-box').innerHTML = `
        <div class="summary-row"><span>Patient</span><span>${esc(p.name)}</span></div>
        <div class="summary-row"><span>Mobile</span><span>${esc(p.mobile)}</span></div>
        <div class="summary-row"><span>Service</span><span>${esc(t.name)}</span></div>
        <div class="summary-row"><span>Date &amp; time</span><span>${esc(Store.fmtDate(state.date, { weekday: 'short', day: 'numeric', month: 'short' }))}, ${esc(Store.fmtTime(state.time))}</span></div>
        <div class="summary-row"><span>Doctor</span><span>${esc(Store.doctor().name)}</span></div>
        <div class="summary-row"><span>Pay at clinic</span><span>${Store.money(t.price)}</span></div>
        <div class="summary-row"><span>Clinic</span><span>${s.address ? esc(s.address) : 'Address to be added'}</span></div>`;
      $('#d-consent').checked = state.consent;
    }

    /* details interactions */
    $('#d-name').addEventListener('input', (e) => {
      state.name = e.target.value;
      renderButtons();
    });
    $('#d-mobile').addEventListener('input', (e) => {
      state.mobile = e.target.value.replace(/\D/g, '').slice(0, 10);
      e.target.value = state.mobile;
      state.otpVerified = false;
      renderButtons();
    });
    $('#d-notes').addEventListener('input', (e) => {
      state.notes = e.target.value;
    });
    $('#d-consent').addEventListener('change', (e) => {
      state.consent = e.target.checked;
      renderButtons();
    });
    $('#send-otp').addEventListener('click', () => {
      if (!/^[6-9]\d{9}$/.test(state.mobile)) {
        $('#d-mobile-err').textContent = 'Enter a valid 10-digit mobile number first.';
        return;
      }
      $('#d-mobile-err').textContent = '';
      state.otpSent = true;
      $('#otp-box').hidden = false;
      $('#otp-demo').textContent = Store.DEMO_OTP;
      showToast('Demo OTP ' + Store.DEMO_OTP + ' shown on screen (SMS is not connected yet).');
      $('#d-otp').focus();
    });
    $('#verify-otp').addEventListener('click', () => {
      const code = $('#d-otp').value.replace(/\D/g, '');
      if (code !== Store.DEMO_OTP) {
        $('#d-otp-err').textContent = 'Incorrect OTP. Use ' + Store.DEMO_OTP + ' for this demo.';
        return;
      }
      $('#d-otp-err').textContent = '';
      state.otpVerified = true;
      $('#otp-box').hidden = true;
      showToast('Mobile number verified.');
      renderButtons();
    });

    $('#date-picker').addEventListener('change', (e) => {
      if (!e.target.value) return;
      state.date = e.target.value;
      state.time = '';
      renderDates();
      renderSlots();
      renderSummary();
      renderButtons();
    });

    $('#btn-next').addEventListener('click', () => {
      if (state.step === 1 && !state.treatmentId) return;
      if (state.step === 2 && !state.time) return;
      if (state.step === 3) {
        if (!state.otpVerified) {
          $('#d-otp-err').textContent = 'Verify your mobile number to continue.';
          return;
        }
        if (state.name.trim().length < 2) {
          $('#d-name-err').textContent = 'Please enter your full name.';
          return;
        }
      }
      if (state.step < 4) {
        showStep(state.step + 1);
        return;
      }
      if (!state.consent) return;
      submitBooking();
    });

    $('#btn-back').addEventListener('click', () => {
      if (state.step > 1) showStep(state.step - 1);
    });

    function submitBooking() {
      let patientId = patient ? patient.id : null;
      if (!patientId) {
        const existing = Store.findPatientByMobile(state.mobile);
        if (existing) {
          patientId = existing.id;
          Store.updatePatient(existing.id, { name: state.name.trim() });
        } else {
          patientId = Store.createPatient({ name: state.name, mobile: state.mobile }).id;
        }
        Store.setSession({ type: 'patient', patientId });
      }
      const result = Store.book({
        patientId,
        treatmentId: state.treatmentId,
        date: state.date,
        time: state.time,
        notes: state.notes,
        source: 'website',
      });
      if (!result.ok) {
        showToast(result.error);
        showStep(2);
        renderSlots();
        return;
      }
      renderSuccess(result.appointment);
    }

    function renderSuccess(appt) {
      const t = treatment();
      const s = Store.settings();
      const patientName = (patient ? patient.name : state.name).split(' ')[0];
      const message = `Namaste ${patientName}, your ${t.name} is confirmed for ${Store.fmtDate(appt.date, { weekday: 'short', day: 'numeric', month: 'short' })} at ${Store.fmtTime(appt.time)} with ${Store.doctor().name}. ${s.name}. ${s.address || 'Address to be added.'}`;
      const stepper = $('#booking-stepper');
      if (stepper) stepper.hidden = true;
      const head = $('.page-head');
      if (head) head.hidden = true;
      root.innerHTML = `
        <div class="confirm-hero" style="padding-top:2rem">
          <div class="tick" aria-hidden="true">✓</div>
          <h1 style="font-size:2rem;margin-bottom:.4rem">Appointment confirmed</h1>
          <p class="muted">A confirmation has been prepared for WhatsApp. In this demo, the message is shown below instead of being sent.</p>
          <p class="booking-ref">${esc(appt.bookingId)}</p>
        </div>
        <div class="booking-layout">
          <div class="booking-main">
            <div class="summary-row"><span>Patient</span><span>${esc(patient ? patient.name : state.name)}</span></div>
            <div class="summary-row"><span>Service</span><span>${esc(t.name)}</span></div>
            <div class="summary-row"><span>Date</span><span>${esc(Store.fmtLongDate(appt.date))}</span></div>
            <div class="summary-row"><span>Time</span><span>${esc(Store.fmtTime(appt.time))} (${t.duration} min)</span></div>
            <div class="summary-row"><span>Doctor</span><span>${esc(Store.doctor().name)}</span></div>
            <div class="summary-row"><span>Clinic</span><span>${s.address ? esc(s.address) : 'Address to be added'}</span></div>
            <div class="summary-row"><span>Phone</span><span>${s.phone ? esc(s.phone) : 'To be added'}</span></div>
            <div class="alert alert-warn mt-2">Need to change this? Call the clinic — online cancellation is not available.</div>
            <div class="wa-preview">
              <div class="wa-head">● WhatsApp preview <span class="muted" style="font-weight:400">(simulated)</span></div>
              <div class="wa-bubble">${esc(message)}</div>
              <div class="wa-time">${esc(Store.fmtTime(new Date().toTimeString().slice(0, 5)))}</div>
            </div>
            <div class="hero-cta">
              <a class="btn btn-primary" href="account.html">View my appointments</a>
              <a class="btn btn-ghost" href="index.html">Back to home</a>
            </div>
          </div>
          <aside class="summary-card">
            <h3>What happens next</h3>
            <ol style="padding-left:1.1rem;color:var(--muted);font-size:.9rem;margin:0 0 1rem">
              <li>Reception sees the booking in the admin panel.</li>
              <li>A 24-hour reminder is scheduled (simulated).</li>
              <li>Arrive 10 minutes early with any previous prescriptions.</li>
            </ol>
            <p class="summary-note">Booking ID ${esc(appt.bookingId)} · created ${esc(appt.createdAt)}</p>
          </aside>
        </div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderStepper();
    renderServices();
    renderSummary();
    renderButtons();

    if (state.treatmentId && state.time && Store.slotState(state.date, state.time) === 'open') {
      state.step = 3;
      showStep(3, false);
    } else if (state.treatmentId && state.date) {
      showStep(2, false);
    } else {
      showStep(1, false);
    }
  }

  /* ---------- account ---------- */
  function initCompleteProfile(root, mobile) {
    root.innerHTML = `
      <div class="login-wrap">
        <div class="login-card">
          <span class="eyebrow"><span class="dot"></span> Mobile verified</span>
          <h1 style="margin-top:.6rem">Create your profile</h1>
          <p class="sub">One patient record per mobile number. You can edit these details later.</p>
          <form id="new-form" novalidate>
            <div class="field"><label for="n-name">Full name *</label><input class="input" id="n-name" autocomplete="name" required></div>
            <div class="field"><label for="n-mobile">Mobile</label><input class="input" id="n-mobile" value="${esc(mobile)}" disabled></div>
            <div class="form-grid">
              <div class="field"><label for="n-dob">Date of birth</label><input class="input" id="n-dob" type="date" max="${Store.todayISO()}"></div>
              <div class="field"><label for="n-gender">Gender</label>
                <select class="select" id="n-gender"><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select>
              </div>
            </div>
            <div class="field"><label for="n-email">Email</label><input class="input" id="n-email" type="email" autocomplete="email"></div>
            <div class="field"><label for="n-address">Address</label><input class="input" id="n-address" autocomplete="street-address"></div>
            <p class="field-error" id="n-err"></p>
            <button class="btn btn-primary btn-block" type="submit">Create profile</button>
            <button class="btn btn-ghost btn-block mt-1" type="button" id="n-cancel">Use a different number</button>
          </form>
        </div>
      </div>`;

    $('#n-cancel').addEventListener('click', () => {
      Store.clearSession();
      location.href = 'account.html';
    });

    $('#new-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#n-name').value.trim();
      const dob = $('#n-dob').value;
      const email = $('#n-email').value.trim();
      if (name.length < 2) {
        $('#n-err').textContent = 'Please enter your full name.';
        return;
      }
      if (dob && dob > Store.todayISO()) {
        $('#n-err').textContent = 'Date of birth cannot be in the future.';
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('#n-err').textContent = 'Enter a valid email address.';
        return;
      }
      const created = Store.createPatient({
        name,
        mobile,
        dob,
        gender: $('#n-gender').value,
        email,
        address: $('#n-address').value.trim(),
      });
      Store.setSession({ type: 'patient', patientId: created.id });
      location.href = 'account.html';
    });
  }

  function initAccount() {
    const root = $('#account');
    if (!root) return;
    const patient = Store.patientSession();
    const pending = Store.session();

    if (!patient && pending && pending.type === 'patient' && pending.pendingMobile) {
      initCompleteProfile(root, pending.pendingMobile);
      return;
    }

    if (!patient) {
      root.innerHTML = `
        <div class="login-wrap">
          <div class="login-card">
            <h1>My appointments</h1>
            <p class="sub">Log in with your mobile number. New patients are registered automatically.</p>
            <form id="login-form" novalidate>
              <div class="field">
                <label for="l-mobile">Mobile number</label>
                <input class="input" id="l-mobile" name="mobile" inputmode="numeric" autocomplete="tel" placeholder="98765 43210" maxlength="10">
                <p class="field-error" id="l-mobile-err"></p>
              </div>
              <button type="button" class="btn btn-outline btn-block" id="l-send">Send OTP</button>
              <div id="l-otp-box" hidden class="mt-2">
                <div class="otp-display"><span>SMS is not connected in the demo. Use this code:</span><b>${Store.DEMO_OTP}</b></div>
                <div class="field">
                  <label for="l-otp">One-time password</label>
                  <input class="input" id="l-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code">
                  <p class="field-error" id="l-otp-err"></p>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Verify and continue</button>
              </div>
            </form>
            <div class="demo-creds">Demo numbers with history: <b>9876543210</b>, <b>9822011223</b>, <b>9765432109</b>. Any 10-digit number creates a new patient.</div>
          </div>
        </div>`;

      const send = $('#l-send');
      send.addEventListener('click', () => {
        const mobile = $('#l-mobile').value.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(mobile)) {
          $('#l-mobile-err').textContent = 'Enter a valid 10-digit mobile number.';
          return;
        }
        $('#l-mobile-err').textContent = '';
        $('#l-otp-box').hidden = false;
        $('#l-otp').focus();
        showToast('Demo OTP ' + Store.DEMO_OTP + ' — no SMS is sent.');
      });
      $('#login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const mobile = $('#l-mobile').value.replace(/\D/g, '');
        if ($('#l-otp').value.replace(/\D/g, '') !== Store.DEMO_OTP) {
          $('#l-otp-err').textContent = 'Incorrect OTP. Use ' + Store.DEMO_OTP + ' in this demo.';
          return;
        }
        const existing = Store.findPatientByMobile(mobile);
        if (existing) {
          Store.setSession({ type: 'patient', patientId: existing.id });
          location.href = 'account.html';
        } else {
          // New patients verify, then complete their profile.
          Store.setSession({ type: 'patient', patientId: '', pendingMobile: mobile });
          location.href = 'account.html?new=1';
        }
      });
      return;
    }

    const params = new URLSearchParams(location.search);
    let tab = params.get('new') ? 'profile' : 'upcoming';

    function shell() {
      root.innerHTML = `
        <div class="page-head">
          <div class="container" style="padding:0">
            <span class="eyebrow"><span class="dot"></span> Patient account</span>
            <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between">
              <div>
                <h1 style="margin-bottom:.2rem">Namaste, ${esc(patient.name.split(' ')[0])}</h1>
                <p class="muted mb-0">${esc(patient.mobile)} · patient ID ${esc(patient.id.toUpperCase())}</p>
              </div>
              <div style="display:flex;gap:.5rem">
                <a class="btn btn-primary btn-sm" href="book.html">Book appointment</a>
                <button class="btn btn-ghost btn-sm" id="logout" type="button">Log out</button>
              </div>
            </div>
          </div>
        </div>
        <div class="container" style="padding-bottom:3rem">
          ${params.get('new') ? '<div class="alert alert-info">Your mobile number is verified. Add your name and details to finish creating your patient record.</div>' : ''}
          <div class="tabs" role="tablist" aria-label="Account sections">
            <button class="tab" data-tab="upcoming" role="tab">Upcoming</button>
            <button class="tab" data-tab="past" role="tab">Past</button>
            <button class="tab" data-tab="history" role="tab">Health history</button>
            <button class="tab" data-tab="profile" role="tab">Profile</button>
          </div>
          <div id="account-panel"></div>
        </div>`;

      $('#logout').addEventListener('click', () => {
        Store.clearSession();
        location.href = 'index.html';
      });
      $$('.tab').forEach((btn) =>
        btn.addEventListener('click', () => {
          tab = btn.dataset.tab;
          paint();
        })
      );
      paint();
    }

    function apptCard(a, upcoming) {
      const t = Store.treatmentById(a.treatmentId) || { name: 'Consultation' };
      const d = a.date ? new Date(a.date + 'T00:00:00') : null;
      return `
        <div class="appt-card">
          <div class="appt-date">
            <div class="d">${d ? d.getDate() : '—'}</div>
            <div class="m">${d ? d.toLocaleDateString('en-IN', { month: 'short' }) : ''}</div>
          </div>
          <div class="appt-body">
            <h3>${esc(t.name)}</h3>
            <p>${esc(Store.fmtDate(a.date, { weekday: 'long', day: 'numeric', month: 'long' }))} · ${esc(Store.fmtTime(a.time))} · ${esc(Store.doctor().name)}</p>
            <p>Booking ${esc(a.bookingId)} · ${statusBadge(a.status)}</p>
          </div>
          <div class="appt-actions">
            ${upcoming ? '<button class="btn btn-ghost btn-sm" data-help type="button">Change or cancel</button>' : ''}
            <a class="btn btn-ghost btn-sm" href="book.html?treatment=${encodeURIComponent(a.treatmentId)}">Book again</a>
          </div>
        </div>`;
    }

    function paint() {
      $$('.tab').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.tab === tab);
        b.setAttribute('aria-selected', String(b.dataset.tab === tab));
      });
      const panel = $('#account-panel');
      if (tab === 'upcoming') {
        const list = Store.upcomingFor(patient.id);
        panel.innerHTML = list.length
          ? `<p class="muted">${list.length} upcoming appointment${list.length > 1 ? 's' : ''}</p>` + list.map((a) => apptCard(a, true)).join('')
          : `<div class="empty-state"><strong>No upcoming appointments</strong>Pick a treatment and book a 30-minute slot.<div class="mt-2"><a class="btn btn-primary btn-sm" href="book.html">Book appointment</a></div></div>`;
        $$('[data-help]', panel).forEach((b) => b.addEventListener('click', openCancelModal));
      } else if (tab === 'past') {
        const list = Store.appointmentsFor(patient.id).filter((a) => Store.upcomingFor(patient.id).every((u) => u.id !== a.id));
        panel.innerHTML = list.length ? list.map((a) => apptCard(a, false)).join('') : '<div class="empty-state"><strong>No past appointments yet</strong>Your completed visits will appear here.</div>';
      } else if (tab === 'history') {
        const records = Store.recordsFor(patient.id, true);
        panel.innerHTML = records.length
          ? `<div class="alert alert-info">Only notes your doctor has chosen to share are shown here.</div>` + records.map(recordCard).join('')
          : '<div class="empty-state"><strong>Nothing shared yet</strong>Consultation summaries and prescriptions shared by your doctor will appear here.</div>';
      } else {
        panel.innerHTML = profileForm(patient);
        $('#profile-form').addEventListener('submit', saveProfile);
      }
    }

    function recordCard(r) {
      return `
        <article class="record">
          <div class="record-head">
            <h3>${esc(Store.fmtDate(r.date, { day: 'numeric', month: 'long', year: 'numeric' }))}</h3>
            <span class="chip">${esc(r.prakriti || 'Prakriti not recorded')}</span>
          </div>
          <dl>
            ${r.complaint ? `<dt>Complaint</dt><dd>${esc(r.complaint)}</dd>` : ''}
            ${r.diagnosis ? `<dt>Assessment</dt><dd>${esc(r.diagnosis)}</dd>` : ''}
            ${r.medications ? `<dt>Prescription</dt><dd>${esc(r.medications)}</dd>` : ''}
            ${r.allergies ? `<dt>Allergies</dt><dd>${esc(r.allergies)}</dd>` : ''}
            ${r.notes ? `<dt>Advice</dt><dd>${esc(r.notes)}</dd>` : ''}
            <dt>Doctor</dt><dd>${esc(Store.doctor().name)}</dd>
          </dl>
        </article>`;
    }

    function profileForm(p) {
      return `
        <div class="booking-main">
          <form id="profile-form" novalidate>
            <div class="form-grid">
              <div class="field"><label for="p-name">Full name *</label><input class="input" id="p-name" value="${esc(p.name)}" required></div>
              <div class="field"><label for="p-mobile">Mobile</label><input class="input" id="p-mobile" value="${esc(p.mobile)}" disabled><span class="hint">Changing your mobile needs OTP verification — call the clinic for now.</span></div>
              <div class="field"><label for="p-dob">Date of birth</label><input class="input" id="p-dob" type="date" value="${esc(p.dob)}" max="${Store.todayISO()}"></div>
              <div class="field"><label for="p-gender">Gender</label>
                <select class="select" id="p-gender">
                  <option value="">Prefer not to say</option>
                  ${['Female', 'Male', 'Other'].map((g) => `<option${p.gender === g ? ' selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>
              <div class="field"><label for="p-email">Email</label><input class="input" id="p-email" type="email" value="${esc(p.email)}"></div>
              <div class="field"><label for="p-address">Address</label><input class="input" id="p-address" value="${esc(p.address)}"></div>
            </div>
            <p class="field-error" id="p-err"></p>
            <button class="btn btn-primary" type="submit">Save profile</button>
          </form>
        </div>`;
    }

    function saveProfile(e) {
      e.preventDefault();
      const name = $('#p-name').value.trim();
      const dob = $('#p-dob').value;
      const email = $('#p-email').value.trim();
      if (name.length < 2) {
        $('#p-err').textContent = 'Please enter your full name.';
        return;
      }
      if (dob && dob > Store.todayISO()) {
        $('#p-err').textContent = 'Date of birth cannot be in the future.';
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('#p-err').textContent = 'Enter a valid email address.';
        return;
      }
      Store.updatePatient(patient.id, {
        name,
        dob,
        email,
        gender: $('#p-gender').value,
        address: $('#p-address').value.trim(),
      });
      showToast('Profile saved.');
      if (params.get('new')) location.href = 'account.html';
    }

    function openCancelModal() {
      const s = Store.settings();
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <h2 id="cancel-title">Change or cancel your visit</h2>
          <p>Online cancellation and rescheduling are not available. Please call the clinic and the team will find another slot or cancel for you.</p>
          <div class="alert alert-info">${esc(s.cancelPolicy)}</div>
          <p class="mb-0"><strong>Clinic phone:</strong> ${s.phone ? `<a href="tel:${esc(s.phone.replace(/\s/g, ''))}">${esc(s.phone)}</a>` : '<span class="placeholder-note">Phone number to be added</span>'}</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" data-close type="button">Close</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
      const close = () => {
        modal.remove();
        document.body.classList.remove('modal-open');
      };
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('[data-close]')) close();
      });
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', onKey);
        }
      });
      $('[data-close]', modal).focus();
    }

    shell();
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    if (page === 'home') initHome();
    if (page === 'treatments') initTreatments();
    if (page === 'packages') initPackages();
    if (page === 'doctors') initDoctorPage();
    if (page === 'contact') initContact();
    if (page === 'book') initBooking();
    if (page === 'account') initAccount();
  });
})();
