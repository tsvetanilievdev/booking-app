export const enTranslations = {
  // Common elements
  common: {
    bookingSystem: 'Booking System',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    view: 'View',
    submit: 'Submit',
    confirmation: 'Confirmation',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    yes: 'Yes',
    no: 'No',
    actions: 'Actions',
    status: 'Status',
    all: 'All',
    close: 'Close'
  },

  // Main navigation
  navigation: {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    clients: 'Clients',
    services: 'Services',
    analytics: 'Analytics',
    settings: 'Settings',
    notifications: 'Notifications',
    profile: 'Profile',
    admin: 'Admin Panel',
    logout: 'Logout',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language'
  },

  // Dashboard page
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to Booking System',
    todayAppointments: 'Today\'s Appointments',
    upcomingAppointments: 'Upcoming Appointments',
    totalClients: 'Total Clients',
    totalAppointments: 'Total Appointments',
    totalRevenue: 'Total Revenue',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    createAppointment: 'Create Appointment',
    createClient: 'Create Client',
    createService: 'Create Service',
    viewCalendar: 'View Calendar',
    noAppointments: 'No appointments scheduled'
  },

  // Calendar page
  calendar: {
    title: 'Booking Calendar',
    newAppointment: 'New Appointment',
    editAppointment: 'Edit Appointment',
    clientName: 'Client Name',
    service: 'Service',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    notes: 'Notes',
    status: 'Status',
    createEvent: 'Create Event',
    deleteEvent: 'Delete Event',
    eventCreated: 'Event successfully created',
    eventUpdated: 'Event successfully updated',
    eventDeleted: 'Event successfully deleted',
    confirmDelete: 'Are you sure you want to delete this event?',
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List'
  },

  // Clients page
  clients: {
    title: 'Clients',
    addClient: 'Add Client',
    editClient: 'Edit Client',
    clientDetails: 'Client Details',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    zip: 'ZIP Code',
    notes: 'Notes',
    appointmentHistory: 'Appointment History',
    lastVisit: 'Last Visit',
    totalSpent: 'Total Spent',
    noClients: 'No clients found',
    vipStatus: 'VIP Status',
    confirmDelete: 'Are you sure you want to delete this client?'
  },

  // Services page
  services: {
    title: 'Services',
    addService: 'Add Service',
    editService: 'Edit Service',
    serviceName: 'Service Name',
    description: 'Description',
    duration: 'Duration',
    price: 'Price',
    category: 'Category',
    availability: 'Availability',
    available: 'Available',
    unavailable: 'Unavailable',
    noServices: 'No services found',
    confirmDelete: 'Are you sure you want to delete this service?'
  },

  // Analytics page
  analytics: {
    title: 'Analytics',
    overview: 'Overview',
    appointments: 'Appointments',
    revenue: 'Revenue',
    clients: 'Clients',
    services: 'Services',
    dateRange: 'Date Range',
    timeRange: 'Time Range',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    applyFilter: 'Apply Filter',
    resetFilter: 'Reset Filter',
    exportData: 'Export Data',
    appointmentsPerDay: 'Appointments Per Day',
    revenueOverTime: 'Revenue Over Time',
    topServices: 'Top Services',
    clientGrowth: 'Client Growth',
    appointmentStatus: 'Appointment Status',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noShow: 'No Show',
    pending: 'Pending'
  },

  // Profile page
  profile: {
    title: 'Profile',
    personalInfo: 'Personal Information',
    accountDetails: 'Account Details',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    memberSince: 'Member Since',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    saveChanges: 'Save Changes',
    appointmentHistory: 'Appointment History',
    activityLog: 'Activity Log',
    passwordRequirements: 'Password Requirements',
    passwordUpdated: 'Password updated successfully'
  },

  // Settings page
  settings: {
    title: 'Settings',
    tabs: {
      account: 'Account',
      notifications: 'Notifications',
      application: 'Application'
    },
    account: {
      title: 'Account Settings',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      saveChanges: 'Save Changes'
    },
    notifications: {
      title: 'Notification Settings',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      appointmentReminders: 'Appointment Reminders',
      saveSettings: 'Save Notification Settings'
    },
    application: {
      title: 'Application Settings',
      darkMode: 'Dark Mode',
      language: 'Language',
      languages: {
        english: 'English',
        bulgarian: 'Bulgarian',
        spanish: 'Spanish',
        french: 'French',
        german: 'German'
      },
      timeFormat: 'Time Format',
      timeFormats: {
        '12h': '12-hour (AM/PM)',
        '24h': '24-hour'
      },
      saveSettings: 'Save Application Settings'
    }
  },
  
  // Notifications page
  notifications: {
    title: 'Notifications',
    markAllAsRead: 'Mark All as Read',
    clearAll: 'Clear All',
    noNotifications: 'No notifications',
    newAppointment: 'New Appointment',
    appointmentUpdated: 'Appointment Updated',
    appointmentCancelled: 'Appointment Cancelled',
    newClient: 'New Client',
    view: 'View',
    delete: 'Delete',
    markAsRead: 'Mark as Read',
    types: {
      all: 'All',
      appointment: 'Appointments',
      client: 'Clients',
      system: 'System'
    }
  },

  // Login page
  login: {
    title: 'Login',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
    noAccount: 'Don\'t have an account?',
    signUp: 'Sign Up',
    invalidCredentials: 'Invalid email or password',
    loginSuccessful: 'Login successful'
  },

  // Signup page
  signup: {
    title: 'Sign Up',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    agreeTerms: 'I agree to the Terms and Conditions',
    createAccount: 'Create Account',
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    passwordsMismatch: 'Passwords do not match',
    accountCreated: 'Account successfully created'
  },

  // Reset password page
  resetPassword: {
    title: 'Reset Password',
    email: 'Email',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    checkEmail: 'Please check your email for the reset link',
    token: 'Reset Token',
    verifyToken: 'Verify Token',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    resetPassword: 'Reset Password',
    passwordReset: 'Password has been reset successfully'
  },

  // Admin panel
  admin: {
    title: 'Admin Panel',
    userManagement: 'User Management',
    serviceManagement: 'Service Management',
    systemSettings: 'System Settings',
    reports: 'Reports',
    addUser: 'Add User',
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    userRole: 'User Role',
    userStatus: 'User Status',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    confirmUserDelete: 'Are you sure you want to delete this user?',
    userDeleted: 'User successfully deleted',
    userSaved: 'User successfully saved'
  },

  // General messages
  general: {
    success: 'Settings saved successfully!',
    error: 'An error occurred. Please try again.',
    loading: 'Loading...',
    saving: 'Saving...',
    deleting: 'Deleting...',
    confirmDelete: 'Are you sure you want to delete this item?',
    noResults: 'No results found',
    required: 'Required field',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    sessionExpired: 'Your session has expired. Please login again.'
  }
}; 