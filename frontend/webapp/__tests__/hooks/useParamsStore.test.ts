import { act, renderHook } from '@testing-library/react';
import { useParamStore } from '@/hooks/useParamsStore';

describe('useParamsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useParamStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const { result } = renderHook(() => useParamStore());

      expect(result.current.pageNumber).toBe(1);
      expect(result.current.pageSize).toBe(16);
      expect(result.current.pageCount).toBe(1);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchValue).toBe('');
      expect(result.current.orderBy).toBe('endingSoon');
      expect(result.current.filterBy).toBe('live');
      expect(result.current.seller).toBeUndefined();
      expect(result.current.winner).toBeUndefined();
    });
  });

  describe('setParams', () => {
    it('should update pageNumber without resetting to 1', () => {
      const { result } = renderHook(() => useParamStore());

      act(() => {
        result.current.setParams({ pageNumber: 5 });
      });

      expect(result.current.pageNumber).toBe(5);
    });

    it('should reset pageNumber to 1 when updating other params', () => {
      const { result } = renderHook(() => useParamStore());

      // First set page number to something other than 1
      act(() => {
        result.current.setParams({ pageNumber: 5 });
      });
      expect(result.current.pageNumber).toBe(5);

      // Then update another param - should reset to page 1
      act(() => {
        result.current.setParams({ filterBy: 'finished' });
      });

      expect(result.current.pageNumber).toBe(1);
      expect(result.current.filterBy).toBe('finished');
    });

    it('should update multiple params at once', () => {
      const { result } = renderHook(() => useParamStore());

      act(() => {
        result.current.setParams({
          orderBy: 'new',
          filterBy: 'finished',
          searchTerm: 'test',
        });
      });

      expect(result.current.orderBy).toBe('new');
      expect(result.current.filterBy).toBe('finished');
      expect(result.current.searchTerm).toBe('test');
      expect(result.current.pageNumber).toBe(1);
    });

    it('should update seller filter', () => {
      const { result } = renderHook(() => useParamStore());

      act(() => {
        result.current.setParams({ seller: 'testUser' });
      });

      expect(result.current.seller).toBe('testUser');
    });

    it('should update winner filter', () => {
      const { result } = renderHook(() => useParamStore());

      act(() => {
        result.current.setParams({ winner: 'winnerUser' });
      });

      expect(result.current.winner).toBe('winnerUser');
    });
  });

  describe('reset', () => {
    it('should reset all values to initial state', () => {
      const { result } = renderHook(() => useParamStore());

      // Modify state
      act(() => {
        result.current.setParams({
          pageNumber: 5,
          orderBy: 'new',
          filterBy: 'finished',
          searchTerm: 'test',
          seller: 'user1',
        });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.pageNumber).toBe(1);
      expect(result.current.pageSize).toBe(16);
      expect(result.current.orderBy).toBe('endingSoon');
      expect(result.current.filterBy).toBe('live');
      expect(result.current.searchTerm).toBe('');
      expect(result.current.seller).toBeUndefined();
    });
  });

  describe('setSearchValue', () => {
    it('should update search value independently', () => {
      const { result } = renderHook(() => useParamStore());

      act(() => {
        result.current.setSearchValue('hero name');
      });

      expect(result.current.searchValue).toBe('hero name');
      // searchTerm should remain unchanged
      expect(result.current.searchTerm).toBe('');
    });

    it('should allow clearing search value', () => {
      const { result } = renderHook(() => useParamStore());

      act(() => {
        result.current.setSearchValue('test');
      });
      expect(result.current.searchValue).toBe('test');

      act(() => {
        result.current.setSearchValue('');
      });
      expect(result.current.searchValue).toBe('');
    });
  });
});
