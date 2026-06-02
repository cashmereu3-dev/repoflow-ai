export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string | null
          subscription_tier: string | null
          max_agents: number | null
          max_assignments: number | null
          is_active: boolean | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string | null
          subscription_tier?: string | null
          max_agents?: number | null
          max_assignments?: number | null
          is_active?: boolean | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string | null
          subscription_tier?: string | null
          max_agents?: number | null
          max_assignments?: number | null
          is_active?: boolean | null
          settings?: Json | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          is_active: boolean | null
          last_seen_at: string | null
          preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          organization_id?: string | null
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean | null
          last_seen_at?: string | null
          preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean | null
          last_seen_at?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
      }
      borrowers: {
        Row: {
          id: string
          organization_id: string
          profile_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          ssn_last4: string | null
          date_of_birth: string | null
          driver_license: string | null
          current_address: string | null
          address_history: Json | null
          employer: string | null
          employer_address: string | null
          employer_phone: string | null
          references: Json | null
          credit_score: number | null
          notes: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          profile_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          ssn_last4?: string | null
          date_of_birth?: string | null
          driver_license?: string | null
          current_address?: string | null
          address_history?: Json | null
          employer?: string | null
          employer_address?: string | null
          employer_phone?: string | null
          references?: Json | null
          credit_score?: number | null
          notes?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          organization_id?: string
          profile_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          ssn_last4?: string | null
          date_of_birth?: string | null
          driver_license?: string | null
          current_address?: string | null
          address_history?: Json | null
          employer?: string | null
          employer_address?: string | null
          employer_phone?: string | null
          references?: Json | null
          credit_score?: number | null
          notes?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          organization_id: string
          vin: string
          year: number | null
          make: string | null
          model: string | null
          trim: string | null
          color: string | null
          license_plate: string | null
          license_state: string | null
          mileage: number | null
          condition: string | null
          estimated_value: number | null
          lienholder: string | null
          insurance_company: string | null
          insurance_policy: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          vin: string
          year?: number | null
          make?: string | null
          model?: string | null
          trim?: string | null
          color?: string | null
          license_plate?: string | null
          license_state?: string | null
          mileage?: number | null
          condition?: string | null
          estimated_value?: number | null
          lienholder?: string | null
          insurance_company?: string | null
          insurance_policy?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          vin?: string
          year?: number | null
          make?: string | null
          model?: string | null
          trim?: string | null
          color?: string | null
          license_plate?: string | null
          license_state?: string | null
          mileage?: number | null
          condition?: string | null
          estimated_value?: number | null
          lienholder?: string | null
          insurance_company?: string | null
          insurance_policy?: string | null
          updated_at?: string | null
        }
      }
      agents: {
        Row: {
          id: string
          profile_id: string
          organization_id: string
          license_number: string | null
          license_state: string | null
          license_expires_at: string | null
          service_area: Json | null
          is_available: boolean | null
          current_location: Json | null
          last_gps_at: string | null
          total_recoveries: number | null
          recovery_rate: number | null
          rating: number | null
          vehicle_info: Json | null
          certifications: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          organization_id: string
          license_number?: string | null
          license_state?: string | null
          license_expires_at?: string | null
          service_area?: Json | null
          is_available?: boolean | null
          current_location?: Json | null
          last_gps_at?: string | null
          total_recoveries?: number | null
          recovery_rate?: number | null
          rating?: number | null
          vehicle_info?: Json | null
          certifications?: Json | null
        }
        Update: {
          is_available?: boolean | null
          current_location?: Json | null
          last_gps_at?: string | null
          total_recoveries?: number | null
          recovery_rate?: number | null
          rating?: number | null
          updated_at?: string | null
        }
      }
      assignments: {
        Row: {
          id: string
          organization_id: string
          borrower_id: string
          vehicle_id: string
          assigned_agent_id: string | null
          created_by: string
          status: Database['public']['Enums']['assignment_status']
          priority: number | null
          loan_balance: number | null
          loan_number: string | null
          lender_name: string | null
          redemption_amount: number | null
          special_instructions: string | null
          internal_notes: string | null
          recovery_probability: number | null
          recovery_probability_factors: Json | null
          due_date: string | null
          assigned_at: string | null
          located_at: string | null
          recovered_at: string | null
          closed_at: string | null
          last_known_address: string | null
          last_known_lat: number | null
          last_known_lng: number | null
          is_archived: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          borrower_id: string
          vehicle_id: string
          assigned_agent_id?: string | null
          created_by: string
          status?: Database['public']['Enums']['assignment_status']
          priority?: number | null
          loan_balance?: number | null
          loan_number?: string | null
          lender_name?: string | null
          redemption_amount?: number | null
          special_instructions?: string | null
          internal_notes?: string | null
          recovery_probability?: number | null
          recovery_probability_factors?: Json | null
          due_date?: string | null
          last_known_address?: string | null
          last_known_lat?: number | null
          last_known_lng?: number | null
        }
        Update: {
          assigned_agent_id?: string | null
          status?: Database['public']['Enums']['assignment_status']
          priority?: number | null
          loan_balance?: number | null
          redemption_amount?: number | null
          special_instructions?: string | null
          internal_notes?: string | null
          recovery_probability?: number | null
          recovery_probability_factors?: Json | null
          due_date?: string | null
          assigned_at?: string | null
          located_at?: string | null
          recovered_at?: string | null
          closed_at?: string | null
          last_known_address?: string | null
          last_known_lat?: number | null
          last_known_lng?: number | null
          is_archived?: boolean | null
          updated_at?: string | null
        }
      }
      uploads: {
        Row: {
          id: string
          organization_id: string
          assignment_id: string
          uploaded_by: string
          type: Database['public']['Enums']['upload_type']
          file_name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          duration_seconds: number | null
          gps_lat: number | null
          gps_lng: number | null
          gps_accuracy: number | null
          gps_address: string | null
          captured_at: string
          ai_extracted: boolean | null
          ai_vehicle_make: string | null
          ai_vehicle_model: string | null
          ai_vehicle_color: string | null
          ai_vin: string | null
          ai_license_plate: string | null
          ai_address: string | null
          ai_damage_notes: string | null
          ai_confidence: number | null
          ai_raw_response: Json | null
          ai_processed_at: string | null
          notes: string | null
          is_archived: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          assignment_id: string
          uploaded_by: string
          type: Database['public']['Enums']['upload_type']
          file_name: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          duration_seconds?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          gps_accuracy?: number | null
          gps_address?: string | null
          captured_at?: string
          notes?: string | null
        }
        Update: {
          ai_extracted?: boolean | null
          ai_vehicle_make?: string | null
          ai_vehicle_model?: string | null
          ai_vehicle_color?: string | null
          ai_vin?: string | null
          ai_license_plate?: string | null
          ai_address?: string | null
          ai_damage_notes?: string | null
          ai_confidence?: number | null
          ai_raw_response?: Json | null
          ai_processed_at?: string | null
          notes?: string | null
          is_archived?: boolean | null
        }
      }
      recoveries: {
        Row: {
          id: string
          organization_id: string
          assignment_id: string
          agent_id: string
          vehicle_id: string
          recovery_type: string | null
          recovery_address: string | null
          recovery_lat: number | null
          recovery_lng: number | null
          recovered_at: string
          vehicle_condition: string | null
          damage_noted: boolean | null
          damage_description: string | null
          mileage_at_recovery: number | null
          report_generated: boolean | null
          report_url: string | null
          impound_lot: string | null
          impound_address: string | null
          impound_phone: string | null
          storage_per_day: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          assignment_id: string
          agent_id: string
          vehicle_id: string
          recovery_type?: string | null
          recovery_address?: string | null
          recovery_lat?: number | null
          recovery_lng?: number | null
          recovered_at?: string
          vehicle_condition?: string | null
          damage_noted?: boolean | null
          damage_description?: string | null
          mileage_at_recovery?: number | null
          impound_lot?: string | null
          impound_address?: string | null
          impound_phone?: string | null
          storage_per_day?: number | null
          notes?: string | null
        }
        Update: {
          vehicle_condition?: string | null
          damage_noted?: boolean | null
          damage_description?: string | null
          report_generated?: boolean | null
          report_url?: string | null
          impound_lot?: string | null
          impound_address?: string | null
          impound_phone?: string | null
          storage_per_day?: number | null
          notes?: string | null
          updated_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_data: Json | null
          new_data: Json | null
          diff: Json | null
          ip_address: string | null
          user_agent: string | null
          request_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          diff?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
        }
        Update: Record<string, never>
      }
      messages: {
        Row: {
          id: string
          organization_id: string
          assignment_id: string | null
          sender_id: string
          recipient_id: string
          subject: string | null
          body: string
          status: Database['public']['Enums']['message_status']
          attachments: Json | null
          read_at: string | null
          is_archived: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          assignment_id?: string | null
          sender_id: string
          recipient_id: string
          subject?: string | null
          body: string
          status?: Database['public']['Enums']['message_status']
          attachments?: Json | null
        }
        Update: {
          status?: Database['public']['Enums']['message_status']
          read_at?: string | null
          is_archived?: boolean | null
        }
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          body: string
          action_url: string | null
          channel: Database['public']['Enums']['notification_channel']
          status: Database['public']['Enums']['notification_status']
          resource_type: string | null
          resource_id: string | null
          read_at: string | null
          sent_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          body: string
          action_url?: string | null
          channel?: Database['public']['Enums']['notification_channel']
          status?: Database['public']['Enums']['notification_status']
          resource_type?: string | null
          resource_id?: string | null
        }
        Update: {
          status?: Database['public']['Enums']['notification_status']
          read_at?: string | null
          sent_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          organization_id: string
          assignment_id: string
          borrower_id: string
          amount: number
          payment_type: string | null
          status: Database['public']['Enums']['payment_status']
          payment_method: string | null
          reference_number: string | null
          notes: string | null
          requested_at: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          assignment_id: string
          borrower_id: string
          amount: number
          payment_type?: string | null
          status?: Database['public']['Enums']['payment_status']
          payment_method?: string | null
          reference_number?: string | null
          notes?: string | null
        }
        Update: {
          status?: Database['public']['Enums']['payment_status']
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          notes?: string | null
          updated_at?: string | null
        }
      }
      gps_events: {
        Row: {
          id: string
          organization_id: string
          agent_id: string
          assignment_id: string | null
          lat: number
          lng: number
          accuracy: number | null
          altitude: number | null
          speed: number | null
          heading: number | null
          address: string | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          agent_id: string
          assignment_id?: string | null
          lat: number
          lng: number
          accuracy?: number | null
          altitude?: number | null
          speed?: number | null
          heading?: number | null
          address?: string | null
          recorded_at?: string | null
        }
        Update: Record<string, never>
      }
    }
    Views: {
      assignment_summary: {
        Row: {
          id: string | null
          organization_id: string | null
          status: Database['public']['Enums']['assignment_status'] | null
          priority: number | null
          loan_balance: number | null
          recovery_probability: number | null
          created_at: string | null
          assigned_at: string | null
          recovered_at: string | null
          due_date: string | null
          borrower_name: string | null
          borrower_phone: string | null
          vehicle_description: string | null
          vin: string | null
          license_plate: string | null
          color: string | null
          agent_name: string | null
          agent_available: boolean | null
        }
      }
    }
    Enums: {
      user_role: 'administrator' | 'lender' | 'repo_manager' | 'repo_agent' | 'borrower'
      assignment_status: 'new' | 'assigned' | 'in_progress' | 'located' | 'contact_made' | 'recovered' | 'voluntary_surrender' | 'closed'
      upload_type: 'photo' | 'video' | 'document' | 'voice_note'
      message_status: 'sent' | 'delivered' | 'read'
      payment_status: 'pending' | 'approved' | 'denied' | 'completed'
      notification_channel: 'email' | 'push' | 'sms' | 'in_app'
      notification_status: 'pending' | 'sent' | 'failed'
    }
  }
}
