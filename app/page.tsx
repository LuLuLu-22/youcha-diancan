"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- 1. 类型定义 ---
type ItemCategory = 'base' | 'side'; // 新增：商品分类

type MenuItem = { 
  id: number; 
  name: string; 
  description: string;
  price: number; 
  imageUrl: string; 
  type: ItemCategory; // 新增：标记是茶底还是小料
};

type CartItem = MenuItem & { quantity: number; };

// --- 2. 注入分类后的数据 ---
const MENU_DATA: MenuItem[] = [
  { 
    id: 1, 
    name: '瑶乡原汤油茶 (小碗)', 
    description: '标准份量。老叶红茶、生姜、大蒜铁锅手工捶打。初饮微苦，而后回甘。',
    price: 15.0, 
    imageUrl: '/image/chatang.png',
    type: 'base' // 茶底
  },
  { 
    id: 2, 
    name: '瑶乡原汤油茶 (大碗)', 
    description: '畅饮大满足！适合资深油茶爱好者，茶汤浓郁，回味悠长。',
    price: 22.0, 
    imageUrl: '/image/chatang.png',
    type: 'base' // 茶底
  },
  { 
    id: 3, 
    name: '手工金黄油果', 
    description: '油茶的灵魂伴侣。金黄酥脆，泡入滚烫的茶汤中吸满姜香与茶香。',
    price: 8.0, 
    imageUrl: '/image/youguo.png',
    type: 'side' // 小料
  },
  { 
    id: 4, 
    name: '柴火现炒阴米', 
    description: '本地优质糯米阴干后大火爆炒，撒入茶中带来咯吱咯吱的咀嚼乐趣。',
    price: 5.0, 
    imageUrl: '/image/chaomi.png',
    type: 'side' // 小料
  },
  { 
    id: 5, 
    name: '农家红衣花生', 
    description: '农家自种红皮小花生，小火慢焙至酥脆，越嚼越香，提升层次感。',
    price: 6.0, 
    imageUrl: '/image/huasheng.png',
    type: 'side' // 小料
  },
  { 
    id: 6, 
    name: '提鲜葱花芫荽', 
    description: '新鲜切段的本地香葱与香菜，热茶一激，瞬间释放出清本植物香气。',
    price: 2.0, 
    imageUrl: '/image/conghua.png',
    type: 'side' // 小料
  }
];

export default function OrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  // 恢复本地购物车数据
  useEffect(() => {
    const savedCart = localStorage.getItem('order_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // --- 核心逻辑：判断购物车里是否有茶底 ---
  const hasBaseInCart = useMemo(() => {
    return cart.some(item => item.type === 'base');
  }, [cart]);

  const totalQuantity = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  // 交互逻辑
  const handleAddToCart = (item: MenuItem) => {
    // 双重保险：如果没选茶底且当前点击的是小料，直接拦截（防止通过修改 HTML 强行点击）
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

      // 联动逻辑：如果减掉的是最后一份茶底，自动清空所有小料（可选，但体验更好）
      const stillHasBase = updatedCart.some(item => item.type === 'base');
      if (!stillHasBase) {
        return []; // 没茶底了，直接清空购物车
      }

      return updatedCart;
    });
  };

  const handleGoToCheckout = () => {
    if (cart.length === 0) return;
    localStorage.setItem('order_cart', JSON.stringify(cart));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans pb-12">
      
      {/* 文化沉浸式 Header 区 */}
      <header className="bg-emerald-800 text-stone-50 pt-16 pb-20 px-4 md:px-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-block bg-amber-500 text-emerald-900 font-bold px-3 py-1 rounded-full text-sm mb-4 shadow-sm">
            国家级非物质文化遗产
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            瑶乡打油茶 <span className="font-light text-emerald-200">|</span> 体验馆
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl leading-relaxed">
            “一杯苦，二杯涩，三杯四杯好畅快。”<br/>
            一锅打尽百草香。搭配各式酥脆小吃，品味这碗流传百年的“中国式咖啡”。
          </p>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-20 flex flex-col md:flex-row gap-8">
        
        {/* 左侧：菜单列表 */}
        <section className="flex-[2]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MENU_DATA.map((item) => {
              // 核心 UI 状态：判断按钮是否应该被禁用
              const isDisabled = item.type === 'side' && !hasBaseInCart;

              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-200 flex flex-col group">
                  <div className="relative h-48 overflow-hidden bg-stone-200">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className={`w-full h-full object-cover transition-all duration-500 ${isDisabled ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <h3 className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col justify-between bg-white">
                    <p className="text-sm text-stone-500 mb-6 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className={`flex items-baseline gap-1 ${isDisabled ? 'text-stone-400' : 'text-emerald-700'}`}>
                        <span className="text-sm font-bold">¥</span>
                        <span className="text-2xl font-black">{item.price.toFixed(2)}</span>
                      </div>
                      
                      {/* 动态渲染按钮样式和文案 */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isDisabled}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                          isDisabled 
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-200'
                        }`}
                      >
                        <span>{isDisabled ? '请先选茶' : '添碗'}</span>
                        {!isDisabled && <span className="text-lg leading-none">+</span>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 右侧：购物车 */}
        <aside className="flex-[1] md:sticky md:top-8 h-fit">
          <div className="bg-[#fcfaf8] rounded-2xl shadow-lg border border-stone-200 overflow-hidden flex flex-col relative">
            <div className="bg-amber-100/50 p-5 border-b border-amber-200/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <span className="text-2xl">🍵</span> 当前茶档
              </h2>
              <span className="text-xs font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-full shadow-inner">
                共 {totalQuantity} 份
              </span>
            </div>

            <div className="p-5 min-h-[300px] max-h-[50vh] overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 py-12 space-y-3">
                  <div className="w-16 h-16 border-4 border-dashed border-stone-300 rounded-full flex items-center justify-center text-2xl">🥣</div>
                  <p className="text-sm font-medium">请先选择一碗油茶打底</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                    <div className="flex-1 pr-3">
                      <div className="font-bold text-stone-800 text-sm line-clamp-1">
                        {item.name}
                        {item.type === 'base' && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-2">主</span>}
                      </div>
                      <div className="text-sm text-emerald-600 font-bold mt-1">¥{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
                      <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors">-</button>
                      <span className="w-6 text-center text-sm font-bold text-stone-700">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-stone-200 bg-white">
              <div className="flex justify-between items-end mb-5">
                <span className="text-stone-500 font-medium">合计香资：</span>
                <div className="text-right">
                  <span className="text-sm text-emerald-700 font-bold mr-1">¥</span>
                  <span className="text-3xl font-black text-emerald-700">{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleGoToCheckout}
                disabled={!hasBaseInCart} // 改动：如果没有茶底，也不能去结账
                className="w-full bg-emerald-600 disabled:bg-stone-300 disabled:text-stone-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200 flex justify-center items-center gap-2"
              >
                前往茶台结账
              </button>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}