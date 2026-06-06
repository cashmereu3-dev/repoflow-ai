-- Migration: 002_auth_trigger_and_rls.sql
-- Description: Create auth trigger for profiles/organizations, enable RLS, and add tenant/role-based security policies.

-- ============================================================
-- 1. AUTH TRIGGER FOR AUTO-REGISTRATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
  org_slug TEXT;
  user_role public.user_role;
  full_name TEXT;
BEGIN
  -- Read from raw user metadata
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'borrower'::public.user_role);
  org_name := NEW.raw_user_meta_data->>'organization_name';

  -- Create or resolve organization
  IF org_name IS NOT NULL AND org_name != '' THEN
    org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
    
    -- Handle slug collisions by appending a short random hash
    IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = org_slug) THEN
      org_slug := org_slug || '-' || substring(md5(random()::text) from 1 for 6);
    END IF;

    INSERT INTO public.organizations (name, slug)
    VALUES (org_name, org_slug)
    RETURNING id INTO org_id;
  ELSE
    -- If no organization name is provided (e.g. for agents/borrowers registering)
    -- assign to the first existing organization or create a default one
    SELECT id INTO org_id FROM public.organizations ORDER BY created_at LIMIT 1;
    IF org_id IS NULL THEN
      INSERT INTO public.organizations (name, slug)
      VALUES ('Default Organization', 'default-org')
      RETURNING id INTO org_id;
    END IF;
  END IF;

  -- Create profile row
  INSERT INTO public.profiles (id, organization_id, email, full_name, role)
  VALUES (NEW.id, org_id, NEW.email, full_name, user_role);

  -- If the role is repo_agent, also insert into the agents table
  IF user_role = 'repo_agent'::public.user_role THEN
    INSERT INTO public.agents (profile_id, organization_id)
    VALUES (NEW.id, org_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- 3. ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- --- ORGANIZATIONS POLICIES ---
CREATE POLICY select_org ON public.organizations FOR SELECT 
  USING (id = public.get_auth_organization_id());
  
CREATE POLICY update_org ON public.organizations FOR UPDATE 
  USING (id = public.get_auth_organization_id());

-- --- PROFILES POLICIES ---
CREATE POLICY select_profiles ON public.profiles FOR SELECT 
  USING (organization_id = public.get_auth_organization_id() OR id = auth.uid());
  
CREATE POLICY update_profiles ON public.profiles FOR UPDATE 
  USING (id = auth.uid());

-- --- BORROWERS POLICIES ---
CREATE POLICY select_borrowers ON public.borrowers FOR SELECT 
  USING (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'repo_agent' AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'borrower' AND profile_id = auth.uid())
  );

CREATE POLICY write_borrowers ON public.borrowers FOR ALL
  USING (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id());

-- --- VEHICLES POLICIES ---
CREATE POLICY select_vehicles ON public.vehicles FOR SELECT 
  USING (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'repo_agent' AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'borrower' AND EXISTS (
      SELECT 1 FROM public.assignments a 
      JOIN public.borrowers b ON b.id = a.borrower_id 
      WHERE a.vehicle_id = public.vehicles.id AND b.profile_id = auth.uid()
    ))
  );

CREATE POLICY write_vehicles ON public.vehicles FOR ALL
  USING (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id());

-- --- AGENTS POLICIES ---
CREATE POLICY select_agents ON public.agents FOR SELECT 
  USING (organization_id = public.get_auth_organization_id());

CREATE POLICY write_agents ON public.agents FOR ALL
  USING (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id());

-- --- ASSIGNMENTS POLICIES ---
CREATE POLICY select_assignments ON public.assignments FOR SELECT 
  USING (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'repo_agent' AND assigned_agent_id = (SELECT id FROM public.agents WHERE profile_id = auth.uid()))
    OR
    (public.get_auth_role() = 'borrower' AND EXISTS (
      SELECT 1 FROM public.borrowers b 
      WHERE b.id = borrower_id AND b.profile_id = auth.uid()
    ))
  );

CREATE POLICY write_assignments ON public.assignments FOR ALL
  USING (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id());

-- --- UPLOADS POLICIES ---
CREATE POLICY select_uploads ON public.uploads FOR SELECT 
  USING (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'repo_agent' AND organization_id = public.get_auth_organization_id())
  );

CREATE POLICY insert_uploads ON public.uploads FOR INSERT 
  WITH CHECK (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (public.get_auth_role() = 'repo_agent' AND organization_id = public.get_auth_organization_id())
  );

-- --- RECOVERIES POLICIES ---
CREATE POLICY select_recoveries ON public.recoveries FOR SELECT 
  USING (organization_id = public.get_auth_organization_id());

CREATE POLICY write_recoveries ON public.recoveries FOR ALL
  USING (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id());

-- --- AUDIT LOGS POLICIES ---
CREATE POLICY select_audit_logs ON public.audit_logs FOR SELECT 
  USING (organization_id = public.get_auth_organization_id());

-- --- MESSAGES POLICIES ---
CREATE POLICY select_messages ON public.messages FOR SELECT 
  USING (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

CREATE POLICY insert_messages ON public.messages FOR INSERT 
  WITH CHECK (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (sender_id = auth.uid())
  );

-- --- PAYMENTS POLICIES ---
CREATE POLICY select_payments ON public.payments FOR SELECT 
  USING (
    (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id())
    OR
    (EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.borrowers b ON b.id = a.borrower_id
      WHERE a.id = assignment_id AND b.profile_id = auth.uid()
    ))
  );

CREATE POLICY write_payments ON public.payments FOR ALL
  USING (public.get_auth_role() IN ('administrator', 'lender', 'repo_manager') AND organization_id = public.get_auth_organization_id());
