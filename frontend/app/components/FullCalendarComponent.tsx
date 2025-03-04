'use client';

import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useLanguage } from '../translations/LanguageContext';

// Import FullCalendar and required plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

// Define the event interface for type safety
interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: {
    description?: string;
    client?: string;
    service?: string;
  };
}

interface FullCalendarComponentProps {
  initialEvents: Event[];
}

interface EventFormData {
  title: string;
  client: string;
  service: string;
  description: string;
  start: string;
  end: string;
}

const FullCalendarComponent: React.FC<FullCalendarComponentProps> = ({ initialEvents }) => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    client: '',
    service: '',
    description: '',
    start: '',
    end: ''
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    start: false,
    end: false
  });

  const handleDateSelect = (selectInfo: any) => {
    setEventFormData({
      ...eventFormData,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      title: ''
    });
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      // You could open a dialog to edit the event here
      console.log('Event clicked', event);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormErrors({
      title: false,
      start: false,
      end: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setEventFormData({
        ...eventFormData,
        [name]: value
      });
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      title: !eventFormData.title,
      start: !eventFormData.start,
      end: !eventFormData.end
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleEventCreate = () => {
    if (validateForm()) {
      const newEvent: Event = {
        id: Date.now().toString(), // Simple ID generation
        title: eventFormData.title,
        start: eventFormData.start,
        end: eventFormData.end,
        extendedProps: {
          description: eventFormData.description,
          client: eventFormData.client,
          service: eventFormData.service
        }
      };
      
      setEvents([...events, newEvent]);
      setIsDialogOpen(false);
      
      // Reset form data
      setEventFormData({
        title: '',
        client: '',
        service: '',
        description: '',
        start: '',
        end: ''
      });
      
      // In a real app, you would also save this to your backend
      console.log('New event created:', newEvent);
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="100%"
        buttonText={{
          today: t('calendar.today'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
          list: t('calendar.list')
        }}
      />
      
      {/* Event Creation Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{t('calendar.createEvent')}</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label={t('calendar.newAppointment')}
            value={eventFormData.title}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={formErrors.title}
            helperText={formErrors.title ? t('general.required') : ''}
            required
          />
          <TextField
            name="client"
            label={t('calendar.clientName')}
            value={eventFormData.client}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="service"
            label={t('calendar.service')}
            value={eventFormData.service}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="description"
            label={t('calendar.notes')}
            value={eventFormData.description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              name="start"
              label={t('calendar.start')}
              type="datetime-local"
              value={eventFormData.start}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={formErrors.start}
              helperText={formErrors.start ? t('general.required') : ''}
              required
            />
            <TextField
              name="end"
              label={t('calendar.end')}
              type="datetime-local"
              value={eventFormData.end}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={formErrors.end}
              helperText={formErrors.end ? t('general.required') : ''}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>{t('common.cancel')}</Button>
          <Button onClick={handleEventCreate} variant="contained" color="primary">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FullCalendarComponent; 