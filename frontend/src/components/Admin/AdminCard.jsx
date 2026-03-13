import React from 'react';

export default function AdminCard({ title, children, actions }) {
  return (
    <div style={{ 
      background: '#1e1e1e', 
      border: '1px solid #333', 
      borderRadius: 16, 
      padding: '2rem', 
      marginBottom: '2rem', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
    }}>
      {title ? (
        <h2 style={{ 
          fontSize: '1.5rem', 
          margin: 0, 
          marginBottom: '1.5rem', 
          color: '#00bcd4', 
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {title}
          {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
        </h2>
      ) : null}
      {children}
    </div>
  );
}
