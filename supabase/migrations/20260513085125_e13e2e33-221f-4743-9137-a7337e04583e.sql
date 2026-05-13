
-- 1. Seed admin email config
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage app_settings" ON public.app_settings FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone reads app_settings" ON public.app_settings FOR SELECT USING (true);
INSERT INTO public.app_settings(key,value) VALUES ('admin_email','info@amirnazir.site')
  ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now();

-- 2. Replace handle_new_user to auto-promote seeded admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  admin_email text;
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT DO NOTHING;

  SELECT value INTO admin_email FROM public.app_settings WHERE key='admin_email';

  IF admin_email IS NOT NULL AND lower(NEW.email) = lower(admin_email) THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Promote existing users that already match seeded admin email
INSERT INTO public.user_roles(user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u
WHERE lower(u.email) = (SELECT lower(value) FROM public.app_settings WHERE key='admin_email')
ON CONFLICT DO NOTHING;

-- Drop deprecated claim function
DROP FUNCTION IF EXISTS public.claim_admin_if_none();

-- 3. Packages
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  interval text NOT NULL DEFAULT 'month',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  highlighted boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active packages" ON public.packages FOR SELECT USING (active OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage packages" ON public.packages FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER packages_touch BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.packages(name,description,price,currency,interval,features,sort_order,highlighted) VALUES
('Starter','Essential web presence',299,'USD','month','["Landing page","Basic SEO","Email support"]'::jsonb,1,false),
('Studio','For growing brands',799,'USD','month','["Up to 8 pages","Custom design","Motion + 3D accents","Priority support"]'::jsonb,2,true),
('Atelier','Bespoke flagship work',1999,'USD','month','["Unlimited pages","Custom WebGL","Dedicated designer","24/7 premium support"]'::jsonb,3,false);

-- 4. Payment methods (toggleable bank / wallet)
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  label text NOT NULL,
  instructions text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads enabled payment methods" ON public.payment_methods FOR SELECT USING (enabled OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage payment methods" ON public.payment_methods FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER payment_methods_touch BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.payment_methods(kind,label,instructions,sort_order) VALUES
('bank','Bank Transfer','Bank: [Your Bank Name]\nAccount Name: Amir Nazir\nIBAN: [Your IBAN]\nSWIFT: [SWIFT Code]',1),
('wallet','Mobile Wallet','Wallet: [Provider]\nNumber: [Your Wallet Number]\nName: Amir Nazir',2);

-- 5. Subscriptions + proofs
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  proof_path text,
  user_note text,
  admin_note text,
  amount numeric(12,2),
  currency text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subs" ON public.subscriptions FOR SELECT USING (auth.uid()=user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own subs" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Admins update subs" ON public.subscriptions FOR UPDATE USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Email settings + log (admin only)
CREATE TABLE public.email_settings (
  id int PRIMARY KEY DEFAULT 1,
  smtp_host text,
  smtp_port int DEFAULT 587,
  smtp_user text,
  smtp_pass text,
  smtp_secure boolean DEFAULT false,
  from_name text DEFAULT 'Amir Nazir',
  from_email text,
  enabled boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_settings_singleton CHECK (id=1)
);
INSERT INTO public.email_settings(id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email settings" ON public.email_settings FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  template text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read email log" ON public.email_log FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert email log" ON public.email_log FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));

-- 7. Storage bucket for payment proofs (private)
INSERT INTO storage.buckets(id,name,public) VALUES ('payment-proofs','payment-proofs',false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own proofs" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id='payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users read own proofs" ON storage.objects FOR SELECT
  USING (bucket_id='payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(),'admin')));
CREATE POLICY "Admins manage proofs" ON storage.objects FOR ALL
  USING (bucket_id='payment-proofs' AND has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id='payment-proofs' AND has_role(auth.uid(),'admin'));
