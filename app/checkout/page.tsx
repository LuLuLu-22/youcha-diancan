"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// 需要共用的类型定义
type MenuItem = { id: number; name: string; price: number; icon: string; };
type CartItem = MenuItem & { quantity: number; };

const API = {
  submitOrder: async (cartItems: CartItem[], totalAmount: number, payMethod: string) => {
    console.log(`[发送请求 -> 后端] 确认支付, 方式: ${payMethod}, 总金额: ¥${totalAmount}`, cartItems);
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟网络延迟
    return { success: true }; 
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  
  // 状态
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  // 页面加载时，从 localStorage 读取订单数据
  useEffect(() => {
    const savedCart = localStorage.getItem('order_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // 如果没有数据（比如用户直接输入网址进来），踢回首页
      router.replace('/'); 
    }
  }, [router]);

  // 计算总金额
  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  // 最终支付动作
  const handleConfirmPayment = async () => {
    try {
      const response = await API.submitOrder(cart, totalAmount, paymentMethod);
      if (response.success) {
        alert(`支付成功！您已使用${paymentMethod === 'wechat' ? '微信' : '支付宝'}支付 ¥${totalAmount.toFixed(2)}`);
        // 支付成功，清空本地购物车缓存
        localStorage.removeItem('order_cart');
        // 跳转回主页
        router.push('/'); 
      }
    } catch (error) {
      alert("支付请求失败，请重试！");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md flex flex-col items-center relative">
        
        {/* 返回按钮：回到点餐页 */}
        <button 
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-800 font-medium"
        >
          ← 返回修改
        </button>

        <h2 className="text-2xl font-bold mt-4 mb-2">订单支付</h2>
        <p className="text-slate-500 mb-6">请选择支付方式并扫码付款</p>

        {/* 支付金额 */}
        <div className="text-4xl font-black text-slate-800 mb-8 flex items-baseline gap-1">
          <span className="text-2xl font-bold">¥</span>
          {totalAmount.toFixed(2)}
        </div>

        {/* 支付方式选择 */}
        <div className="flex w-full gap-4 mb-8">
          <button
            onClick={() => setPaymentMethod('wechat')}
            className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
              paymentMethod === 'wechat' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            微信支付
          </button>
          <button
            onClick={() => setPaymentMethod('alipay')}
            className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
              paymentMethod === 'alipay' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            支付宝
          </button>
        </div>

        {/* 二维码占位区域 */}
        <div className={`w-64 h-64 rounded-2xl flex flex-col items-center justify-center border-4 border-dashed mb-8 transition-colors ${
          paymentMethod === 'wechat' ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'
        }`}>
          <div className="text-6xl mb-4">
            {paymentMethod === 'wechat' ? '💬' : '🦅'}
          </div>
          <p className="text-slate-400 font-medium text-center px-4">
            二维码占位区<br/>
            <span className="text-sm">实际开发中这里会放置后端返回的 base64 图片或 URL</span>
          </p>
        </div>

        {/* 确认支付按钮 */}
        <button
          onClick={handleConfirmPayment}
          className={`w-full text-white py-4 rounded-xl font-bold text-lg transition-all ${
            paymentMethod === 'wechat' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          模拟已完成支付
        </button>
      </div>
    </div>
  );
}