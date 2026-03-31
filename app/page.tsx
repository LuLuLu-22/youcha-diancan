"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type ItemCategory = 'base' | 'side';

type MenuItem = { 
  id: number; 
  name: string; 
  description: string;
  price: number; 
  imageUrl: string; 
  type: ItemCategory; 
};

type CartItem = MenuItem & { quantity: number; };

const MENU_DATA: MenuItem[] = [
  { id: 1, name: '正宗原汤油茶 (小碗)', description: '标准份量。生姜大蒜铁锅手工捶打，回甘无穷。', price: 15.0, imageUrl: '/image/chatang.png', type: 'base' },
  { id: 2, name: '正宗原汤油茶 (大碗)', description: '畅饮大满足！茶汤浓郁，回味悠长。', price: 22.0, imageUrl: '/image/chatang.png', type: 'base' },
  { id: 3, name: '美味金黄油果', description: '油茶灵魂伴侣。金黄酥脆，吸满茶香。', price: 8.0, imageUrl: '/image/youguo.png', type: 'side' },
  { id: 4, name: '柴火现炒阴米', description: '本地优质糯米爆炒，带来咯吱咯吱的咀嚼乐趣。', price: 5.0, imageUrl: '/image/chaomi.png', type: 'side' },
  { id: 5, name: '农家酥脆花生', description: '小火慢焙至酥脆，提升油茶层次感。', price: 6.0, imageUrl: '/image/huasheng.png', type: 'side' },
  { id: 6, name: '提鲜葱花', description: '新鲜香葱与香菜，热茶一激，瞬间提香。', price: 2.0, imageUrl: '/image/conghua.png', type: 'side' }
];

export default function OrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- 核心改动：删除了 useEffect 恢复缓存的逻辑 ---
  // 现在只要刷新页面，cart 状态就会重置为 []

  const hasBaseInCart = useMemo(() => cart.some(item => item.type === 'base'), [cart]);
  const totalQuantity = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleAddToCart = (item: MenuItem) => {
    if (item.type === 'side' && !hasBaseInCart) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === id) return { ...item, quantity: item.quantity + delta };
        return item;
      }).filter((item) => item.quantity > 0);

      const stillHasBase = updatedCart.some(item => item.type === 'base');
      if (!stillHasBase) return []; 
      return updatedCart;
    });
  };

  const handleGoToCheckout = () => {
    if (cart.length === 0) return;
    // 跳转前依然保存一份，确保结算页能拿到当前订单
    localStorage.setItem('order_cart', JSON.stringify(cart));
    router.push('/checkout');
  };

  return (
    <div className="bg-stone-100 text-stone-800 font-sans pb-12 md:pb-0 md:h-screen md:flex md:flex-col md:overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <header className="bg-emerald-800 text-stone-50 pt-8 pb-10 px-4 md:px-8 relative overflow-hidden shadow-md md:flex-shrink-0 z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-amber-500 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs mb-3 shadow-sm">
              国家级非物质文化遗产
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              瑶乡打油茶 <span className="font-light text-emerald-200">|</span> 体验馆
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 md:flex-1 md:flex md:flex-row md:gap-6 md:overflow-hidden">
        
        <section className="mb-8 md:mb-0 md:flex-1 md:overflow-y-auto hide-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {MENU_DATA.map((item) => {
              const isDisabled = item.type === 'side' && !hasBaseInCart;
              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 flex flex-col group">
                  <div className="relative h-48 md:h-44 overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className={`w-full h-full object-cover transition-all ${isDisabled ? 'grayscale opacity-70' : ''}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <h3 className="absolute bottom-3 left-4 text-white font-bold text-lg">{item.name}</h3>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between bg-white">
                    <p className="text-xs text-stone-500 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className={`flex items-baseline gap-1 ${isDisabled ? 'text-stone-400' : 'text-emerald-700'}`}>
                        <span className="text-xs font-bold">¥</span>
                        <span className="text-xl font-black">{item.price.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isDisabled}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          isDisabled ? 'bg-stone-100 text-stone-400 border border-stone-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isDisabled ? '请先选茶' : '添碗 +'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-[#fcfaf8] rounded-2xl shadow-lg border border-stone-200 overflow-hidden md:h-full md:flex-shrink-0">
          <div className="bg-amber-100/50 p-4 border-b border-amber-200/50 flex justify-between items-center">
            <h2 className="text-base font-bold text-amber-900">🍵 当前茶档</h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-full">共 {totalQuantity} 份</span>
          </div>

          <div className="flex-grow overflow-y-auto hide-scrollbar p-4 space-y-3 max-h-[50vh] md:max-h-none">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-3 py-6">
                <div className="w-16 h-16 border-4 border-dashed border-stone-300 rounded-full flex items-center justify-center text-2xl">🥣</div>
                <p className="text-sm font-medium">请先选择一碗油茶打底</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-stone-800 text-sm line-clamp-1">{item.name}</div>
                    <div className="text-xs text-emerald-600 font-bold">¥{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center">-</button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 md:p-5 border-t border-stone-200 bg-white">
            <div className="flex justify-between items-end mb-4">
              <span className="text-stone-500 text-sm">合计香资：</span>
              <span className="text-3xl font-black text-emerald-700 leading-none">¥{totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={handleGoToCheckout}
              disabled={!hasBaseInCart}
              className="w-full bg-emerald-600 disabled:bg-stone-300 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700"
            >
              前往茶台结账
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}