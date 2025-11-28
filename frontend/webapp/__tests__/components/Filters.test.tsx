import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Filters from '@/app/auctions/Filters';
import { useParamStore } from '@/hooks/useParamsStore';

// Mock flowbite-react Button components with compound component pattern
jest.mock('flowbite-react', () => {
  const MockButton = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button onClick={onClick} className={className} data-testid="filter-button">
      {children}
    </button>
  );

  const MockButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="button-group">{children}</div>
  );

  // Attach Group as a property of Button
  (MockButton as typeof MockButton & { Group: typeof MockButtonGroup }).Group = MockButtonGroup;

  return {
    Button: MockButton,
  };
});

describe('Filters', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useParamStore.getState().reset();
    });
  });

  describe('rendering', () => {
    it('should render filter by section', () => {
      render(<Filters />);

      expect(screen.getByText('Filter by')).toBeInTheDocument();
    });

    it('should render order by section', () => {
      render(<Filters />);

      expect(screen.getByText('Order by')).toBeInTheDocument();
    });

    it('should render page size section', () => {
      render(<Filters />);

      expect(screen.getByText('Page size')).toBeInTheDocument();
    });

    it('should render all filter options', () => {
      render(<Filters />);

      expect(screen.getByText('Live Auctions')).toBeInTheDocument();
      expect(screen.getByText('Closing Soon')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render all order options', () => {
      render(<Filters />);

      expect(screen.getByText('Ending Soon')).toBeInTheDocument();
      expect(screen.getByText('Newest First')).toBeInTheDocument();
      expect(screen.getByText('A → Z')).toBeInTheDocument();
    });

    it('should render all page size options', () => {
      render(<Filters />);

      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
      expect(screen.getByText('48')).toBeInTheDocument();
    });
  });

  describe('filter interactions', () => {
    it('should update filterBy when filter button is clicked', () => {
      render(<Filters />);

      const completedButton = screen.getByText('Completed');
      fireEvent.click(completedButton);

      expect(useParamStore.getState().filterBy).toBe('finished');
    });

    it('should update filterBy to live when Live Auctions is clicked', () => {
      // First set to something else
      act(() => {
        useParamStore.getState().setParams({ filterBy: 'finished' });
      });

      render(<Filters />);

      const liveButton = screen.getByText('Live Auctions');
      fireEvent.click(liveButton);

      expect(useParamStore.getState().filterBy).toBe('live');
    });
  });

  describe('order interactions', () => {
    it('should update orderBy when order button is clicked', () => {
      render(<Filters />);

      const newestButton = screen.getByText('Newest First');
      fireEvent.click(newestButton);

      expect(useParamStore.getState().orderBy).toBe('new');
    });

    it('should update orderBy to title when A → Z is clicked', () => {
      render(<Filters />);

      const titleButton = screen.getByText('A → Z');
      fireEvent.click(titleButton);

      expect(useParamStore.getState().orderBy).toBe('title');
    });
  });

  describe('page size interactions', () => {
    it('should update pageSize when page size button is clicked', () => {
      render(<Filters />);

      const size32Button = screen.getByText('32');
      fireEvent.click(size32Button);

      expect(useParamStore.getState().pageSize).toBe(32);
    });

    it('should update pageSize to 48', () => {
      render(<Filters />);

      const size48Button = screen.getByText('48');
      fireEvent.click(size48Button);

      expect(useParamStore.getState().pageSize).toBe(48);
    });

    it('should update pageSize to 16', () => {
      // First set to something else
      act(() => {
        useParamStore.getState().setParams({ pageSize: 32 });
      });

      render(<Filters />);

      const size16Button = screen.getByText('16');
      fireEvent.click(size16Button);

      expect(useParamStore.getState().pageSize).toBe(16);
    });
  });

  describe('state reflection', () => {
    it('should reflect the current store state for filterBy', () => {
      act(() => {
        useParamStore.getState().setParams({ filterBy: 'finished' });
      });

      render(<Filters />);

      // The component should have access to the updated state
      expect(useParamStore.getState().filterBy).toBe('finished');
    });

    it('should reflect the current store state for orderBy', () => {
      act(() => {
        useParamStore.getState().setParams({ orderBy: 'title' });
      });

      render(<Filters />);

      expect(useParamStore.getState().orderBy).toBe('title');
    });

    it('should reflect the current store state for pageSize', () => {
      act(() => {
        useParamStore.getState().setParams({ pageSize: 48 });
      });

      render(<Filters />);

      expect(useParamStore.getState().pageSize).toBe(48);
    });
  });
});
