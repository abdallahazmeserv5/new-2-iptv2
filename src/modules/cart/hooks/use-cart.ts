import { Media, Plan } from '@/payload-types'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  planId: string
  quantity: number
  addedAt: string
  plan: Plan
}

// Define cart state type
export interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isInitialized: boolean
}

// Define cart actions
interface CartActions {
  // Cart actions
  addToCart: (plan: Plan, quantity?: number) => void
  updateItemQuantity: (planId: string, quantity: number) => void
  removeFromCart: (planId: string) => void
  clearCart: () => void

  // Utility functions
  getCartItem: (planId: string) => CartItem | undefined
  isInCart: (planId: string) => boolean
  getItemQuantity: (planId: string) => number
  getCartForComponent: () => {
    items: CartItem[]
    totalQuantity: number
    totalPrice: number
  }

  // Internal actions
  setInitialized: (initialized: boolean) => void
  calculateTotals: () => void
}

type CartStore = CartState & CartActions

// Helper function to calculate totals
const calculateTotalsHelper = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.plan.price * item.quantity, 0)
  return { totalItems, totalPrice }
}

// Create the Zustand store with persistence
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isInitialized: false,

      // Actions
      addToCart: (plan: Plan, quantity: number = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.planId === plan.id)
          let updatedItems: CartItem[]

          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            updatedItems = state.items.map((item, index) =>
              index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
            )
          } else {
            // Item doesn't exist, add new item
            const newItem: CartItem = {
              planId: plan.id,
              quantity,
              addedAt: new Date().toISOString(),
              plan: {
                id: plan.id,
                title: plan.title,
                price: plan.price,
                priceBeforeDiscount: plan.priceBeforeDiscount,
                description: plan.description,
                numberOfSubscriptions: plan.numberOfSubscriptions,
                image: plan.image as Media,
                features: plan.features || [],
                downloadPlatforms: plan.downloadPlatforms || [],
                reviews: plan.reviews || [],
                duration: plan.duration,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
              },
            }
            updatedItems = [...state.items, newItem]
          }

          const { totalItems, totalPrice } = calculateTotalsHelper(updatedItems)

          // Dispatch custom event for same-tab cart updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('guestCartUpdated'))
          }

          return {
            items: updatedItems,
            totalItems,
            totalPrice,
          }
        })
      },

      updateItemQuantity: (planId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(planId)
          return
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.planId === planId ? { ...item, quantity } : item,
          )

          const { totalItems, totalPrice } = calculateTotalsHelper(updatedItems)

          // Dispatch custom event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('guestCartUpdated'))
          }

          return {
            items: updatedItems,
            totalItems,
            totalPrice,
          }
        })
      },

      removeFromCart: (planId: string) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.planId !== planId)
          const { totalItems, totalPrice } = calculateTotalsHelper(updatedItems)

          // Dispatch custom event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('guestCartUpdated'))
          }

          return {
            items: updatedItems,
            totalItems,
            totalPrice,
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        })

        // Dispatch custom event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('guestCartUpdated'))
        }
      },

      getCartItem: (planId: string) => {
        return get().items.find((item) => item.planId === planId)
      },

      isInCart: (planId: string) => {
        return get().items.some((item) => item.planId === planId)
      },

      getItemQuantity: (planId: string) => {
        const item = get().getCartItem(planId)
        return item?.quantity || 0
      },

      getCartForComponent: () => {
        const state = get()
        return {
          items: state.items,
          totalQuantity: state.totalItems,
          totalPrice: state.totalPrice,
        }
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized })
      },

      calculateTotals: () => {
        const state = get()
        const { totalItems, totalPrice } = calculateTotalsHelper(state.items)
        set({ totalItems, totalPrice })
      },
    }),
    {
      name: 'guestCart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        // Only persist items, totals will be recalculated on hydration
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate totals after hydration
          const { totalItems, totalPrice } = calculateTotalsHelper(state.items)
          state.totalItems = totalItems
          state.totalPrice = totalPrice
          state.isInitialized = true
        }
      },
    },
  ),
)

// Custom hook that maintains the same interface as your original useCart hook
export const useCart = () => {
  const store = useCartStore()

  return {
    // Cart state
    cart: {
      items: store.items,
      totalItems: store.totalItems,
      totalPrice: store.totalPrice,
    },
    items: store.items,
    totalItems: store.totalItems,
    totalPrice: store.totalPrice,
    isInitialized: store.isInitialized,

    // Cart actions
    addToCart: store.addToCart,
    updateItemQuantity: store.updateItemQuantity,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,

    // Utility functions
    getCartItem: store.getCartItem,
    isInCart: store.isInCart,
    getItemQuantity: store.getItemQuantity,
    getCartForComponent: store.getCartForComponent,
  }
}
