import { useEffect, useRef, useState } from 'react';
import { Download, FileJson, Loader2, LogOut, Upload } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/services/auth.service';
import { useCoachProfile, useSaveCoachProfile } from '@/hooks/useCoachProfile';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { uploadCoachLogo } from '@/lib/storage';
import { exportCsv, exportJson } from '@/lib/export';
import { toast } from '@/lib/toast';
import type { CoachPrefs } from '@/types/domain';

interface FormState {
  name: string;
  phone: string;
  specialty: string;
  experience_years: string;
  certifications: string;
  club: string;
  web: string;
  brand_name: string;
  brand_color: string;
  brand_slogan: string;
  logo_url: string;
  report_footer: string;
  report_disclaimer: string;
  prefs: CoachPrefs;
}

const EMPTY: FormState = {
  name: '', phone: '', specialty: 'completo', experience_years: '', certifications: '', club: '', web: '',
  brand_name: '', brand_color: '#7c3aed', brand_slogan: '', logo_url: '', report_footer: '', report_disclaimer: '',
  prefs: { language: 'es', date_format: 'dmy', rpe_scale: '1-10', session_types: '', player_tags: '' },
};

export function SettingsPage() {
  const { name, user } = useAuth();
  const { data: profile } = useCoachProfile();
  const save = useSaveCoachProfile();
  const players = usePlayers();
  const matches = useMatches();
  const trainings = useTrainings();
  const tasks = useTasks();
  const logoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? name ?? '',
      phone: profile.phone ?? '',
      specialty: profile.specialty ?? 'completo',
      experience_years: profile.experience_years != null ? String(profile.experience_years) : '',
      certifications: profile.certifications ?? '',
      club: profile.club ?? '',
      web: profile.web ?? '',
      brand_name: profile.brand_name ?? '',
      brand_color: profile.brand_color ?? '#7c3aed',
      brand_slogan: profile.brand_slogan ?? '',
      logo_url: profile.logo_url ?? '',
      report_footer: profile.report_footer ?? '',
      report_disclaimer: profile.report_disclaimer ?? '',
      prefs: { language: 'es', date_format: 'dmy', rpe_scale: '1-10', session_types: '', player_tags: '', ...profile.prefs },
    });
  }, [profile, name]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setPref = <K extends keyof CoachPrefs>(k: K, v: CoachPrefs[K]) =>
    setForm((f) => ({ ...f, prefs: { ...f.prefs, [k]: v } }));

  async function persist() {
    try {
      await save.mutateAsync({
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        specialty: form.specialty,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        certifications: form.certifications.trim() || null,
        club: form.club.trim() || null,
        web: form.web.trim() || null,
        brand_name: form.brand_name.trim() || null,
        brand_color: form.brand_color,
        brand_slogan: form.brand_slogan.trim() || null,
        logo_url: form.logo_url || null,
        report_footer: form.report_footer.trim() || null,
        report_disclaimer: form.report_disclaimer.trim() || null,
        prefs: form.prefs,
      });
      toast.success('Ajustes guardados');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadCoachLogo(user.id, file);
      set('logo_url', url);
      toast.success('Logo subido. Recuerda guardar.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir el logo.');
    } finally {
      if (logoRef.current) logoRef.current.value = '';
    }
  }

  const exportData = {
    profile: profile ?? null,
    players: players.data ?? [],
    matches: matches.data ?? [],
    trainings: trainings.data ?? [],
    tasks: tasks.data ?? [],
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Perfil, marca, preferencias y cuenta.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="brand">Marca</TabsTrigger>
          <TabsTrigger value="prefs">Preferencias</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre"><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label="Teléfono"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Especialidad">
                <Select value={form.specialty} onChange={(e) => set('specialty', e.target.value)}>
                  <option value="completo">Completo</option>
                  <option value="tecnico">Técnico</option>
                  <option value="fisico">Físico</option>
                  <option value="mental">Mental</option>
                  <option value="porteros">Porteros</option>
                  <option value="nutricion">Nutrición</option>
                  <option value="recuperacion">Recuperación</option>
                </Select>
              </Field>
              <Field label="Años de experiencia">
                <Input type="number" min={0} value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)} />
              </Field>
            </div>
            <Field label="Titulaciones / certificaciones">
              <Textarea value={form.certifications} onChange={(e) => set('certifications', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Club / Academia"><Input value={form.club} onChange={(e) => set('club', e.target.value)} /></Field>
              <Field label="Web / redes"><Input value={form.web} onChange={(e) => set('web', e.target.value)} /></Field>
            </div>
            <SaveButton pending={save.isPending} onClick={persist} />
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-secondary text-muted-foreground"
              >
                {form.logo_url ? <img src={form.logo_url} alt="Logo" className="size-full object-contain" /> : <Upload className="size-5" />}
              </button>
              <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onLogo} />
              <div className="text-sm text-muted-foreground">Logo para tus informes PDF (PNG, máx 2 MB).</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre de marca"><Input value={form.brand_name} onChange={(e) => set('brand_name', e.target.value)} /></Field>
              <Field label="Color de marca">
                <div className="flex gap-2">
                  <input type="color" value={form.brand_color} onChange={(e) => set('brand_color', e.target.value)} className="h-11 w-14 rounded-md border border-input bg-background" />
                  <Input value={form.brand_color} onChange={(e) => set('brand_color', e.target.value)} />
                </div>
              </Field>
            </div>
            <Field label="Eslogan / firma"><Input value={form.brand_slogan} onChange={(e) => set('brand_slogan', e.target.value)} /></Field>
            <Field label="Pie de página de informes"><Textarea value={form.report_footer} onChange={(e) => set('report_footer', e.target.value)} /></Field>
            <Field label="Disclaimer legal (opcional)"><Textarea value={form.report_disclaimer} onChange={(e) => set('report_disclaimer', e.target.value)} /></Field>
            <SaveButton pending={save.isPending} onClick={persist} />
          </Card>
        </TabsContent>

        <TabsContent value="prefs">
          <Card className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Idioma">
                <Select value={form.prefs.language} onChange={(e) => setPref('language', e.target.value)}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="ca">Català</option>
                </Select>
              </Field>
              <Field label="Formato de fecha">
                <Select value={form.prefs.date_format} onChange={(e) => setPref('date_format', e.target.value)}>
                  <option value="dmy">DD/MM/AAAA</option>
                  <option value="mdy">MM/DD/AAAA</option>
                  <option value="ymd">AAAA-MM-DD</option>
                </Select>
              </Field>
              <Field label="Escala RPE">
                <Select value={form.prefs.rpe_scale} onChange={(e) => setPref('rpe_scale', e.target.value)}>
                  <option value="1-10">1 a 10</option>
                  <option value="1-5">1 a 5</option>
                </Select>
              </Field>
            </div>
            <Field label="Tipos de sesión personalizados">
              <Textarea value={form.prefs.session_types} onChange={(e) => setPref('session_types', e.target.value)} placeholder="Uno por línea" />
            </Field>
            <Field label="Etiquetas de jugador">
              <Textarea value={form.prefs.player_tags} onChange={(e) => setPref('player_tags', e.target.value)} placeholder="Una por línea" />
            </Field>
            <SaveButton pending={save.isPending} onClick={persist} />
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <div className="space-y-4">
            <Card className="flex items-center justify-between p-5">
              <div className="text-sm">
                <div className="font-medium">{form.name || name || 'Coach'}</div>
                <div className="text-muted-foreground">{user?.email}</div>
              </div>
              <ThemeToggle />
            </Card>
            <Card className="space-y-3 p-5">
              <div className="text-sm font-medium">Exportar mis datos</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => exportJson(exportData)}>
                  <FileJson /> JSON
                </Button>
                <Button variant="outline" onClick={() => exportCsv(exportData)}>
                  <Download /> CSV
                </Button>
              </div>
            </Card>
            <Card className="p-5">
              <Button variant="destructive" onClick={() => void signOut()}>
                <LogOut /> Cerrar sesión
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">CAMPO · v1.0</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function SaveButton({ pending, onClick }: { pending: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-1">
      <Button onClick={onClick} disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Guardar
      </Button>
    </div>
  );
}
