# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Create a new project
3. Wait for the database to be provisioned

## 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL: `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key: `SUPABASE_SERVICE_ROLE_KEY`
3. Create `.env.local` file in project root with these values

## 3. Run Database Schema

1. Go to SQL Editor in Supabase Dashboard
2. Copy and run the contents of `supabase/schema.sql`
3. Copy and run the contents of `supabase/policies.sql`

## 4. Create Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `event-covers`
   - Make it public
3. Create a new bucket named `event-media`
   - Make it public

## 5. Configure Storage Policies

The storage policies are included in `supabase/policies.sql`.
If you need to add them manually:

1. Go to Storage > Policies
2. Add the policies as defined in the SQL file

## 6. Enable Email Auth

1. Go to Authentication > Providers
2. Enable Email provider
3. Disable "Confirm email" if you want to test without email confirmation
4. Configure email templates if needed

## 7. Test the Connection

Run the development server and check if the Supabase connection works:

```bash
npm run dev
```
