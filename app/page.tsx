"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- 1. 类型定义 ---
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

// --- 2. 注入分类后的数据 ---
const MENU_DATA: MenuItem[] = [
  { id: 1, name: '正宗原汤油茶 (小碗)', description: '标准份量。老叶红茶、生姜、大蒜铁锅手工捶打。初饮微苦，而后回甘。', price: 15.0, imageUrl: '/image/chatang.png', type: 'base' },
  { id: 2, name: '正宗原汤油茶 (大碗)', description: '畅饮大满足！适合资深油茶爱好者，茶汤浓郁，回味悠长。', price: 22.0, imageUrl: '/image/chatang.png', type: 'base' },
  { id: 3, name: '美味金黄油果', description: '油茶的灵魂伴侣。金黄酥脆，泡入滚烫的茶汤中吸满姜香与茶香。', price: 8.0, imageUrl: '/image/youguo.png', type: 'side' },
  { id: 4, name: '柴火现炒阴米', description: '本地优质糯米阴干后大火爆炒，撒入茶中带来咯吱咯吱的咀嚼乐趣。', price: 5.0, imageUrl: '/image/chaomi.png', type: 'side' },
  { id: 5, name: '农家酥脆花生', description: '农家自种红皮小花生，小火慢焙至酥脆，越嚼越香，提升层次感。', price: 6.0, imageUrl: '/image/huasheng.png', type: 'side' },
  { id: 6, name: '提鲜葱花', description: '新鲜切段的本地香葱与香菜，热茶一激，瞬间释放出清本植物香气。', price: 2.0, imageUrl: '/image/conghua.png', type: 'side' }
];

export default function OrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('order_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

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
    localStorage.setItem('order_cart', JSON.stringify(cart));
    router.push('/checkout');
  };

  return (
    /* 核心修复 1：手机端使用 min-h-screen 允许正常滑动，平板端 (md:) 才锁定 h-screen 和 overflow-hidden */
    <div className="min-h-screen md:h-screen bg-stone-100 text-stone-800 font-sans flex flex-col md:overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <header className="bg-emerald-800 text-stone-50 pt-8 pb-10 px-4 md:px-8 relative overflow-hidden shadow-md flex-shrink-0 z-10">
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
          <p className="text-emerald-100 text-sm md:text-base max-w-md leading-relaxed hidden md:block">
            “一杯苦，二杯涩，三杯四杯好畅快。” 一锅打尽百草香。搭配各式酥脆小吃，品味流传百年的中国式咖啡。
          </p>
        </div>
      </header>

      {/* 核心修复 2：手机端允许超出，平板端隐藏溢出 */}
      <main className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 md:overflow-hidden">
        
        {/* 菜单列表区 */}
        <section className="flex-1 md:overflow-y-auto hide-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {MENU_DATA.map((item) => {
              const isDisabled = item.type === 'side' && !hasBaseInCart;

              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-200 flex flex-col group">
                  <div className="relative h-48 md:h-44 overflow-hidden bg-stone-200">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className={`w-full h-full object-cover transition-all duration-500 ${isDisabled ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <h3 className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col justify-between bg-white">
                    <p className="text-xs text-stone-500 mb-4 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className={`flex items-baseline gap-1 ${isDisabled ? 'text-stone-400' : 'text-emerald-700'}`}>
                        <span className="text-xs font-bold">¥</span>
                        <span className="text-xl font-black">{item.price.toFixed(2)}</span>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isDisabled}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                          isDisabled 
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-200'
                        }`}
                      >
                        <span>{isDisabled ? '请先选茶' : '添碗'}</span>
                        {!isDisabled && <span className="text-base leading-none">+</span>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 核心修复 3：购物车区域，手机端靠边距隔开并设定最大高度，平板端高度占满 (md:h-full) */}
        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 md:h-full flex flex-col bg-[#fcfaf8] rounded-2xl shadow-lg border border-stone-200 overflow-hidden mb-8 md:mb-0">
          
          <div className="bg-amber-100/50 p-4 border-b border-amber-200/50 flex justify-between items-center flex-shrink-0">
            <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <span className="text-xl">🍵</span> 当前茶档
            </h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-full shadow-inner">
              共 {totalQuantity} 份
            </span>
          </div>

          {/* 手机端购物车高度限制 max-h-[50vh]，避免过长 */}
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
                    <div className="font-bold text-stone-800 text-sm line-clamp-1">
                      {item.name}
                      {item.type === 'base' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded ml-1.5 align-middle">主</span>}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">¥{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-lg active:bg-stone-200">-</button>
                    <span className="w-6 text-center text-sm font-bold text-stone-700">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors text-lg active:bg-stone-200">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 md:p-5 border-t border-stone-200 bg-white flex-shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-4">
              <span className="text-stone-500 text-sm font-medium">合计香资：</span>
              <div className="text-right">
                <span className="text-sm text-emerald-700 font-bold mr-1">¥</span>
                <span className="text-3xl font-black text-emerald-700 leading-none">{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleGoToCheckout}
              disabled={!hasBaseInCart}
              className="w-full bg-emerald-600 disabled:bg-stone-300 disabled:text-stone-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md flex justify-center items-center gap-2"
            >
              前往茶台结账
            </button>
          </div>
        </aside>

      </main>
    </div>
  );
}