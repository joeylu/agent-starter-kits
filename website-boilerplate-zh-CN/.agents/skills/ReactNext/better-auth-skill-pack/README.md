# Better Auth skill pack snapshot

Generated: 2026-04-07

This package is a focused snapshot of the upstream `better-auth/skills` repository subtree `better-auth/`.
It is intended as an auth-specific add-on skill pack for a Next.js + React website project.

## Included upstream folders

- `better-auth/best-practices/`
- `better-auth/commands/`
- `better-auth/create-auth/`
- `better-auth/emailAndPassword/`
- `better-auth/organization/`
- `better-auth/twoFactor/`

## What this pack is good for

- Initial Better Auth setup
- Email + password auth
- Planning an auth rollout in an existing Next.js project
- Organization / multi-tenant auth
- Two-factor auth
- Provider reference lookup

## Important capability note

Better Auth the framework supports more than what is split into dedicated skill folders here.
In particular:
- SSO is supported by Better Auth core/plugin docs, but this pack does not include a dedicated `sso/` skill folder.
- Phone number / SMS OTP is supported by Better Auth core/plugin docs, but this pack does not include a dedicated `phoneNumber/` skill folder.
- QR login depends on provider type. For web, WeChat QR login is supported by Better Auth's WeChat provider docs, but this pack does not include a dedicated `wechat/` or `qr-login/` skill folder.

So this pack is useful as an auth baseline, but not a complete one-folder-per-feature mirror for all future auth expansion methods.

## Suggested use in your project

Keep this pack separate from your website UI skill pack.
Suggested local location:

`~/.codex/skills/website/auth/better-auth/`

This helps you treat auth as its own capability layer instead of mixing it into the Stitch/Next UI pack.
