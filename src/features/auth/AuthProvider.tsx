import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { detectRole, displayName, getCurrentSession, onAuthChange } from '@/services/auth.service';
import type { Role } from '@/types/domain';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unprovisioned';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  role: Role | null;
  name: string;
}

const initialState: AuthState = {
  status: 'loading',
  session: null,
  user: null,
  role: null,
  name: '',
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    let active = true;

    async function resolve(session: Session | null) {
      if (!active) return;
      if (session?.user) {
        // detectRole provisiona vía RPC y devuelve el rol REAL de la BD.
        // null (o un fallo de aprovisionamiento) => sesión válida pero sin rol:
        // estado 'unprovisioned', no se cierra sesión ni se asume un rol.
        let role: Role | null = null;
        try {
          role = await detectRole(session.user);
        } catch {
          role = null;
        }
        if (!active) return;
        setState({
          status: role ? 'authenticated' : 'unprovisioned',
          session,
          user: session.user,
          role,
          name: displayName(session.user),
        });
      } else {
        setState({ status: 'unauthenticated', session: null, user: null, role: null, name: '' });
      }
    }

    getCurrentSession()
      .then(resolve)
      .catch(() => {
        if (active) setState({ ...initialState, status: 'unauthenticated' });
      });

    const unsubscribe = onAuthChange((session) => {
      void resolve(session);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider; consumers import from here
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
