# S.P Consultant website

The public website is built with Next.js, TypeScript, and Tailwind CSS. It has been structured to add a Supabase owner dashboard, transactional email delivery, and an AI Guidance Assistant without placing credentials in browser code.

## Run locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Configure enquiry email

1. Create a verified sender domain with the selected email-delivery provider (the contact endpoint uses Resend's REST API).
2. Copy `.env.example` to `.env.local`.
3. Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL`.
4. Restart the development server and submit a test enquiry.

Never commit `.env.local` or paste API keys into source files.

## Before production

- Confirm the official address, proprietor name, social links, and current services.
- Add approved gallery photography and verified testimonials.
- Connect Supabase authentication, database tables, storage, backups, and owner-only permissions before publishing `/admin`.
- Add spam protection/rate limiting to the public form.
- Add the approved AI knowledge base and the OpenAI project key only after client review.
