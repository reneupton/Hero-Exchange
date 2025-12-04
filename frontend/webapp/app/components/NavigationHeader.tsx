'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { gamificationService } from '../services/gamificationService';

type NavigationHeaderProps = {
  currentPage: 'landing' | 'marketplace';
  onNavigateHome: () => void;
  onNavigateMarketplace: () => void;
  userId: string;
  cartItemCount?: number;
  onCartClick?: () => void;
};

export default function NavigationHeader({
  currentPage,
  onNavigateHome,
  onNavigateMarketplace,
  userId,
  cartItemCount = 0,
  onCartClick
}: NavigationHeaderProps) {
  const [balance, setBalance] = useState(2450);
  const [level, setLevel] = useState(15);
  const loadUserData = useCallback(async () => {
    try {
      const [walletData, gamificationData] = await Promise.all([
        gamificationService.getWallet(userId),
        gamificationService.getUserGamification(userId)
      ]);

      setBalance(walletData.flogBalance || 2450);
      setLevel(gamificationData.level || 15);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load user data:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();

    // Listen for wallet updates
    const handleWalletUpdate = () => loadUserData();
    window.addEventListener('walletUpdate', handleWalletUpdate);

    return () => window.removeEventListener('walletUpdate', handleWalletUpdate);
  }, [loadUserData]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(60, 60, 67, 0.16)',
        zIndex: 1000
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%'
      }}>
        {/* LEFT: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            🎮
          </motion.div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>FlogIt Arena</span>
        </div>

        {/* CENTER: Navigation Links */}
        <div style={{ display: 'flex', gap: '28px' }}>
          <motion.a
            whileHover={{ scale: 1.05 }}
            onClick={onNavigateHome}
            style={{
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              color: currentPage === 'landing' ? '#8b5cf6' : '#4b5563',
              borderBottom: currentPage === 'landing' ? '2px solid #8b5cf6' : 'none',
              paddingBottom: '4px'
            }}
          >
            Home
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            onClick={onNavigateMarketplace}
            style={{
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              color: currentPage === 'marketplace' ? '#8b5cf6' : '#4b5563',
              borderBottom: currentPage === 'marketplace' ? '2px solid #8b5cf6' : 'none',
              paddingBottom: '4px'
            }}
          >
            Marketplace
          </motion.a>
        </div>

        {/* RIGHT: User Status */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Level Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            ⭐ Level {level}
          </motion.div>

          {/* Balance Display */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '24px',
              padding: '8px 14px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            💰 <span style={{ color: '#f97316', fontWeight: 700, fontSize: '18px' }}>{balance.toLocaleString()}</span>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>FLOG</span>
          </motion.div>

          {/* Shopping Cart (only on marketplace) */}
          {currentPage === 'marketplace' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <FaShoppingCart size={18} color="#4b5563" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '20px',
                    height: '20px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
