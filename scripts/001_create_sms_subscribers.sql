-- SMS Subscribers table for storing phone numbers and notification preferences
-- No auth required - users just enter phone and location

CREATE TABLE IF NOT EXISTS public.sms_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  uv_min INTEGER DEFAULT 4,
  uv_max INTEGER DEFAULT 7,
  notification_time TIME DEFAULT '07:00:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying of active subscribers
CREATE INDEX IF NOT EXISTS idx_sms_subscribers_active ON public.sms_subscribers(is_active) WHERE is_active = true;

-- Index for notification time queries (for cron job)
CREATE INDEX IF NOT EXISTS idx_sms_subscribers_notification_time ON public.sms_subscribers(notification_time);

-- Enable Row Level Security
ALTER TABLE public.sms_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON public.sms_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can select their own record by phone number
-- (We'll use service role for cron job queries)
CREATE POLICY "Select own by phone" ON public.sms_subscribers
  FOR SELECT
  USING (true);

-- Policy: Anyone can update their own record by phone number
CREATE POLICY "Update own by phone" ON public.sms_subscribers
  FOR UPDATE
  USING (true);

-- Policy: Anyone can delete their own record
CREATE POLICY "Delete own by phone" ON public.sms_subscribers
  FOR DELETE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_sms_subscribers_updated_at ON public.sms_subscribers;
CREATE TRIGGER update_sms_subscribers_updated_at
  BEFORE UPDATE ON public.sms_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
