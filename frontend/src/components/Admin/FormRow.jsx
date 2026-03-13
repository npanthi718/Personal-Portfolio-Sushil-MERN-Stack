import React from 'react';

export default function FormRow({ children, columns = 4 }) {
  const grid = { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 'var(--space-2)' };
  return <div style={grid}>{children}</div>;
}
