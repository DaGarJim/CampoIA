import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayerCard } from './PlayerCard';
import { makePlayer } from '@/test/factories';

const player = makePlayer({
  id: '1',
  coach_id: 'c',
  name: 'Iker Muñoz',
  pos: 'Delantero',
  pos_group: 'Delantero',
  club: 'Juvenil A',
  status: 'risk',
  score: 62,
  adherence: 71,
  mins: 520,
  callups: 14,
  played: 12,
  scored: 9,
  assisted: 4,
  created_at: '',
});

describe('PlayerCard', () => {
  it('muestra nombre, score y estado', () => {
    render(<PlayerCard player={player} />);
    expect(screen.getByText('Iker Muñoz')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('En riesgo')).toBeInTheDocument();
    expect(screen.getByText('Juvenil A · Delantero')).toBeInTheDocument();
  });
});
