import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Appbar,
  Text,
  Avatar,
  Button,
  ActivityIndicator,
  Modal,
  Portal,
  Provider,
  Card,
  TextInput,
  Snackbar,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supaconfig";
import { LuminaAPI, AgendaItem } from "../../services/api";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_PADDING = 6;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - CELL_PADDING * 2 - 16) / 7);

function formatDateKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function parseDateKeyToLocalDate(dateKey: string) {
  const parts = dateKey.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d);
}

function extractDateKeyFromAppointmentTime(appointmentTime: string) {
  if (!appointmentTime) return "";
  if (appointmentTime.includes("T")) return appointmentTime.split("T")[0];
  if (appointmentTime.includes(" ")) return appointmentTime.split(" ")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(appointmentTime)) return appointmentTime;
  return "";
}

function getDateKeyFromAppointment(a: any) {
  if (a.appointment_date) {
    if (typeof a.appointment_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(a.appointment_date)) {
      return a.appointment_date;
    }
    try {
      return formatDateKeyFromDate(new Date(a.appointment_date));
    } catch {}
  }
  if (a.appointment_time) {
    return extractDateKeyFromAppointmentTime(a.appointment_time);
  }
  return "";
}

function getTimeFromAppointment(a: any) {
  if (a.appointment_time && /^\d{2}:\d{2}(:\d{2})?$/.test(a.appointment_time)) {
    return a.appointment_time.slice(0, 5);
  }
  if (a.appointment_time && (a.appointment_time.includes("T") || a.appointment_time.includes(" "))) {
    const t = a.appointment_time.includes("T")
      ? a.appointment_time.slice(11, 16)
      : a.appointment_time.slice(11, 16);
    return t;
  }
  return (a.appointment_time || "").slice(0, 5) || "";
}

export default function PsicoAgendaCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, AgendaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AgendaItem | null>(null);
  const navigation = useNavigation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formPatientId, setFormPatientId] = useState("");
  const [formDate, setFormDate] = useState(""); // YYYY-MM-DD
  const [formTime, setFormTime] = useState(""); // HH:MM
  const [formSessionType, setFormSessionType] = useState<"online" | "presencial">("presencial");
  const [formPaymentType, setFormPaymentType] = useState<"particular" | "convenio">("particular");
  const [formNotes, setFormNotes] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          setUserId("");
        }
      } catch (err) {
        console.error("Erro ao obter usuário:", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadMonthAgenda(userId, currentMonth);
  }, [userId, currentMonth]);

  const loadMonthAgenda = async (psychologistId: string, monthDate: Date) => {
    setLoading(true);
    try {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1; // 1-12
      let monthAppointments: any[] = [];

      try {
        if (typeof LuminaAPI.getPsychologistAgendaForMonth === "function") {
          monthAppointments = await LuminaAPI.getPsychologistAgendaForMonth(psychologistId, year, month);
          console.log("API MONTH RAW:", JSON.stringify(monthAppointments, null, 2));
        } else {
          throw new Error("No month API");
        }
      } catch (err) {
        // 2) Fallback: tentar buscar por dia (se API de dia existir)
        try {
          const daysInMonth = new Date(year, month, 0).getDate();
          const promises: Promise<any[]>[] = [];
          for (let d = 1; d <= daysInMonth; d++) {
            const dateString = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            if (typeof LuminaAPI.getPsychologistAgenda === "function") {
              promises.push(LuminaAPI.getPsychologistAgenda(psychologistId, dateString).catch(() => []));
            }
          }
          if (promises.length > 0) {
            const results = await Promise.all(promises);
            monthAppointments = results.flat();
          }
        } catch (err2) {
          console.warn("Fallback por dia falhou:", err2);
        }
      }

      if (!monthAppointments || monthAppointments.length === 0) {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        const { data: apptsData, error: apptsError } = await supabase
          .from("appointments")
          .select("*")
          .gte("appointment_date", startDate)
          .lte("appointment_date", endDate)
          .eq("psychologist_id", psychologistId);

          console.log("SUPABASE RAW DATA:", JSON.stringify(apptsData, null, 2));

        if (apptsError) {
          console.error("Erro supabase buscar appointments:", apptsError);
          throw apptsError;
        }

        monthAppointments = apptsData || [];

        // Enriquecer com dados do paciente (buscar profiles em lote)
        const patientIds = Array.from(new Set((monthAppointments || []).map((a: any) => a.patient_id))).filter(Boolean);
        if (patientIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", patientIds);

          if (!profilesError && profiles) {
            const profileMap: Record<string, any> = {};
            profiles.forEach((p: any) => (profileMap[p.id] = p));
            monthAppointments = monthAppointments.map((a: any) => {
              const prof = profileMap[a.patient_id];

              const patientName =
                prof?.full_name ||
                prof?.name ||
                prof?.display_name ||
                prof?.username ||
                a.patient_name ||
                "Paciente";

              const patientAvatar =
                prof?.avatar_url ||
                prof?.avatar ||
                prof?.photo_url ||
                prof?.picture ||
                a.patient_avatar ||
                "https://randomuser.me/api/portraits/women/1.jpg";

              return {
                ...a,
                patient_name: patientName,
                patient_avatar: patientAvatar,
                appointment_time: a.appointment_time ? String(a.appointment_time) : "",
              };
            });
          }
        }
      }

      const grouped: Record<string, any[]> = {};
      (monthAppointments || []).forEach((a: any) => {
        const dateKey = getDateKeyFromAppointment(a);
        if (!dateKey) return;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(a);
      });

      Object.keys(grouped).forEach((k) => {
        grouped[k].sort((x: any, y: any) => {
          const tx = getTimeFromAppointment(x) || "";
          const ty = getTimeFromAppointment(y) || "";
          return tx.localeCompare(ty);
        });
      });

      setAppointmentsByDate(grouped);
    } catch (error) {
      console.error("Erro ao carregar agenda do mês:", error);
      Alert.alert("Erro", "Não foi possível carregar a agenda do mês.");
      setAppointmentsByDate({});
    } finally {
      setLoading(false);
    }
  };

  const goToPrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const generateCalendarMatrix = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const matrix: Array<(Date | null)[]> = [];
    let row: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) row.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      row.push(new Date(year, month, day));
      if (row.length === 7) {
        matrix.push(row);
        row = [];
      }
    }

    if (row.length > 0) {
      while (row.length < 7) row.push(null);
      matrix.push(row);
    }

    return matrix;
  };

  const onPressDay = (date: Date | null) => {
    if (!date) return;
    const key = formatDateKeyFromDate(date);
    setSelectedDay(key);
    setSelectedAppointment(null);
    setDayModalVisible(true);
/*  console.log("Selected Date OBJ:", date);
    console.log(
      "Selected Date STRING:",
      `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`
    ); */
  };

  const closeDayModal = () => {
    setDayModalVisible(false);
    setSelectedDay(null);
    setSelectedAppointment(null);
  };

  const updateAppointmentStatus = async (newStatus: string) => {
    if (!selectedAppointment) return;
    try {
      if (typeof LuminaAPI.updateAppointmentStatus === "function") {
        await LuminaAPI.updateAppointmentStatus(selectedAppointment.id, newStatus);
      } else {
        const { error } = await supabase
          .from("appointments")
          .update({ status: newStatus })
          .eq("id", selectedAppointment.id);
        if (error) throw error;
      }
      setSnackbarMessage(`Consulta ${newStatus === "confirmed" ? "confirmada" : "cancelada"} com sucesso!`);
      await loadMonthAgenda(userId, currentMonth);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status da consulta.");
    }
  };

  const matrix = generateCalendarMatrix(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const validateDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const validateTime = (s: string) => /^\d{2}:\d{2}$/.test(s);

  const handleCreateAppointment = async () => {
    if (!formPatientId) return Alert.alert("Erro", "Informe o ID do paciente.");
    if (!validateDate(formDate)) return Alert.alert("Erro", "Data inválida. Use YYYY-MM-DD.");
    if (!validateTime(formTime)) return Alert.alert("Erro", "Hora inválida. Use HH:MM.");
    if (!userId) return Alert.alert("Erro", "Usuário não autenticado.");

    try {
      if (typeof LuminaAPI.createAppointment === "function") {
        await LuminaAPI.createAppointment(
          formPatientId,
          userId,
          formDate,
          formTime,
          formSessionType,
          formPaymentType,
          formNotes
        );
      } else {
        const { error } = await supabase.from("appointments").insert([
          {
            patient_id: formPatientId,
            psychologist_id: userId,
            appointment_date: formDate,
            appointment_time: formTime,
            session_type: formSessionType,
            payment_type: formPaymentType,
            notes: formNotes,
          },
        ]);
        if (error) throw error;
      }

      setIsModalVisible(false);
      setSnackbarMessage("Agendamento criado com sucesso!");
      await loadMonthAgenda(userId, currentMonth);
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      Alert.alert("Erro", "Não foi possível criar o agendamento.");
    }
  };

  const renderDayCell = (date: Date | null, idx: string) => {
    const isToday = date ? new Date().toDateString() === date.toDateString() : false;
    const dateKey = date ? formatDateKeyFromDate(date) : null;
    const dayAppointments = dateKey && appointmentsByDate[dateKey] ? appointmentsByDate[dateKey] : [];

    const visible = dayAppointments.slice(0, 2);
    const extra = dayAppointments.length - visible.length;

    return (
      <TouchableOpacity
        key={idx}
        style={[styles.cell, date ? styles.cellActive : styles.cellInactive, isToday && styles.todayCell]}
        onPress={() => onPressDay(date)}
        activeOpacity={date ? 0.8 : 1}
      >
        <View style={styles.cellHeader}>
          <Text style={[styles.cellHeaderText, !date && styles.cellHeaderTextInactive]}>{date ? date.getDate() : ""}</Text>
        </View>

        <View style={styles.eventsContainer}>
          {visible.map((ev) => {
            const bgColor = ev.status === "confirmed" ? "#dcedc8" : ev.status === "pending" ? "#fff9c4" : "#ffe0e0";
            return (
              <View key={`${ev.id}-${ev.appointment_time}-${ev.patient_id}`} style={[styles.eventCard, { backgroundColor: bgColor }]}>
                <Avatar.Image size={28} source={{ uri: ev.patient_avatar || "https://randomuser.me/api/portraits/men/2.jpg" }} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text numberOfLines={1} style={styles.eventTime}>
                    {getTimeFromAppointment(ev)}
                  </Text>
                  <Text numberOfLines={1} style={styles.eventPatient}>
                    {ev.patient_name}
                  </Text>
                </View>
              </View>
            );
          })}

          {extra > 0 && (
            <View style={styles.moreBadge}>
              <Text style={styles.moreBadgeText}>+{extra} mais</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayModalContent = () => {
    if (!selectedDay) return null;
    const dayList = appointmentsByDate[selectedDay] || [];

    if (selectedAppointment) {
      return (
        <View>
          <Text style={styles.modalTitle}>Gerenciar Consulta</Text>
          <Text style={styles.modalPatientName}>{selectedAppointment.patient_name}</Text>
          <Text style={styles.modalDetails}>Horário: {getTimeFromAppointment(selectedAppointment)}</Text>
          <Text style={styles.modalDetails}>
            Tipo: {selectedAppointment.session_type === "online" ? "Online" : "Presencial"}
          </Text>
          <Text style={styles.modalDetails}>
            Pagamento: {selectedAppointment.payment_type === "particular" ? "Particular" : "Convênio"}
          </Text>

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => updateAppointmentStatus("cancelled")} style={styles.modalButton} color="#F44336">
              Cancelar
            </Button>
            <Button mode="contained" onPress={() => updateAppointmentStatus("confirmed")} style={styles.modalButton}>
              Confirmar
            </Button>
          </View>

          <Button onPress={() => setSelectedAppointment(null)} style={{ marginTop: 12 }}>
            Voltar
          </Button>
        </View>
      );
    }

    const displayDate = parseDateKeyToLocalDate(selectedDay);

    return (
      <View>
        <Text style={styles.modalTitleDay}>
          {displayDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </Text>

        {dayList.length === 0 ? (
          <View style={{ alignItems: "center", padding: 24 }}>
            <MaterialIcons name="event-busy" size={48} color="#ccc" />
            <Text style={{ marginTop: 12 }}>Nenhuma consulta neste dia.</Text>
          </View>
        ) : (
          <FlatList
            data={dayList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <Card style={styles.dayListCard} onPress={() => setSelectedAppointment(item)}>
                <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar.Image size={40} source={{ uri: item.patient_avatar || "https://randomuser.me/api/portraits/men/1.jpg" }} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.modalTitle}>{item.patient_name}</Text>
                    <Text>
                      {getTimeFromAppointment(item)} • {item.session_type === "online" ? "Online" : "Presencial"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {item.status === "confirmed" && <MaterialIcons name="check-circle" size={20} color="#4caf50" />}
                    {item.status === "pending" && <MaterialIcons name="hourglass-empty" size={20} color="#FFC107" />}
                  </View>
                </Card.Content>
              </Card>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Portal>
          <Modal visible={dayModalVisible} onDismiss={closeDayModal} contentContainerStyle={styles.modalContainer}>
            {renderDayModalContent()}
          </Modal>
        </Portal>

        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => (navigation as any).goBack?.()} />
          <Appbar.Content title="Agendamentos" titleStyle={styles.headerTitle} />
        </Appbar.Header>

        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <MaterialIcons name="chevron-left" size={28} />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <MaterialIcons name="chevron-right" size={28} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView style={styles.calendarWrapper}>
            <View style={styles.weekdaysRow}>
              {["D", "S", "T", "Q", "Q", "S", "S"].map((w, i) => (
                <View key={`${w}-${i}`} style={[styles.weekdayCell, { width: CELL_SIZE }]}>
                  <Text style={styles.weekdayText}>{w}</Text>
                </View>
              ))}
            </View>

            <View style={styles.matrix}>
              {matrix.map((row, rIdx) => (
                <View key={`row-${rIdx}`} style={styles.row}>
                  {row.map((cell, cIdx) => renderDayCell(cell, `${rIdx}-${cIdx}`))}
                </View>
              ))}
            </View>

            <View style={{ height: 80 }}> 
              <Text style={styles.AppointHist}> Histórico de Agendamentos </Text>
            </View>
            
          </ScrollView>
          
        )}

        <Snackbar visible={!!snackbarMessage} onDismiss={() => setSnackbarMessage("")} duration={3000}>
          {snackbarMessage}
        </Snackbar>
 
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#f5f5f5", elevation: 0 },
  headerTitle: { fontWeight: "bold", fontSize: 20, marginTop: 6 },
  monthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  monthLabel: { fontSize: 18, fontWeight: "700", color: "#1976d2" },
  calendarWrapper: { paddingHorizontal: 6, paddingBottom: 80 },
  weekdaysRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: CELL_PADDING, marginTop: 8 },
  weekdayCell: { alignItems: "center", paddingVertical: 6 },
  weekdayText: { fontWeight: "600", color: "#666" },
  matrix: { marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: CELL_PADDING },
  cell: { width: CELL_SIZE, height: CELL_SIZE + 12, borderRadius: 10, padding: 6, marginBottom: 8, overflow: "hidden" },
  cellActive: { backgroundColor: "#fff" },
  cellInactive: { backgroundColor: "#fafafa" },
  todayCell: { borderWidth: 1.5, borderColor: "#1976d2" },
  cellHeader: { position: "absolute", top: 6, left: 8 },
  cellHeaderText: { fontSize: 12, fontWeight: "600", color: "#333" },
  cellHeaderTextInactive: { color: "#bbb" },
  eventsContainer: { marginTop: 14 },
  eventCard: { flexDirection: "row", alignSelf: "center", borderRadius: 8, padding: 6, marginBottom: 2, elevation: 1 },
  eventTime: { fontSize: 11, fontWeight: "700" },
  eventPatient: { fontSize: 12, color: "#333" },
  moreBadge: { marginTop: 2, alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, backgroundColor: "#eee" },
  moreBadgeText: { fontSize: 11, color: "#666" },
  modalContainer: { backgroundColor: "white", padding: 18, margin: 20, borderRadius: 12, maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center", },
  modalTitleDay: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  modalPatientName: { fontSize: 18, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  modalDetails: { fontSize: 15, marginBottom: 6 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  modalButton: { flex: 1, marginHorizontal: 1 },
  dayListCard: { marginVertical: 6, borderRadius: 10, overflow: "hidden" },
  fab: { position: "absolute", right: 20, bottom: 20, backgroundColor: "#4A90E2" },
  AppointHist: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 8, textAlign: "center"},
});
