import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { VoteControl } from '../components/posts/VoteControl.jsx';
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

describe('Frontend Component: VoteControl', () => {
  it('renders initial score and controls correctly', () => {
    renderWithProviders(
      <VoteControl postId="post-123" initialScore={42} initialUserVote={null} />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByLabelText('Upvote')).toBeInTheDocument();
    expect(screen.getByLabelText('Downvote')).toBeInTheDocument();
  });

  it('renders active upvote state styling', () => {
    renderWithProviders(
      <VoteControl postId="post-123" initialScore={10} initialUserVote={1} />
    );

    const scoreElem = screen.getByText('10');
    expect(scoreElem).toHaveClass('text-brand-600');
  });

  it('renders active downvote state styling', () => {
    renderWithProviders(
      <VoteControl postId="post-123" initialScore={-2} initialUserVote={-1} />
    );

    const scoreElem = screen.getByText('-2');
    expect(scoreElem).toHaveClass('text-rose-600');
  });
});
