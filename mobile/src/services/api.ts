import { supabase } from '../supaconfig';

// Tipos TypeScript para as respostas da API
export interface PsychologistRecommendation {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  review_count: number;
  avatar_url: string | null;
  is_favorite: boolean;
}

export interface PsychologistSearch extends PsychologistRecommendation {
  consultation_price: number;
  payment_types: string[];
  session_types: string[];
}

export interface Appointment {
  id: string;
  psychologist_name: string;
  psychologist_avatar: string | null;
  appointment_date: string;
  appointment_time: string;
  session_type: string;
  payment_type: string;
  status: string;
  notes: string | null;
}

export interface AgendaItem {
  id: string;
  patient_name: string;
  patient_avatar: string | null;
  appointment_time: string;
  session_type: string;
  payment_type: string;
  status: string;
  notes: string | null;
}

export interface Patient {
  id: string;
  name: string;
  avatar_url: string | null;
  last_session_date: string | null;
  next_session_date: string | null;
  next_session_time: string | null;
  status: string;
  session_type: string | null;
}

export interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// Serviços de API
export class LuminaAPI {
  
  // Obter recomendações de psicólogos para a HomeScreen do paciente
  static async getPsychologistRecommendations(patientId?: string): Promise<PsychologistRecommendation[]> {
    const { data, error } = await supabase.rpc('get_psychologist_recommendations', {
      patient_uuid: patientId || null
    });
    
    if (error) throw error;
    return data || [];
  }

  // Buscar psicólogos com filtros
  static async searchPsychologists(
    searchQuery?: string, 
    specialtyFilter?: string, 
    patientId?: string
  ): Promise<PsychologistSearch[]> {
    const { data, error } = await supabase.rpc('search_psychologists', {
      search_query: searchQuery || null,
      specialty_filter: specialtyFilter || null,
      patient_uuid: patientId || null
    });
    
    if (error) throw error;
    return data || [];
  }

  // Obter consultas do paciente
  static async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase.rpc('get_patient_appointments', {
      patient_uuid: patientId
    });
    
    if (error) throw error;
    return data || [];
  }

  // Obter agenda do psicólogo
  static async getPsychologistAgenda(psychologistId: string, date?: string): Promise<AgendaItem[]> {
    const { data, error } = await supabase.rpc('get_psychologist_agenda', {
      psychologist_uuid: psychologistId,
      target_date: date || new Date().toISOString().split('T')[0]
    });
    
    if (error) throw error;
    return data || [];
  }

  // Obter pacientes do psicólogo
  static async getPsychologistPatients(psychologistId: string): Promise<Patient[]> {
    const { data, error } = await supabase.rpc('get_psychologist_patients', {
      psychologist_uuid: psychologistId
    });
    
    if (error) throw error;
    return data || [];
  }

  // Obter conversas do usuário
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase.rpc('get_user_conversations', {
      user_uuid: userId
    });
    
    if (error) throw error;
    return data || [];
  }

  // Obter mensagens de uma conversa
  static async getConversationMessages(user1Id: string, user2Id: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase.rpc('get_conversation_messages', {
      user1_uuid: user1Id,
      user2_uuid: user2Id,
      limit_count: limit
    });
    
    if (error) throw error;
    return data || [];
  }

  // Obter notificações do usuário
  static async getUserNotifications(userId: string, limit = 10): Promise<Notification[]> {
    const { data, error } = await supabase.rpc('get_user_notifications', {
      user_uuid: userId,
      limit_count: limit
    });
    
    if (error) throw error;
    return data || [];
  }

  // Adicionar/remover favorito
  static async toggleFavorite(patientId: string, psychologistId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('toggle_favorite', {
      patient_uuid: patientId,
      psychologist_uuid: psychologistId
    });
    
    if (error) throw error;
    return data;
  }

  // Criar novo agendamento
  static async createAppointment(
    patientId: string,
    psychologistId: string,
    appointmentDate: string,
    appointmentTime: string,
    sessionType: string,
    paymentType: string,
    notes?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_appointment', {
      patient_uuid: patientId,
      psychologist_uuid: psychologistId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      session_type: sessionType,
      payment_type: paymentType,
      notes: notes || null
    });
    
    if (error) throw error;
    return data;
  }

  // Enviar mensagem
  static async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content
      });
    
    if (error) throw error;
  }

  // Marcar mensagens como lidas
  static async markMessagesAsRead(userId: string, senderId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', senderId);
    
    if (error) throw error;
  }

  // Marcar notificação como lida
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  }

  // Atualizar status de consulta
  static async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);
    
    if (error) throw error;
  }

  // Obter perfil do usuário
  static async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Atualizar perfil do usuário
  static async updateUserProfile(userId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Obter dados específicos do psicólogo
  static async getPsychologistData(psychologistId: string): Promise<any> {
    const { data, error } = await supabase
      .from('psychologists')
      .select('*')
      .eq('id', psychologistId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Atualizar dados do psicólogo
  static async updatePsychologistData(psychologistId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('psychologists')
      .upsert({ id: psychologistId, ...updates });
    
    if (error) throw error;
  }

  // Subscrever a mudanças em tempo real
  static subscribeToMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToAppointments(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `psychologist_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}

