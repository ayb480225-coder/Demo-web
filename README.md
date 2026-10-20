# Ayurved Clinic — working demo

A clickable demo of the patient website and the clinic staff panel for
RFP `ayurved-clinic-online-booking`. Everything runs in the browser with no
backend, so clinic details, OTP, WhatsApp and SMS are simulated.

## Run it

Double-click **`start-demo.cmd`**, or from this folder:

```bash
python -m http.server 5500 --bind 127.0.0.1
```

Then open <http://127.0.0.1:5500/index.html>.

> Opening the HTML files directly also works in most browsers, but a local
> server is more reliable for fonts, links and storage.

## What is inside

| URL | What it shows |
| --- | --- |
| `index.html` | Home page, next available slots, treatments, doctor, contact |
| `treatments.html` | Treatment catalogue with category filters |
| `packages.html` | Multi-session packages |
| `doctors.html` | Doctor profile and consultation hours |
| `book.html` | 4-step booking: service → date/time → details + OTP → confirm |
| `account.html` | Patient login, upcoming/past visits, shared health history, profile |
| `admin.html` | Staff panel: dashboard, appointments, patients 360°, packages, notifications, reports, activity, settings |

## Demo script (about 5 minutes)

1. **Home** — point out 10:00 AM – 8:00 PM, 30-minute slots, one doctor.
2. **Book** — choose *Abhyanga Therapy*, pick an open slot (booked slots are
   struck through), enter a name and any 10-digit mobile, click **Send OTP**
   and use **123456**. Accept consent and confirm.
3. **Confirmation** — show the booking ID and the simulated WhatsApp message.
4. **Account** — open *My appointments*: upcoming visit, and **Change or cancel**
   explains that cancellation is by phone only (per your decision).
5. **Staff panel** — log in as Front Desk (`frontdesk@clinic.demo` / `demo123`):
   - Dashboard: today's appointments and counts
   - Appointments: filter, search, mark done, no-show, move, cancel
   - Patients: open a 360° profile; log in as Doctor to add a health record
   - Reports: date range, no-show rate, CSV export
6. **Admin** — log in as Admin (`admin@clinic.demo` / `demo123`): publish or hide
   a package, edit clinic phone/address, view the activity log.

## Login details

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@clinic.demo` | `demo123` |
| Doctor | `doctor@clinic.demo` | `demo123` |
| Front Desk | `frontdesk@clinic.demo` | `demo123` |

Patient accounts use mobile + OTP. Demo OTP is always **123456** and is shown
on screen. Seeded patient numbers: `9876543210`, `9822011223`, `9765432109`.
Any other valid 10-digit number creates a new patient.

## Confirmed clinic decisions reflected in the demo

- Working name **Ayurved Clinic**; logo, address and phone are placeholders.
- **One doctor** at launch.
- **10:00 AM – 8:00 PM**, **30-minute slots** (20 slots per day, last start 7:30 PM).
- **No online cancellation or rescheduling** — patients are asked to call; staff
  can cancel or move appointments in the admin panel.
- WhatsApp/SMS is **simulated**; the provider can be connected later.

## Not included (deliberately)

- Real OTP, WhatsApp/SMS delivery, payments
- Multi-doctor scheduling, multi-branch, pharmacy, billing
- Real server, database, authentication or audit security
- Final brand assets and clinic contact details

## Data and reset

Demo data lives in the browser's `localStorage` under `ayurved_demo_v2`.
To restore the sample data: **Admin → Clinic settings → Reset demo data**, or
clear site data for `127.0.0.1`.

## Security and privacy notes

This is a **front-end demo, not a product**. It has no server, no database and
no real authentication, so please read the following before sharing it widely.

- **No real secrets are stored here.** The staff password `demo123` and the OTP
  `123456` are hard-coded placeholders so the demo can be clicked through. They
  are not credentials for anything real, and they are not private.
- **All patients, phone numbers, emails and health records are fictional.**
  The numbers are obvious placeholders. Never type real patient information into
  this demo — it is stored unencrypted in the browser and is world readable if
  you host it publicly.
- **Nothing leaves the browser.** Data is written only to `localStorage` on the
  machine that opens the page; there are no outbound calls to WhatsApp, SMS or
  any analytics provider.
- **The local server is loopback-only.** `start-demo.cmd` binds to
  `127.0.0.1:5500`. Do not change that to `0.0.0.0` on a shared or public
  network, because anything on that network could then open the staff panel.
- **User input is HTML-escaped before rendering** (`esc()` in `site.js` and
  `admin.js`), which keeps the simulated records safe to display. Keep that
  pattern if you extend the pages.
- **Not production ready.** A real deployment needs a backend, server-side
  authorisation, real OTP delivery, HTTPS, rate limiting, encrypted storage and
  an auditable record of who viewed which patient. None of that exists here.

If you plan to publish this on GitHub Pages, keep it as-is (demo data only) and
link back to this section so visitors know the logins are fake.

## Files

```
demo/
  index.html, treatments.html, packages.html, doctors.html,
  book.html, account.html, contact.html, admin.html
  assets/styles.css     design system, public site and admin styles
  assets/store.js       demo data, booking rules, slots, notifications
  assets/site.js        public site behaviour
  assets/admin.js       staff panel behaviour
  start-demo.cmd        one-click local server
```
