

        <Portal>
          <Modal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <Text style={styles.modalTitle}>Novo Agendamento</Text>

              <TextInput label="ID do paciente" value={formPatientId} onChangeText={setFormPatientId} style={{ marginBottom: 8 }} />
              <TextInput label="Data (YYYY-MM-DD)" value={formDate} onChangeText={setFormDate} style={{ marginBottom: 8 }} />
              <TextInput label="Hora (HH:MM)" value={formTime} onChangeText={setFormTime} style={{ marginBottom: 8 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Button mode={formSessionType === "presencial" ? "contained" : "outlined"} onPress={() => setFormSessionType("presencial")}>
                  Presencial
                </Button>
                <Button mode={formSessionType === "online" ? "contained" : "outlined"} onPress={() => setFormSessionType("online")}>
                  Online
                </Button>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Button mode={formPaymentType === "particular" ? "contained" : "outlined"} onPress={() => setFormPaymentType("particular")}>
                  Particular
                </Button>
                <Button mode={formPaymentType === "convenio" ? "contained" : "outlined"} onPress={() => setFormPaymentType("convenio")}>
                  Convênio
                </Button>
              </View>

              <TextInput label="Notas" value={formNotes} onChangeText={setFormNotes} multiline numberOfLines={3} style={{ marginBottom: 12 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Button mode="outlined" onPress={() => setIsModalVisible(false)} style={{ flex: 1, marginRight: 8 }}>
                  Cancelar
                </Button>
                <Button mode="contained" onPress={handleCreateAppointment} style={{ flex: 1 }}>
                  Salvar
                </Button>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </Portal>