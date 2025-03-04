'use client';

import React from 'react';
import { Box } from '@mui/material';

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
}

interface FullCalendarComponentProps {
  initialEvents: Event[];
}

const FullCalendarComponent: React.FC<FullCalendarComponentProps> = ({ initialEvents }) => {
  const handleDateSelect = (selectInfo: any) => {
    console.log('Date selected', selectInfo);
    // Add appointment creation logic here
  };

  const handleEventClick = (clickInfo: any) => {
    console.log('Event clicked', clickInfo);
    // Add event view/edit logic here
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
        initialEvents={initialEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="100%"
      />
    </Box>
  );
};

export default FullCalendarComponent; 