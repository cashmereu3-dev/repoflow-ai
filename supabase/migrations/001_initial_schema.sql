-- RepoFlow AI – Complete Database Schema
-- Migration: 001_initial_schema.sql

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('administrator', 'lender', 'repo_manager', 'repo_agent', 'borrower');

CREATE TYPE assignment_status AS ENUM (
  'new',
  'assigned',
  'in_progress',
  'located',
  'contact_made',
  'recovered',
  'voluntary_surrender',
  'closed'
);

CREATE TYPE upload_type AS ENUM ('photo', 'video', 'document', 'voice_note');

CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'denied', 'completed');

CREATE TYPE notification_channel AS ENUM ('email', 'push', 'sms', 'in_app');

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- ============================================================
-- ORGANIZATIONS (Lender Companies)
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  max_agents INTEGER DEFAULT 10,
  max_assignments INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ============================================================
-- PROFILES (Users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'borrower',
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================
-- BORROWERS
-- ============================================================
CREATE TABLE borrowers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  ssn_last4 TEXT,
  date_of_birth DATE,
  driver_license TEXT,
  current_address TEXT,
  address_history JSONB DEFAULT '[]',
  employer TEXT,
  employer_address TEXT,
  employer_phone TEXT,
  "references" JSONB DEFAULT '[]',
  credit_score INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_borrowers_organization_id ON borrowers(organization_id);
CREATE INDEX idx_borrowers_email ON borrowers(email);
CREATE INDEX idx_borrowers_name ON borrowers USING GIN (to_tsvector('english', first_name || ' ' || last_name));

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vin TEXT NOT NULL,
  year INTEGER,
  make TEXT,
  model TEXT,
  trim TEXT,
  color TEXT,
  license_plate TEXT,
  license_state TEXT,
  mileage INTEGER,
  condition TEXT,
  estimated_value DECIMAL(12, 2),
  lienholder TEXT,
  insurance_company TEXT,
  insurance_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_organization_id ON vehicles(organization_id);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE UNIQUE INDEX idx_vehicles_vin_org ON vehicles(vin, organization_id);

-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  license_number TEXT,
  license_state TEXT,
  license_expires_at DATE,
  service_area JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT TRUE,
  current_location JSONB,
  last_gps_at TIMESTAMPTZ,
  total_recoveries INTEGER DEFAULT 0,
  recovery_rate DECIMAL(5, 2) DEFAULT 0,
  rating DECIMAL(3, 2),
  vehicle_info JSONB DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_organization_id ON agents(organization_id);
CREATE INDEX idx_agents_profile_id ON agents(profile_id);
CREATE INDEX idx_agents_is_available ON agents(is_available);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Status lifecycle
  status assignment_status NOT NULL DEFAULT 'new',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Financial
  loan_balance DECIMAL(12, 2),
  loan_number TEXT,
  lender_name TEXT,
  redemption_amount DECIMAL(12, 2),
  
  -- Instructions
  special_instructions TEXT,
  internal_notes TEXT,
  
  -- Recovery info
  recovery_probability INTEGER DEFAULT 50 CHECK (recovery_probability BETWEEN 0 AND 100),
  recovery_probability_factors JSONB DEFAULT '{}',
  
  -- Timing
  due_date DATE,
  assigned_at TIMESTAMPTZ,
  located_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Location data
  last_known_address TEXT,
  last_known_lat DECIMAL(10, 8),
  last_known_lng DECIMAL(11, 8),
  
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_organization_id ON assignments(organization_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_agent_id ON assignments(assigned_agent_id);
CREATE INDEX idx_assignments_borrower_id ON assignments(borrower_id);
CREATE INDEX idx_assignments_vehicle_id ON assignments(vehicle_id);
CREATE INDEX idx_assignments_created_at ON assignments(created_at DESC);
CREATE INDEX idx_assignments_priority ON assignments(priority DESC, created_at ASC);

-- ============================================================
-- UPLOADS
-- ============================================================
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  
  -- File info
  type upload_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  duration_seconds INTEGER,
  
  -- GPS & Timestamp (mandatory)
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  gps_accuracy DECIMAL(8, 2),
  gps_address TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- AI Extraction Results
  ai_extracted BOOLEAN DEFAULT FALSE,
  ai_vehicle_make TEXT,
  ai_vehicle_model TEXT,
  ai_vehicle_color TEXT,
  ai_vin TEXT,
  ai_license_plate TEXT,
  ai_address TEXT,
  ai_damage_notes TEXT,
  ai_confidence DECIMAL(3, 2),
  ai_raw_response JSONB,
  ai_processed_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uploads_assignment_id ON uploads(assignment_id);
CREATE INDEX idx_uploads_organization_id ON uploads(organization_id);
CREATE INDEX idx_uploads_type ON uploads(type);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX idx_uploads_captured_at ON uploads(captured_at DESC);

-- ============================================================
-- RECOVERIES
-- ============================================================
CREATE TABLE recoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID UNIQUE NOT NULL REFERENCES assignments(id) ON DELETE RESTRICT,
  agent_id UUID NOT NULL REFERENCES agents(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  
  -- Recovery details
  recovery_type TEXT DEFAULT 'involuntary' CHECK (recovery_type IN ('involuntary', 'voluntary')),
  recovery_address TEXT,
  recovery_lat DECIMAL(10, 8),
  recovery_lng DECIMAL(11, 8),
  recovered_at TIMESTAMPTZ NOT NULL,
  
  -- Vehicle condition
  vehicle_condition TEXT,
  damage_noted BOOLEAN DEFAULT FALSE,
  damage_description TEXT,
  mileage_at_recovery INTEGER,
  
  -- Documentation
  report_generated BOOLEAN DEFAULT FALSE,
  report_url TEXT,
  
  -- Storage/Impound
  impound_lot TEXT,
  impound_address TEXT,
  impound_phone TEXT,
  storage_per_day DECIMAL(8, 2),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recoveries_organization_id ON recoveries(organization_id);
CREATE INDEX idx_recoveries_agent_id ON recoveries(agent_id);
CREATE INDEX idx_recoveries_recovered_at ON recoveries(recovered_at DESC);

-- ============================================================
-- AUDIT LOGS (Immutable)
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Action details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Data snapshot
  old_data JSONB,
  new_data JSONB,
  diff JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- GPS (for agent actions)
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs are append-only: no UPDATE or DELETE allowed via RLS
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  
  subject TEXT,
  body TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_organization_id ON messages(organization_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_assignment_id ON messages(assignment_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  channel notification_channel DEFAULT 'in_app',
  status notification_status DEFAULT 'pending',
  
  -- Context
  resource_type TEXT,
  resource_id UUID,
  
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  
  amount DECIMAL(12, 2) NOT NULL,
  payment_type TEXT DEFAULT 'reinstatement' CHECK (payment_type IN ('reinstatement', 'redemption', 'storage', 'other')),
  status payment_status DEFAULT 'pending',
  
  -- Payment details
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_assignment_id ON payments(assignment_id);
CREATE INDEX idx_payments_borrower_id ON payments(borrower_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- GPS EVENTS
-- ============================================================
CREATE TABLE gps_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  altitude DECIMAL(8, 2),
  speed DECIMAL(6, 2),
  heading DECIMAL(5, 2),
  address TEXT,
  
  recorded_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (recorded_at);

CREATE TABLE gps_events_2026 PARTITION OF gps_events
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE gps_events_2027 PARTITION OF gps_events
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

CREATE INDEX idx_gps_events_agent_id ON gps_events(agent_id);
CREATE INDEX idx_gps_events_organization_id ON gps_events(organization_id);
CREATE INDEX idx_gps_events_recorded_at ON gps_events(recorded_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_borrowers_updated_at BEFORE UPDATE ON borrowers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recoveries_updated_at BEFORE UPDATE ON recoveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-AUDIT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_assignments AFTER INSERT OR UPDATE OR DELETE ON assignments FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_recoveries AFTER INSERT OR UPDATE OR DELETE ON recoveries FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW assignment_summary AS
SELECT
  a.id,
  a.organization_id,
  a.status,
  a.priority,
  a.loan_balance,
  a.recovery_probability,
  a.created_at,
  a.assigned_at,
  a.recovered_at,
  a.due_date,
  -- Borrower
  b.first_name || ' ' || b.last_name AS borrower_name,
  b.phone AS borrower_phone,
  -- Vehicle
  v.year || ' ' || v.make || ' ' || v.model AS vehicle_description,
  v.vin,
  v.license_plate,
  v.color,
  -- Agent
  p.full_name AS agent_name,
  ag.is_available AS agent_available
FROM assignments a
JOIN borrowers b ON b.id = a.borrower_id
JOIN vehicles v ON v.id = a.vehicle_id
LEFT JOIN agents ag ON ag.id = a.assigned_agent_id
LEFT JOIN profiles p ON p.id = ag.profile_id;

-- ============================================================
-- SAMPLE DATA SEED (Remove in production)
-- ============================================================

-- Sample organization
INSERT INTO organizations (id, name, slug, subscription_tier)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'RepoFlow Demo Lender',
  'repoflow-demo',
  'enterprise'
);
