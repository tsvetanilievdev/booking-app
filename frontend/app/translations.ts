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
    };
    admin: {
      adminPanel: string;
      language: string;
      languageSettings: string;
      changeLanguage: string;
      currentLanguage: string;
      userManagement: string;
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
  };
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
    },
    admin: {
      adminPanel: 'Admin Panel',
      language: 'Language',
      languageSettings: 'Language Settings',
      changeLanguage: 'Change Language',
      currentLanguage: 'Current Language',
      userManagement: 'User Management',
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
    },
    admin: {
      adminPanel: 'Админ Панел',
      language: 'Език',
      languageSettings: 'Езикови Настройки',
      changeLanguage: 'Смяна на Език',
      currentLanguage: 'Текущ Език',
      userManagement: 'Управление на Потребители',
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
  },
}; 