import { create } from "zustand"

type State = {
    pageNumber: number
    pageSize: number
    pageCount: number
    searchTerm: string
    searchValue: string
    orderBy: string
    filterBy: string
    seller?: string
    winner?: string
    rarity?: string
    discipline?: string
}

type Actions = {
    setParams: (params: Partial<State>) => void
    reset: () => void
    setSearchValue: (value: string) => void
}

const initialState: State = {
    pageNumber: 1,
    pageSize: 16,
    pageCount: 1,
    searchTerm: '',
    searchValue: '',
    orderBy: 'endingSoon',
    filterBy: 'live',
    seller: undefined,
    winner: undefined,
    rarity: 'all',
    discipline: 'all'
}

export const useParamStore = create<State & Actions>() ((set) => ({
    ...initialState,

    setParams: (newParams: Partial<State>) => {
        set((state) => {
            // merge params and bump back to first page unless caller explicitly set pageNumber
            const hasPageNumber = typeof newParams.pageNumber === "number";
            let next = {
                ...state,
                ...newParams,
                pageNumber: hasPageNumber ? newParams.pageNumber! : 1,
            };

            // If caller didn't explicitly set seller/winner, clear them so stale filters don't stick
            if (!("seller" in newParams)) {
                next = { ...next, seller: undefined };
            }
            if (!("winner" in newParams)) {
                next = { ...next, winner: undefined };
            }

            return next;
        })
    },
    
    reset: () => set(initialState),

    setSearchValue: (value: string) => {
        set({searchValue: value})
    }
}))
