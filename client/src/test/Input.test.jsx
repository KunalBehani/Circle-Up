import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../components/common/Input.jsx';

describe('Frontend Component: Input', () => {
  it('renders input with label and placeholder', () => {
    render(
      <Input
        label="Username"
        placeholder="Enter your username"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <Input
        label="Email"
        placeholder="you@example.com"
        value=""
        onChange={() => {}}
        error="Invalid email address"
      />
    );

    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });
});
