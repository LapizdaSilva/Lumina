import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ptBR } from 'date-fns/locale';
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function AgendaCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Mock de consultas por data (depois você pode puxar do Supabase)
  const consultas: Record<string, string[]> = {
    '2025-09-21': ['10:00 - João Silva', '14:00 - Maria Oliveira'],
    '2025-09-20': ['09:00 - Pedro Souza'],
  };

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split('T')[0] : '';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box display="flex" gap={3}>
        {/* Calendário */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Selecione um dia
          </Typography>
          <DateCalendar value={selectedDate} onChange={setSelectedDate} />
        </Paper>

        {/* Consultas do dia */}
        <Paper sx={{ p: 2, flex: 2 }}>
          <Typography variant="h6" gutterBottom>
            Consultas em {selectedDate?.toLocaleDateString('pt-BR')}
          </Typography>
          <List>
            {consultas[formatDate(selectedDate)] ? (
              consultas[formatDate(selectedDate)].map((c, i) => (
                <ListItem key={i}>
                  <ListItemText primary={c} />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary">
                Nenhuma consulta neste dia.
              </Typography>
            )}
          </List>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
