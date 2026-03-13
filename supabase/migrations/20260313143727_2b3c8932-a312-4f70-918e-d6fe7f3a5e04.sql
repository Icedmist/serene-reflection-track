
-- Community messages table for user interactions
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT '',
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'encouragement',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read messages
CREATE POLICY "Anyone can view community messages"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own messages
CREATE POLICY "Users can post messages"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.community_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for community messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
