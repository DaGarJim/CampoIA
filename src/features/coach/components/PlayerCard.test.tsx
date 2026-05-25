import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayerCard } from './PlayerCard';
import type { Player } from '@/types/domain';

const player: Player = {
  id: '1',
  coach_id: 'c',
  auth_user_id: null,
  name: 'Iker Muñoz',
  pos: 'Delantero',
  pos_group: 'Delantero',
  age: 18,
  foot: 'Derecho',
  club: 'Juvenil A',
  category: null,
  status: 'risk',
  trend: 'eq',
  score: 62,
  adherence: 71,
  mins: 520,
  callups: 14,
  played: 12,
  scored: 9,
  assisted: 4,
  sleep: null,
  tag: null,
  height_cm: null,
  weight_kg: null,
  photo_url: null,
  created_at: '',
};

describe('PlayerCard', () => {
  it('muestra nombre, score y estado', () => {
    render(<PlayerCard player={player} />);
    expect(screen.getByText('Iker Muñoz')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('En riesgo')).toBeInTheDocument();
    expect(screen.getByText('Juvenil A · Delantero')).toBeInTheDocument();
  });
});
