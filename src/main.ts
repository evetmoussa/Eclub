import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const HARDCODED_DEV_TOKEN =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMmNjZGYwYy04NGNhLTQ4MDMtYTU3Mi02YjU4YzdjNzE0NTQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImEyY2NkZjBjLTg0Y2EtNDgwMy1hNTcyLTZiNThjN2M3MTQ1NCIsImdpdmVuX25hbWUiOiJBZG1pbiIsImZhbWlseV9uYW1lIjoiVXNlciIsImVtYWlsIjoiYWRtaW5AZS1jbHViLnJ1bmFzcC5uZXQiLCJqdGkiOiIwOTlmYjcyOC1jZGFhLTQ3NjgtYjA5Ni1iNDE5ODEzZWJmMDgiLCJ1c2VySWQiOiJhMmNjZGYwYy04NGNhLTQ4MDMtYTU3Mi02YjU4YzdjNzE0NTQiLCJmdWxsTmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlcyI6WyJBZG1pbiJdLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImV4cCI6MTc4MDA3MjE1MywiaXNzIjoiaHR0cHM6Ly9lLWNsdWIucnVuYXNwLm5ldCIsImF1ZCI6Imh0dHBzOi8vZS1jbHViLnJ1bmFzcC5uZXQifQ.1kMMpt0Sn_U8rL_yOqCqBnEoYOFqm4JmbdkwjrNv7_w';
(function applyDevToken() {
  if (typeof localStorage === 'undefined') return;
  let expMs = 0;
  try {
    const payload = JSON.parse(atob(HARDCODED_DEV_TOKEN.split('.')[1]));
    if (payload?.exp) expMs = payload.exp * 1000;
  } catch { /* ignore */ }

  localStorage.setItem('adminToken', HARDCODED_DEV_TOKEN);
  if (expMs) localStorage.setItem('adminTokenExpiry', expMs.toString());
  localStorage.setItem('userType', 'admin');

  const stillValid = expMs && Date.now() < expMs;
  if (!stillValid) {
    console.warn('%c[main] Dev token is expired! Re-issue from Postman.',
      'color:#ef4444;font-weight:bold', expMs ? new Date(expMs) : '(unknown)');
  } else {
    console.info('%c[main] Dev admin token applied. Expires:',
      'color:#1AD55F;font-weight:bold', new Date(expMs));
  }
})();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
