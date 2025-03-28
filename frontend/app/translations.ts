export type Language = 'en' | 'bg';

export type TranslationSchema = {
  [key in Language]: {
    common: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      loading: string;
      success: string;
      error: string;
      welcome: string;
    };
    navigation: {
      dashboard: string;
      appointments: string;
      clients: string;
      services: string;
      settings: string;
      profile: string;
      logout: string;
      analytics: string;
      adminPanel: string;
    };
    admin: {
      title: string;
      settings: string;
      adminPanel: string;
      language: string;
      languageSettings: string;
      changeLanguage: string;
      currentLanguage: string;
      chooseLanguage: string;
      userManagement: string;
      users: string;
      statistics: string;
      english: string;
      bulgarian: string;
    };
    dashboard: {
      welcomeBack: string;
      todaysAppointments: string;
      upcomingAppointments: string;
      totalClients: string;
      totalRevenue: string;
      viewAll: string;
      businessSnapshot: string;
      scheduledForToday: string;
      next7Days: string;
      registeredClients: string;
      revenue: string;
      todaysSchedule: string;
      loadingSchedule: string;
      noAppointmentsToday: string;
      scheduleIsClear: string;
      noUpcomingAppointments: string;
      scheduleIsClearForWeek: string;
    };
    appointments: {
      newAppointment: string;
      searchAppointments: string;
      date: string;
      time: string;
      client: string;
      service: string;
      duration: string;
      status: string;
      actions: string;
    };
    clients: {
      newClient: string;
      searchClients: string;
      name: string;
      email: string;
      phone: string;
      totalVisits: string;
      totalSpent: string;
    };
    services: {
      newService: string;
      searchServices: string;
      name: string;
      duration: string;
      price: string;
      description: string;
    };
    analytics: {
      overview: string;
      timeSlots: string;
      revenue: string;
      totalBookings: string;
      customerSatisfaction: string;
      totalAppointmentsBooked: string;
      revenueFromAllBookings: string;
    };
  };
};

export const languages = {
  en: 'English',
  bg: 'Български',
};

export const translations: TranslationSchema = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      welcome: 'Welcome',
    },
    navigation: {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      clients: 'Clients',
      services: 'Services',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Log out',
      analytics: 'Analytics',
      adminPanel: 'Admin Panel',
    },
    admin: {
      title: 'Admin Panel',
      settings: 'Manage system settings and user access',
      adminPanel: 'Admin Panel',
      language: 'Language',
      languageSettings: 'Language Settings',
      changeLanguage: 'Change Language',
      currentLanguage: 'Current Language',
      chooseLanguage: 'Choose Language',
      userManagement: 'User Management',
      users: 'Users',
      statistics: 'Statistics',
      english: 'English',
      bulgarian: 'Bulgarian',
    },
    dashboard: {
      welcomeBack: 'Welcome back',
      todaysAppointments: "Today's Appointments",
      upcomingAppointments: 'Upcoming Appointments',
      totalClients: 'Total Clients',
      totalRevenue: 'Total Revenue',
      viewAll: 'View All',
      businessSnapshot: 'Business Snapshot',
      scheduledForToday: 'Scheduled for today',
      next7Days: 'Next 7 days',
      registeredClients: 'Registered clients',
      revenue: 'Revenue',
      todaysSchedule: "Today's Schedule",
      loadingSchedule: 'Loading schedule...',
      noAppointmentsToday: 'No appointments today',
      scheduleIsClear: 'Your schedule is clear for the day',
      noUpcomingAppointments: 'No upcoming appointments',
      scheduleIsClearForWeek: 'Your schedule is clear for the week',
    },
    appointments: {
      newAppointment: 'New Appointment',
      searchAppointments: 'Search appointments...',
      date: 'Date',
      time: 'Time',
      client: 'Client',
      service: 'Service',
      duration: 'Duration',
      status: 'Status',
      actions: 'Actions',
    },
    clients: {
      newClient: 'New Client',
      searchClients: 'Search clients...',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      totalVisits: 'Total Visits',
      totalSpent: 'Total Spent',
    },
    services: {
      newService: 'New Service',
      searchServices: 'Search services...',
      name: 'Name',
      duration: 'Duration',
      price: 'Price',
      description: 'Description',
    },
    analytics: {
      overview: 'Overview',
      timeSlots: 'Time Slots',
      revenue: 'Revenue',
      totalBookings: 'Total Bookings',
      customerSatisfaction: 'Customer Satisfaction',
      totalAppointmentsBooked: 'Total appointments booked',
      revenueFromAllBookings: 'Revenue from all bookings',
    },
  },
  bg: {
    common: {
      save: 'Запази',
      cancel: 'Отказ',
      delete: 'Изтрий',
      edit: 'Редактирай',
      loading: 'Зареждане...',
      success: 'Успех',
      error: 'Грешка',
      welcome: 'Добре дошли',
    },
    navigation: {
      dashboard: 'Табло',
      appointments: 'Резервации',
      clients: 'Клиенти',
      services: 'Услуги',
      settings: 'Настройки',
      profile: 'Профил',
      logout: 'Изход',
      analytics: 'Анализи',
      adminPanel: 'Админ Панел',
    },
    admin: {
      title: 'Админ Панел',
      settings: 'Управление на системни настройки и потребителски достъп',
      adminPanel: 'Админ Панел',
      language: 'Език',
      languageSettings: 'Езикови Настройки',
      changeLanguage: 'Смяна на Език',
      currentLanguage: 'Текущ Език',
      chooseLanguage: 'Избери Език',
      userManagement: 'Управление на Потребители',
      users: 'Потребители',
      statistics: 'Статистика',
      english: 'Английски',
      bulgarian: 'Български',
    },
    dashboard: {
      welcomeBack: 'Добре дошли отново',
      todaysAppointments: 'Днешни Резервации',
      upcomingAppointments: 'Предстоящи Резервации',
      totalClients: 'Общо Клиенти',
      totalRevenue: 'Общи Приходи',
      viewAll: 'Виж Всички',
      businessSnapshot: 'Бизнес Статистика',
      scheduledForToday: 'Планирани за днес',
      next7Days: 'Следващите 7 дни',
      registeredClients: 'Регистрирани клиенти',
      revenue: 'Приходи',
      todaysSchedule: 'Дневен График',
      loadingSchedule: 'Зареждане на графика...',
      noAppointmentsToday: 'Няма резервации днес',
      scheduleIsClear: 'Графикът ви е свободен за деня',
      noUpcomingAppointments: 'Няма предстоящи резервации',
      scheduleIsClearForWeek: 'Графикът ви е свободен за седмицата',
    },
    appointments: {
      newAppointment: 'Нова Резервация',
      searchAppointments: 'Търсене на резервации...',
      date: 'Дата',
      time: 'Час',
      client: 'Клиент',
      service: 'Услуга',
      duration: 'Продължителност',
      status: 'Статус',
      actions: 'Действия',
    },
    clients: {
      newClient: 'Нов Клиент',
      searchClients: 'Търсене на клиенти...',
      name: 'Име',
      email: 'Имейл',
      phone: 'Телефон',
      totalVisits: 'Общо Посещения',
      totalSpent: 'Общо Похарчено',
    },
    services: {
      newService: 'Нова Услуга',
      searchServices: 'Търсене на услуги...',
      name: 'Име',
      duration: 'Продължителност',
      price: 'Цена',
      description: 'Описание',
    },
    analytics: {
      overview: 'Общ Преглед',
      timeSlots: 'Времеви Слотове',
      revenue: 'Приходи',
      totalBookings: 'Общо Резервации',
      customerSatisfaction: 'Удовлетвореност на Клиентите',
      totalAppointmentsBooked: 'Общо направени резервации',
      revenueFromAllBookings: 'Приходи от всички резервации',
    },
  },
}; 