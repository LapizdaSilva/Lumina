import { Container, Typography } from '@mui/material';
import AgendaCalendar from '../components/AgendaCalendar';

export default function Dashboard() {
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Painel
      </Typography>
      <AgendaCalendar />
    </Container>
  );
}
