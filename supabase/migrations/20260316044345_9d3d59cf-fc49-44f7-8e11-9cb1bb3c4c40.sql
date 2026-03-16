-- Subscribers table for email capture from landing page visitors
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text DEFAULT '',
  source text DEFAULT 'landing_page',
  referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.subscribers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view subscribers" ON public.subscribers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers" ON public.subscribers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Invitations table for user-to-user invites
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create invitations" ON public.invitations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can view own invitations" ON public.invitations
  FOR SELECT TO authenticated USING (auth.uid() = invited_by);

CREATE POLICY "Admins can view all invitations" ON public.invitations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Adhkar collection stored in DB
CREATE TABLE public.adhkar_collection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  full_text text,
  full_text_ar text,
  category text NOT NULL DEFAULT 'general',
  source text,
  target_count int NOT NULL DEFAULT 1,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.adhkar_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read adhkar" ON public.adhkar_collection
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public can read adhkar" ON public.adhkar_collection
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage adhkar" ON public.adhkar_collection
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Daily motivation cache
CREATE TABLE public.daily_motivations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL UNIQUE,
  content text NOT NULL,
  content_ar text,
  category text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_motivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read motivations" ON public.daily_motivations
  FOR SELECT TO public USING (true);

CREATE POLICY "System can insert motivations" ON public.daily_motivations
  FOR INSERT TO authenticated WITH CHECK (true);