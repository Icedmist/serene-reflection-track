
-- Fix anonymous access: restrict rewards to authenticated only
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.rewards;
CREATE POLICY "Users can view their own rewards" ON public.rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rewards" ON public.rewards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix profiles: restrict personal policies to authenticated
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix share_links: restrict management to authenticated
DROP POLICY IF EXISTS "Users manage own share links" ON public.share_links;
CREATE POLICY "Users manage own share links" ON public.share_links FOR ALL TO authenticated USING (auth.uid() = user_id);
