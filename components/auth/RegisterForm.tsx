'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SocialButton } from '@/components/ui/SocialButton';
import { Alert } from '@/components/ui/Alert';
import { dict } from '@/lib/i18n/dictionaries';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = dict.uk.auth;

  const handleRegister = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password || !confirmPassword) {
      setErrorMsg(t.errors.empty);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t.errors.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setErrorMsg(t.errors.passwordTooShort);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrorMsg(t.errors.emailTaken);
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setSuccessMsg(t.registerSuccess);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'azure') => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const googleIcon = (
    <svg viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  const microsoftIcon = (
    <svg viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );

  return (
    <div className="w-full max-w-md bg-background border border-graphite rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)] p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">{t.registerTitle}</h1>
        <p className="text-foreground text-opacity-80">{t.registerSubtitle}</p>
      </div>

      {errorMsg && <Alert type="error">{errorMsg}</Alert>}
      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <form
        onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
        className="space-y-5 mt-2"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t.emailLabel}</label>
          <Input
            icon={<User />}
            type="text"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t.passwordLabel}</label>
          <Input
            icon={<Lock />}
            type={showPassword ? 'text' : 'password'}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t.confirmPasswordLabel}</label>
          <Input
            icon={<Lock />}
            type={showConfirm ? 'text' : 'password'}
            placeholder={t.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isInvalid={confirmPassword.length > 0 && password !== confirmPassword}
            isValid={confirmPassword.length > 0 && password === confirmPassword}
            rightElement={
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                onClick={() => setShowConfirm(!showConfirm)}
                title={showConfirm ? t.hidePassword : t.showPassword}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.registering}
            </span>
          ) : (
            t.signUp
          )}
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-graphite" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-neutral text-foreground text-opacity-60 font-medium">{t.orContinueWith}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <SocialButton text="Google" icon={googleIcon} onClick={() => handleOAuth('google')} />
          <SocialButton text="Microsoft" icon={microsoftIcon} onClick={() => handleOAuth('azure')} />
        </div>
      </div>

      <div className="mt-8 text-center text-sm">
        <p className="text-foreground text-opacity-80">
          {t.alreadyHaveAccount}{' '}
          <a href="/" className="text-primary font-medium transition-all hover:drop-shadow-[0_0_5px_hsl(var(--primary))] hover:underline">
            {t.signIn}
          </a>
        </p>
      </div>
    </div>
  );
}
