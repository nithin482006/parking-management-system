import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnauthorizedView } from './UnauthorizedView';

describe('UnauthorizedView', () => {
  it('renders the main heading', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText('Please Log In')).toBeInTheDocument();
  });

  it('displays the description text', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText(/To access your parking dashboard/i)).toBeInTheDocument();
  });

  it('renders feature list items', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText(/Browse available parking slots/i)).toBeInTheDocument();
    expect(screen.getByText(/Book parking spaces/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage your bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Get instant booking confirmations/i)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText('Real-time Availability')).toBeInTheDocument();
    expect(screen.getByText('Transparent Pricing')).toBeInTheDocument();
    expect(screen.getByText('Secure & Safe')).toBeInTheDocument();
    expect(screen.getByText('Multiple Locations')).toBeInTheDocument();
  });

  it('renders info box with first-time user guidance', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText('First time here?')).toBeInTheDocument();
    expect(screen.getByText(/Click the "Log In Now" button/i)).toBeInTheDocument();
  });

  it('renders login button when loginUrl is provided', () => {
    render(<UnauthorizedView loginUrl="https://example.com/login" />);
    const loginButtons = screen.getAllByText(/Log In/i);
    expect(loginButtons.length).toBeGreaterThan(0);
    // Check that at least one button has the href attribute
    const linkWithHref = loginButtons.find(btn => btn.closest('a'));
    expect(linkWithHref).toBeInTheDocument();
  });

  it('renders disabled login button when loginUrl is not provided', () => {
    render(<UnauthorizedView />);
    const disabledButton = screen.getByRole('button', { name: /Log In Now/i });
    expect(disabledButton).toBeDisabled();
  });

  it('displays OAuth error message when provided', () => {
    const errorMsg = 'OAuth is not configured in this environment';
    render(<UnauthorizedView oauthError={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('displays loading state when no loginUrl and no error', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText(/© 2026 ParkHub/i)).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    render(<UnauthorizedView />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('ParkHub')).toBeInTheDocument();
  });

  it('renders all feature descriptions', () => {
    render(<UnauthorizedView />);
    expect(screen.getByText(/Check parking slot availability instantly/i)).toBeInTheDocument();
    expect(screen.getByText(/No hidden fees/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise-grade security/i)).toBeInTheDocument();
    expect(screen.getByText(/Access parking across various facilities/i)).toBeInTheDocument();
  });
});
