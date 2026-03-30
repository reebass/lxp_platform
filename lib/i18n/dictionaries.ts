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
        rateLimit: 'Забагато спроб. Спробуйте пізніше.',
        network: 'Помилка мережі. Перевірте з\'єднання.',
        fallback: 'Сталася невідома помилка.',
      }
    },
    dashboard: {
      welcomeTitle: 'З поверненням!',
      welcomeSubtitle: 'Продовжуйте ваше навчання. Тут зібрані всі ваші активні курси та статистика.',
      course: {
        title: 'Вступ до розробки LXP',
        description: 'Цей курс навчить вас створювати платформи для навчання з використанням Next.js, Tailwind і патерну Atomic Design.',
        progressInfo: 'Ваш прогрес',
        continueBtn: 'Продовжити',
      }
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
        }
      }
    }
  },
  // Дополнительный язык интерфейса - Английский
  en: {
    auth: {
      title: 'Sign In',
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
        rateLimit: 'Too many attempts. Try again later.',
        network: 'Network error. Check your connection.',
        fallback: 'An unknown error occurred.',
      }
    },
    dashboard: {
      welcomeTitle: 'Welcome Back!',
      welcomeSubtitle: 'Continue your learning. Here you can find all your active courses and statistics.',
      course: {
        title: 'Intro to LXP Development',
        description: 'This course will teach you how to build learning platforms using Next.js, Tailwind, and Atomic Design.',
        progressInfo: 'Your progress',
        continueBtn: 'Continue',
      }
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
        }
      }
    }
  }
};
