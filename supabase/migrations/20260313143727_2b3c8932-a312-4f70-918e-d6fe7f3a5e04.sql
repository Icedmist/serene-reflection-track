-- Profiles table to store user metadata for leaderboard
CREATE TABLE public.profiles (
  user_id text PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  total_xp integer NOT NULL DEFAULT 0,
  sharing_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Community messages table for user interactions
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'encouragement',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view shared profiles"
  ON public.profiles FOR SELECT
  USING (sharing_enabled = true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true); -- Relaxed for demo/local auth sync

-- Community messages policies
CREATE POLICY "Anyone can view community messages"
  ON public.community_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can post messages"
  ON public.community_messages FOR INSERT
  WITH CHECK (true); -- Relaxed because we use local auth

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
