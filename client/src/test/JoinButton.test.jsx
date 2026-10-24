import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JoinButton } from '../components/communities/JoinButton.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Frontend Component: JoinButton', () => {
  it('renders "Join" when user is not a member', () => {
    renderWithProviders(
      <JoinButton communityId="comm-123" initialIsMember={false} />
    );

    expect(screen.getByText('Join')).toBeInTheDocument();
  });

  it('renders "Joined" when user is already a member', () => {
    renderWithProviders(
      <JoinButton communityId="comm-123" initialIsMember={true} />
    );

    expect(screen.getByText('Joined')).toBeInTheDocument();
  });
});
