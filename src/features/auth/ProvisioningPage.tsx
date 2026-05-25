import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { signOut } from '@/services/auth.service';

export function ProvisioningPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-5">
      <Card className="max-w-md p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-warning" />
        <h1 className="font-display text-xl font-bold">Cuenta pendiente de activar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No hemos podido asociar esta cuenta a un entrenador o jugador. Si eres jugador,
          revisa que el código de invitación sea correcto. Si eres entrenador, vuelve a iniciar sesión.
        </p>
        <Button className="mt-5" variant="secondary" onClick={() => void signOut()}>
          <LogOut /> Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}
