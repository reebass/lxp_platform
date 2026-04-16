// lib/i18n/dictionaries.ts

// Интернационализация (i18n): Словарь
// Мы выносим все захардкоженные текстовые строки в единый объект (словарь).
// Это позволяет легко добавить новые языки в будущем (например, польский или немецкий).
// Кроме того, это сильно упрощает поддержку проекта: если нужно изменить текст ошибки 
// или название кнопки, нам не нужно искать их по исходному коду компонентов, мы делаем это здесь.

export const dict = {
  // Основной язык интерфейса - Украинский
  uk: {
    auth: {
      title: 'Увійти',
      tenantSubtitle: 'здобувай нові скіли з власним AI коучем',
      subtitle: 'щоб розпочати навчання',
      emailLabel: 'Пошта',
      emailPlaceholder: 'Введіть email',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введіть пароль',
      forgotPassword: 'Забули пароль?',
      signIn: 'Увійти',
      loading: 'Завантаження...',
      orSignInWith: 'Або увійдіть через:',
      noAccount: 'Немає акаунту?',
      signUp: 'Зареєструватися',
      errors: {
        invalid: 'Невірна пошта або пароль.',
        invalidEmail: 'Невірний формат пошти.',
        empty: 'Будь ласка, заповніть всі поля.',
        passwordMismatch: 'Паролі не збігаються. Перевірте та спробуйте ще раз.',
        passwordTooShort: 'Пароль має містити щонайменше 8 символів.',
        emailTaken: 'Цей email вже зареєстрований. Спробуйте увійти.',
        rateLimit: 'Забагато спроб. Спробуйте пізніше.',
        network: 'Помилка мережі. Перевірте з\'єднання.',
        fallback: 'Сталася невідома помилка.',
      },
      showPassword: 'Показати пароль',
      hidePassword: 'Сховати пароль',
      registerTitle: 'Реєстрація',
      registerSubtitle: 'Створіть безкоштовний акаунт',
      confirmPasswordLabel: 'Підтвердьте пароль',
      confirmPasswordPlaceholder: 'Повторіть пароль',
      registering: 'Реєстрація...',
      orContinueWith: 'або продовжить через',
      alreadyHaveAccount: 'Вже маєте акаунт?',
      registerSuccess: 'Реєстрація успішна! Перевірте email для підтвердження акаунта.',
    },
    dataHub: {
      header: {
        title: 'Data Hub / База знань',
        subtitle: 'Централізоване сховище знань вашої компанії для навчання ШІ-аватара.',
        logout: 'Вийти'
      },
      breadcrumbs: {
        home: 'Головна'
      },
      folderModal: {
        success: 'Папку «{name}» створено',
        error: 'Не вдалось створити папку',
        title: 'Нова папка',
        label: 'Назва папки',
        placeholder: 'Наприклад: Договори',
        cancel: 'Скасувати',
        creating: 'Створення...',
        create: 'Створити'
      },
      list: {
        folderEmpty: 'Ця папка порожня.',
        dbEmpty: 'База знань порожня.',
        folderHint: 'Натисніть «Додати документ» або «Нова папка».',
        dbHint: 'Натисніть «Додати документ», щоб розпочати.'
      },
      table: {
        title: 'Реєстр документів',
        foldersCount: '{count} ПАПОК',
        filesCount: '{count} ФАЙЛІВ',
        aiStatus: 'AI Опрацювання в нормі',
        colName: 'Назва',
        colDate: 'Дата',
        colStatus: 'Статус',
        colActions: 'Дії',
        error: 'Помилка завантаження даних:',
        encryptionNote: '* Всі завантажені документи шифруються за стандартом AES-256',
        storage: 'Сховище'
      },
      row: {
        renameSuccess: 'Перейменовано',
        renameError: 'Не вдалось перейменувати',
        deleteFolderSuccess: 'Папку видалено',
        deleteFileSuccess: 'Файл видалено',
        deleteError: 'Не вдалось видалити',
        moveSuccess: 'Переміщено до «{name}»',
        moveError: 'Не вдалось перемістити',
        doubleClickRename: 'Двічі клацніть, щоб перейменувати',
        isFolder: 'Папка',
        statusReady: 'Готово',
        statusPending: 'Аналіз...',
        actionsLabel: 'Дії',
        actionRename: 'Перейменувати',
        actionDelete: 'Видалити',
        deleteFolderTitle: 'Видалити папку?',
        deleteFileTitle: 'Видалити файл?',
        deleteFolderDesc: 'Папку «{name}» та весь її вміст (включно з вкладеними файлами) буде видалено безповоротно.',
        deleteFileDesc: 'Файл «{name}» буде видалено безповоротно.',
        cancel: 'Скасувати',
        deleting: 'Видалення...',
        deleteBtn: 'Видалити'
      },
      toolbar: {
        back: 'Назад',
        searchPlaceholder: 'Пошук документів...',
        export: 'Експорт',
        newFolder: 'Нова папка',
        addDoc: 'Додати документ'
      },
      uploadModal: {
        title: 'Додати документ до бази знань',
        subtitle: 'Підтримуються PDF, DOCX та TXT файли до 10MB.'
      },
      uploadZone: {
        sizeError: '«{name}» перевищує ліміт 10MB.',
        typeError: '«{name}» — недозволений формат (PDF, DOCX, TXT).',
        uploadingSingle: 'Завантаження «{name}»…',
        uploadingMulti: 'Завантаження {count} файлів…',
        storageError: 'Помилка завантаження «{name}»:',
        dbError: 'Помилка бази даних для «{name}»:',
        successSingle: 'Документ успішно завантажено!',
        successMulti: '{count} документів успішно завантажено!',
        dragTitle: 'Перетягніть файли або натисніть',
        dragSubtitle: 'PDF, DOCX, TXT · до 10MB · кілька файлів одночасно',
        changeBtn: 'Змінити',
        docNameLabel: 'Назва документа',
        docNamePlaceholder: 'Назва документа...',
        selectedCount: 'Вибрано {count} файлів',
        totalSize: '{size} загалом',
        btnUploading: 'Завантаження…',
        btnUploadSingle: 'Завантажити документ',
        btnUploadMulti: 'Завантажити {count} файлів'
      }
    },
    chat: {
      pageTitle: 'AI Асистент',
      pageSubtitle: 'Спілкуйтеся зі своїми завантаженими документами через захищений RAG-інтерфейс.',
      headerTitle: 'AI Асистент',
      headerSubtitle: 'Задавайте питання на базі документів',
      greeting: 'Привіт! Я штучний інтелект-асистент. Чим можу допомогти?',
      inputPlaceholder: 'Задайте питання про ваші документи...',
      typing: 'AI друкує...',
      errorResponse: 'Помилка відповіді.',
      errorConnection: 'На жаль, сталася помилка при з\'єднанні з сервером штучного інтелекту.',
    },
    dashboard: {
      welcomeTitle: 'З поверненням!',
      welcomeSubtitle: 'Продовжуйте ваше навчання. Тут зібрані всі ваші активні курси та статистика.',
      headerTitle: 'Твій план розвитку',
      logout: 'Вийти',
      course: {
        title: 'Вступ до розробки LXP',
        description: 'Цей курс навчить вас створювати платформи для навчання з використанням Next.js, Tailwind і патерну Atomic Design.',
        progressInfo: 'Ваш прогрес',
        rowTextComplete: 'Обробка завершена',
        continueBtn: 'Продовжити',
      }
    },
    ai_assistant: {
      placeholder: 'Задайте питання...',
      search_trigger: 'Пошук або питання AI...',
      greeting: 'Привіт! Я ваш AI-асистент. Що ви хочете знайти або дізнатися?',
      typing: 'AI шукає та обмірковує...',
      error: 'Вибачте, сталася помилка з\'єднання.',
    },
    course_builder: {
      title: 'Конструктор курсів',
      subtitle: 'Перетягуйте та з\'єднуйте блоки, щоб візуально спроектувати ваш курс.',
      btn_reset: 'Скинути',
      btn_save: 'Зберегти курс',
      node_start: '🚀 Початок',
      node_finish: '🏁 Кінець',
    },
    admin: {
      sidebar: {
        tenants: 'Клієнти',
        library: 'Майстер-база',
        billing: 'Білінг',
      },
      header: 'Панель управління',
      logout: 'Вийти',
      welcome: 'Ласкаво просимо в Super Admin панель',
      desktop_hint: 'Виберіть потрібний розділ у боковому меню ліворуч, щоб почати роботу.',
      mobile_hint: 'Виберіть потрібний розділ у меню внизу сторінки, щоб почати роботу.',
      tenantsPage: {
        title: 'Клієнти',
        addBtn: 'Додати клієнта',
        emptyState: 'Немає жодного клієнта',
        card: {
          created: 'Створено:',
          id: 'ID:'
        },
        addModal: {
          creating: 'Створення...',
          create: 'Створити',
          newTenant: 'Новий клієнт',
          errorEmptyName: 'Будь ласка, введіть назву компанії.',
          companyName: 'Назва компанії *',
          enterName: 'Введіть назву',
          subdomainLabel: 'Сабдомен платформи (необов\'язково)',
          subdomainPlaceholder: 'наприклад: novus',
          domainLabel: 'Корпоративний домен пошти (необов\'язково)',
          domainPlaceholder: 'наприклад: novus.ua',
          cancel: 'Скасувати'
        },
        branding: {
          saving: 'Збереження...',
          save: 'Зберегти брендинг',
          title: 'Брендинг',
          logoUrl: 'Логотип (URL)',
          clearLogo: 'Очистити URL логотипу',
          logoPreview: 'Прев\'ю логотипу',
          cardBg: 'Фон карток (Card BG)',
          pageBg: 'Фон сторінки (Page BG)',
          foreground: 'Foreground (Текст)',
          mutedForeground: 'Сірий текст (Muted Text)',
          primaryAccess: 'Primary Accent',
          border: 'Border (Межі)'
        },
        generalInfo: {
          saving: 'Збереження...',
          save: 'Зберегти інформацію',
          title: 'Загальна інформація',
          clientId: 'ID Клієнта',
          subdomain: 'Сабдомен',
          subdomainWithColon: 'Сабдомен:',
          corporateEmail: 'Корпоративна пошта',
          emailWithColon: 'Пошта:',
          createdAt: 'Створено:'
        },
        subscription: {
          saving: 'Збереження...',
          save: 'Зберегти підписку',
          title: 'Підписка та Ліміти',
          status: 'Статус',
          statusWithColon: 'Статус:',
          currentPlan: 'Поточний план',
          currentPlanWithColon: 'Поточний План:',
          userLimit: 'Ліміт користувачів',
          userLimitWithColon: 'Ліміт Користувачів:',
          unlimited: 'Безліміт',
          emptyIsUnlimited: '(порожнє = безліміт)',
          trialEnd: 'Кінець пробного періоду',
          storageLimit: 'Ліміт сховища'
        },
        grid: {
          unnamedTenant: 'Безіменний клієнт',
          subdomain: 'Сабдомен',
          email: 'Пошта'
        },
        storageStats: {
          freeSpace: 'Вільне місце: ',
          outOf: ' із ',
          storageLabel: 'Сховище файлів (Storage)'
        },
        notFound: {
          title: 'Клієнта не знайдено',
          backToList: 'Назад до списку'
        }
      },
      error403: {
        title: 'Упс, ми вас тут не чекали.',
        titleLine2: 'Далі живуть принцеси...',
        subtitle: 'Тобі ще рано на таке дивитись. Натисни кнопку, щоб повернутись до навчання.',
        backBtn: 'Повернутись назад'
      }
    },
    tenant_admin: {
      sidebar_data_hub: 'База знань',
      sidebar_course_builder: 'Конструктор курсів',
      header_title: 'Панель управління',
      welcome_title: 'Ласкаво просимо в панель адміністратора',
      welcome_subtitle: 'Виберіть потрібний розділ у боковому меню ліворуч, щоб почати роботу.',
      logout: 'Вийти',
    },
    common: {
      close: 'Закрити',
      errorIllustration: 'Ілюстрація помилки',
    }
  },
  // Дополнительный язык интерфейса - Английский
  en: {
    auth: {
      title: 'Sign In',
      tenantSubtitle: 'gain new skills with your personal AI coach',
      subtitle: 'to start learning',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      forgotPassword: 'Forgot Password?',
      signIn: 'Sign In',
      loading: 'Loading...',
      orSignInWith: 'Or Sign In with:',
      noAccount: 'Do not have an account?',
      signUp: 'Sign up',
      errors: {
        invalid: 'Invalid email or password.',
        invalidEmail: 'Invalid email format.',
        empty: 'Please fill in all fields.',
        passwordMismatch: 'Passwords do not match. Please check and try again.',
        passwordTooShort: 'Password must be at least 8 characters long.',
        emailTaken: 'This email is already registered. Try signing in.',
        rateLimit: 'Too many attempts. Try again later.',
        network: 'Network error. Check your connection.',
        fallback: 'An unknown error occurred.',
      },
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      registerTitle: 'Register',
      registerSubtitle: 'Create a free account',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Repeat password',
      registering: 'Registering...',
      orContinueWith: 'or continue with',
      alreadyHaveAccount: 'Already have an account?',
      registerSuccess: 'Registration successful! Check your email to confirm the account.',
    },
    dataHub: {
      header: {
        title: 'Data Hub / Knowledge Base',
        subtitle: 'Centralized knowledge storage for training your AI avatar.',
        logout: 'Log out'
      },
      breadcrumbs: {
        home: 'Home'
      },
      folderModal: {
        success: 'Folder "{name}" created',
        error: 'Failed to create folder',
        title: 'New Folder',
        label: 'Folder Name',
        placeholder: 'e.g.: Contracts',
        cancel: 'Cancel',
        creating: 'Creating...',
        create: 'Create'
      },
      list: {
        folderEmpty: 'This folder is empty.',
        dbEmpty: 'Knowledge base is empty.',
        folderHint: 'Click "Add document" or "New folder".',
        dbHint: 'Click "Add document" to get started.'
      },
      table: {
        title: 'Document Registry',
        foldersCount: '{count} FOLDERS',
        filesCount: '{count} FILES',
        aiStatus: 'AI Processing running',
        colName: 'Name',
        colDate: 'Date',
        colStatus: 'Status',
        colActions: 'Actions',
        error: 'Error loading data:',
        encryptionNote: '* All uploaded documents are AES-256 encrypted',
        storage: 'Storage'
      },
      row: {
        renameSuccess: 'Renamed',
        renameError: 'Failed to rename',
        deleteFolderSuccess: 'Folder deleted',
        deleteFileSuccess: 'File deleted',
        deleteError: 'Failed to delete',
        moveSuccess: 'Moved to "{name}"',
        moveError: 'Failed to move',
        doubleClickRename: 'Double-click to rename',
        isFolder: 'Folder',
        statusReady: 'Ready',
        statusPending: 'Analyzing...',
        actionsLabel: 'Actions',
        actionRename: 'Rename',
        actionDelete: 'Delete',
        deleteFolderTitle: 'Delete folder?',
        deleteFileTitle: 'Delete file?',
        deleteFolderDesc: 'Folder "{name}" and all its contents (including nested files) will be permanently deleted.',
        deleteFileDesc: 'File "{name}" will be permanently deleted.',
        cancel: 'Cancel',
        deleting: 'Deleting...',
        deleteBtn: 'Delete'
      },
      toolbar: {
        back: 'Back',
        searchPlaceholder: 'Search documents...',
        export: 'Export',
        newFolder: 'New folder',
        addDoc: 'Add document'
      },
      uploadModal: {
        title: 'Add document to knowledge base',
        subtitle: 'Supported formats: PDF, DOCX, and TXT up to 10MB.'
      },
      uploadZone: {
        sizeError: '"{name}" exceeds 10MB limit.',
        typeError: '"{name}" format not allowed (PDF, DOCX, TXT).',
        uploadingSingle: 'Uploading "{name}"...',
        uploadingMulti: 'Uploading {count} files...',
        storageError: 'Error uploading "{name}":',
        dbError: 'Database error for "{name}":',
        successSingle: 'Document uploaded successfully!',
        successMulti: '{count} documents uploaded successfully!',
        dragTitle: 'Drag files here or click',
        dragSubtitle: 'PDF, DOCX, TXT · up to 10MB · multiple files at once',
        changeBtn: 'Change',
        docNameLabel: 'Document name',
        docNamePlaceholder: 'Document name...',
        selectedCount: '{count} files selected',
        totalSize: '{size} total',
        btnUploading: 'Uploading...',
        btnUploadSingle: 'Upload document',
        btnUploadMulti: 'Upload {count} files'
      }
    },
    chat: {
      pageTitle: 'AI Assistant',
      pageSubtitle: 'Communicate with your uploaded documents through a secure RAG interface.',
      headerTitle: 'AI Assistant',
      headerSubtitle: 'Ask questions based on your documents',
      greeting: 'Hello! I am an AI assistant. How can I help you?',
      inputPlaceholder: 'Ask a question about your documents...',
      typing: 'AI is typing...',
      errorResponse: 'Response error.',
      errorConnection: 'Sorry, an error occurred while connecting to the AI server.',
    },
    dashboard: {
      welcomeTitle: 'Welcome Back!',
      welcomeSubtitle: 'Continue your learning. Here you can find all your active courses and statistics.',
      headerTitle: 'Your Development Plan',
      logout: 'Logout',
      course: {
        title: 'Intro to LXP Development',
        description: 'This course will teach you how to build learning platforms using Next.js, Tailwind, and Atomic Design.',
        progressInfo: 'Your progress',
        rowTextComplete: 'Processing complete',
        continueBtn: 'Continue',
      }
    },
    ai_assistant: {
      placeholder: 'Ask a question...',
      search_trigger: 'Search or ask AI...',
      greeting: 'Hi! I am your AI assistant. What would you like to search or learn?',
      typing: 'AI is searching and thinking...',
      error: 'Sorry, a connection error occurred.',
    },
    course_builder: {
      title: 'Course Builder',
      subtitle: 'Drag and connect nodes to visually design your course flow.',
      btn_reset: 'Reset',
      btn_save: 'Save Course',
      node_start: '🚀 Start',
      node_finish: '🏁 Finish',
    },
    admin: {
      sidebar: {
        tenants: 'Tenants',
        library: 'Library',
        billing: 'Billing',
      },
      header: 'Admin Panel',
      logout: 'Logout',
      welcome: 'Welcome to the Super Admin panel',
      desktop_hint: 'Choose a section in the left sidebar to start working.',
      mobile_hint: 'Choose a section in the bottom menu to start working.',
      tenantsPage: {
        title: 'Tenants',
        addBtn: 'Add Tenant',
        emptyState: 'No tenants found',
        card: {
          created: 'Created:',
          id: 'ID:'
        },
        addModal: {
          creating: 'Creating...',
          create: 'Create',
          newTenant: 'New Tenant',
          errorEmptyName: 'Please enter a company name.',
          companyName: 'Company Name *',
          enterName: 'Enter name',
          subdomainLabel: 'Platform Subdomain (optional)',
          subdomainPlaceholder: 'e.g., novus',
          domainLabel: 'Corporate Email Domain (optional)',
          domainPlaceholder: 'e.g., novus.ua',
          cancel: 'Cancel'
        },
        branding: {
          saving: 'Saving...',
          save: 'Save Branding',
          title: 'Branding',
          logoUrl: 'Logo (URL)',
          clearLogo: 'Clear Logo URL',
          logoPreview: 'Logo Preview',
          cardBg: 'Card BG',
          pageBg: 'Page BG',
          foreground: 'Foreground Text',
          mutedForeground: 'Muted Text',
          primaryAccess: 'Primary Accent',
          border: 'Border'
        },
        generalInfo: {
          saving: 'Saving...',
          save: 'Save Information',
          title: 'General Information',
          clientId: 'Client ID',
          subdomain: 'Subdomain',
          subdomainWithColon: 'Subdomain:',
          corporateEmail: 'Corporate Email',
          emailWithColon: 'Email:',
          createdAt: 'Created At:'
        },
        subscription: {
          saving: 'Saving...',
          save: 'Save Subscription',
          title: 'Subscription & Limits',
          status: 'Status',
          statusWithColon: 'Status:',
          currentPlan: 'Current Plan',
          currentPlanWithColon: 'Current Plan:',
          userLimit: 'User Limit',
          userLimitWithColon: 'User Limit:',
          unlimited: 'Unlimited',
          emptyIsUnlimited: '(empty = unlimited)',
          trialEnd: 'Trial End Date',
          storageLimit: 'Storage Limit'
        },
        grid: {
          unnamedTenant: 'Unnamed Tenant',
          subdomain: 'Subdomain',
          email: 'Email'
        },
        storageStats: {
          freeSpace: 'Free space: ',
          outOf: ' out of ',
          storageLabel: 'File Storage'
        },
        notFound: {
          title: 'Tenant not found',
          backToList: 'Back to list'
        }
      },
      error403: {
        title: 'Oops, we didn\'t expect you here.',
        titleLine2: 'Princesses live further down...',
        subtitle: 'You are too early to see this. Click the button to return to learning.',
        backBtn: 'Go back'
      }
    },
    tenant_admin: {
      sidebar_data_hub: 'Data Hub',
      sidebar_course_builder: 'Course Builder',
      header_title: 'Control Panel',
      welcome_title: 'Welcome to the Admin Panel',
      welcome_subtitle: 'Select a section in the left sidebar to get started.',
      logout: 'Logout',
    },
    common: {
      close: 'Close',
      errorIllustration: 'Error Illustration',
    }
  }
};
