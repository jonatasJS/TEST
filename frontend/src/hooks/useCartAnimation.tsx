/**
 * CartAnimationContext
 *
 * Contexto global que gerencia a animação de "voar para o carrinho".
 * Expõe:
 *   - cartIconRef  → ref do botão do carrinho na Navbar (para capturar posição)
 *   - flyToCart(sourceRect, imageUrl) → dispara uma animação de clone voando até o carrinho
 */

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useId,
} from 'react';

export interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  endX: number;
  endY: number;
}

interface CartAnimationContextType {
  /** Ref do botão do ícone do carrinho na Navbar — registre com ref={cartIconRef} */
  cartIconRef: React.RefObject<HTMLButtonElement | null>;
  /** Dispara a animação a partir do rect do elemento de origem */
  flyToCart: (sourceRect: DOMRect, imageUrl: string) => void;
  /** Lista de clones voando atualmente (consumida pelo CartAnimationLayer) */
  flyingItems: FlyingItem[];
  /** Remove um clone do estado após a animação terminar */
  removeFlyingItem: (id: string) => void;
  /** Indica se o ícone do carrinho deve executar bounce */
  cartBouncing: boolean;
  /** Trigger do bounce — chamado internamente ao clonar chegar ao destino */
  triggerCartBounce: () => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | null>(null);

export const CartAnimationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBouncing, setCartBouncing] = useState(false);

  const flyToCart = useCallback((sourceRect: DOMRect, imageUrl: string) => {
    // Capturar a posição atual do ícone do carrinho
    const cartEl = cartIconRef.current;
    if (!cartEl) return;

    const cartRect = cartEl.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    const id = `fly-${Date.now()}-${Math.random()}`;

    setFlyingItems((prev) => [
      ...prev,
      {
        id,
        imageUrl,
        startX: sourceRect.left,
        startY: sourceRect.top,
        startW: sourceRect.width,
        startH: sourceRect.height,
        endX,
        endY,
      },
    ]);
  }, []);

  const removeFlyingItem = useCallback((id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const triggerCartBounce = useCallback(() => {
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 600);
  }, []);

  return (
    <CartAnimationContext.Provider
      value={{
        cartIconRef,
        flyToCart,
        flyingItems,
        removeFlyingItem,
        cartBouncing,
        triggerCartBounce,
      }}
    >
      {children}
    </CartAnimationContext.Provider>
  );
};

export const useCartAnimation = () => {
  const ctx = useContext(CartAnimationContext);
  if (!ctx)
    throw new Error('useCartAnimation deve ser usado dentro de CartAnimationProvider');
  return ctx;
};
