# Supabase Email Templates (All Types)

Last verified: 2026-03-07
Primary source: https://supabase.com/docs/guides/auth/auth-email-templates

## 1) Email types Supabase can send

### Authentication emails
- Confirm sign up
- Invite user
- Magic link
- Change email address
- Reset password
- Reauthentication

### Security notification emails
- Password changed
- Email address changed
- Phone number changed
- Identity linked
- Identity unlinked
- MFA method added
- MFA method removed

## 2) Template variables

### Common variables (auth flows)
- `{{ .ConfirmationURL }}`: full confirm URL
- `{{ .Token }}`: 6-digit OTP
- `{{ .TokenHash }}`: hash of token (recommended to build your own URL)
- `{{ .SiteURL }}`: project site URL
- `{{ .RedirectTo }}`: redirect URL passed from client SDK
- `{{ .Data }}`: user metadata object (`auth.users.user_metadata`)
- `{{ .Email }}`: user email

### Variables only for specific templates
- `{{ .NewEmail }}`: only Change email address template
- `{{ .OldEmail }}`: only Email address changed notification
- `{{ .Phone }}`: only Phone number changed notification
- `{{ .OldPhone }}`: only Phone number changed notification
- `{{ .Provider }}`: only Identity linked/unlinked notifications
- `{{ .FactorType }}`: only MFA added/removed notifications

## 3) Ready-to-paste templates (Subject + HTML)

### A. Confirm sign up
Subject:
```text
Confirm your signup
```
Body:
```html
<h2>Confirm your account</h2>
<p>Hello {{ .Email }},</p>
<p>Click below to confirm your signup:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm signup</a></p>
<p>If you did not create this account, you can ignore this email.</p>
```

### B. Invite user
Subject:
```text
You have been invited
```
Body:
```html
<h2>You are invited</h2>
<p>Hello,</p>
<p>You were invited to join <strong>{{ .SiteURL }}</strong>.</p>
<p><a href="{{ .ConfirmationURL }}">Accept invite</a></p>
<p>If you were not expecting this invite, ignore this email.</p>
```

### C. Magic link
Subject:
```text
Your magic link
```
Body:
```html
<h2>Magic sign-in link</h2>
<p>Hello {{ .Email }},</p>
<p>Click below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in now</a></p>
<p>This link is one-time and expires soon.</p>
```

### D. Change email address
Subject:
```text
Confirm email change
```
Body:
```html
<h2>Confirm your new email</h2>
<p>Current email: {{ .Email }}</p>
<p>New email: {{ .NewEmail }}</p>
<p><a href="{{ .ConfirmationURL }}">Confirm email change</a></p>
<p>If you did not request this, contact support immediately.</p>
```

### E. Reset password
Subject:
```text
Reset your password
```
Body:
```html
<h2>Reset password</h2>
<p>Hello {{ .Email }},</p>
<p>Click below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>If you did not request this, ignore this email.</p>
```

### F. Reauthentication
Subject:
```text
Confirm reauthentication
```
Body:
```html
<h2>Reauthentication required</h2>
<p>Hello {{ .Email }},</p>
<p>Enter this verification code to continue:</p>
<p style="font-size:24px;font-weight:bold;letter-spacing:2px;">{{ .Token }}</p>
<p>This code expires soon.</p>
```

### G. Password changed notification
Subject:
```text
Your password has been changed
```
Body:
```html
<h2>Password changed</h2>
<p>This is a confirmation that the password for <strong>{{ .Email }}</strong> was changed.</p>
<p>If this was not you, contact support immediately.</p>
```

### H. Email address changed notification
Subject:
```text
Your email address has been changed
```
Body:
```html
<h2>Email changed</h2>
<p>Your account email was changed from <strong>{{ .OldEmail }}</strong> to <strong>{{ .Email }}</strong>.</p>
<p>If this was not you, contact support immediately.</p>
```

### I. Phone number changed notification
Subject:
```text
Your phone number has been changed
```
Body:
```html
<h2>Phone number changed</h2>
<p>Your account phone number changed from <strong>{{ .OldPhone }}</strong> to <strong>{{ .Phone }}</strong>.</p>
<p>Account email: {{ .Email }}</p>
<p>If this was not you, contact support immediately.</p>
```

### J. Identity linked notification
Subject:
```text
A new identity has been linked
```
Body:
```html
<h2>New identity linked</h2>
<p>A new identity provider <strong>{{ .Provider }}</strong> was linked to account <strong>{{ .Email }}</strong>.</p>
<p>If this was not you, contact support immediately.</p>
```

### K. Identity unlinked notification
Subject:
```text
An identity has been unlinked
```
Body:
```html
<h2>Identity unlinked</h2>
<p>An identity provider <strong>{{ .Provider }}</strong> was unlinked from account <strong>{{ .Email }}</strong>.</p>
<p>If this was not you, contact support immediately.</p>
```

### L. MFA method added notification
Subject:
```text
A new MFA method has been added
```
Body:
```html
<h2>MFA method added</h2>
<p>A new MFA factor <strong>{{ .FactorType }}</strong> was added to account <strong>{{ .Email }}</strong>.</p>
<p>If this was not you, contact support immediately.</p>
```

### M. MFA method removed notification
Subject:
```text
An MFA method has been removed
```
Body:
```html
<h2>MFA method removed</h2>
<p>An MFA factor <strong>{{ .FactorType }}</strong> was removed from account <strong>{{ .Email }}</strong>.</p>
<p>If this was not you, contact support immediately.</p>
```

## 4) Recommended for PKCE / email prefetch-safe links

Some mailbox security scanners may pre-open `{{ .ConfirmationURL }}` and consume one-time links.
Supabase recommends building your own link with `{{ .TokenHash }}`.

Example (replace domain/path to match your app):

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Confirm</a>
```

For password recovery:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset password</a>
```

## 5) Mapping to Supabase Management API keys

- Confirm sign up: `mailer_subjects_confirmation`, `mailer_templates_confirmation_content`
- Invite user: `mailer_subjects_invite`, `mailer_templates_invite_content`
- Magic link: `mailer_subjects_magic_link`, `mailer_templates_magic_link_content`
- Change email address: `mailer_subjects_email_change`, `mailer_templates_email_change_content`
- Reset password: `mailer_subjects_recovery`, `mailer_templates_recovery_content`
- Reauthentication: `mailer_subjects_reauthentication`, `mailer_templates_reauthentication_content`
- Password changed: `mailer_subjects_password_changed_notification`, `mailer_templates_password_changed_notification_content`
- Email changed: `mailer_subjects_email_changed_notification`, `mailer_templates_email_changed_notification_content`
- Phone changed: `mailer_subjects_phone_changed_notification`, `mailer_templates_phone_changed_notification_content`
- Identity linked: `mailer_subjects_identity_linked_notification`, `mailer_templates_identity_linked_notification_content`
- Identity unlinked: `mailer_subjects_identity_unlinked_notification`, `mailer_templates_identity_unlinked_notification_content`
- MFA added: `mailer_subjects_mfa_factor_enrolled_notification`, `mailer_templates_mfa_factor_enrolled_notification_content`
- MFA removed: `mailer_subjects_mfa_factor_unenrolled_notification`, `mailer_templates_mfa_factor_unenrolled_notification_content`

Note: security notifications must be enabled at project level before those emails are sent.

## 6) Security notification enable flags (Management API)

- Password changed: `mailer_notifications_password_changed_enabled`
- Email changed: `mailer_notifications_email_changed_enabled`
- Phone changed: `mailer_notifications_phone_changed_enabled`
- MFA added: `mailer_notifications_mfa_factor_enrolled_enabled`
- MFA removed: `mailer_notifications_mfa_factor_unenrolled_enabled`
- Identity linked: `mailer_notifications_identity_linked_enabled`
- Identity unlinked: `mailer_notifications_identity_unlinked_enabled`
