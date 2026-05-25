import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeInviteCode, signIn, signUp } from '@/services/auth.service';
import type { Role } from '@/types/domain';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  name: z.string().optional(),
  inviteCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Mode = 'login' | 'signup';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('coach');
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        await signIn({ email: values.email, password: values.password });
      } else {
        if (!values.name || values.name.trim().length < 2) {
          setServerError('Indica tu nombre.');
          return;
        }
        if (role === 'player' && !normalizeInviteCode(values.inviteCode)) {
          setServerError('Introduce el código de invitación de tu entrenador.');
          return;
        }
        const { needsConfirmation } = await signUp({
          email: values.email,
          password: values.password,
          name: values.name.trim(),
          role,
          inviteCode: values.inviteCode?.trim() || undefined,
        });
        if (needsConfirmation) {
          setInfo('Cuenta creada. Revisa tu correo y luego inicia sesión.');
          setMode('login');
        }
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Algo salió mal. Inténtalo de nuevo.');
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-5 safe-top safe-bottom">
      {/* glow decorativo Midnight Electric */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-2xl font-extrabold text-white shadow-glow">
            C
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">CAMPO</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === 'login' ? 'Entra a tu centro de mando' : 'Crea tu cuenta'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur">
          {mode === 'signup' && (
            <div className="mb-5">
              <Label>Soy</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['coach', 'player'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors',
                      role === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    {r === 'coach' ? 'Entrenador' : 'Jugador'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" autoComplete="name" placeholder="Tu nombre" {...register('name')} />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Mínimo 6 caracteres"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {mode === 'signup' && role === 'player' && (
              <div>
                <Label htmlFor="inviteCode">Código de invitación</Label>
                <Input id="inviteCode" placeholder="Te lo da tu entrenador" {...register('inviteCode')} />
              </div>
            )}

            {serverError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {serverError}
              </p>
            )}
            {info && (
              <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                {info}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setServerError(null);
                setInfo(null);
              }}
            >
              {mode === 'login' ? 'Crear cuenta' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
          <ShieldCheck className="size-3" /> Conexión segura · Supabase
        </p>
      </div>
    </div>
  );
}
