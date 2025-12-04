'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { FaFire, FaTrophy, FaChartLine, FaBolt, FaGem } from 'react-icons/fa';
import NavigationHeader from '../components/NavigationHeader';

// AnimatedCounter component for smooth number counting
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const inView = useInView(countRef, { once: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, inView]);

  return <div ref={countRef}>{count.toLocaleString()}</div>;
}

type Props = {
  onNavigateToMarketplace?: () => void;
};

export default function LandingPage({ onNavigateToMarketplace }: Props) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <>
      {/* NAVIGATION BAR - Using Shared Component */}
      <NavigationHeader
        currentPage="landing"
        onNavigateHome={() => {}}
        onNavigateMarketplace={onNavigateToMarketplace || (() => {})}
        userId="demo-user-123"
        cartItemCount={0}
      />

      {/* MAIN CONTENT - Starts below nav */}
      <main style={{ paddingTop: '64px' }}>
        {/* HERO SECTION */}
        <section style={{
          padding: '60px 20px',
          background: '#F2F2F7',
          minHeight: '80vh'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Event Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                style={{
                  background: '#34C759',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                🎯 Season 2
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(255, 215, 0, 0)',
                    '0 0 20px rgba(255, 215, 0, 0.5)',
                    '0 0 0px rgba(255, 215, 0, 0)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                ⚡ 2X XP Weekend
              </motion.span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                fontSize: '56px',
                fontWeight: 800,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #AF52DE, #007AFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                lineHeight: 1.1
              }}
            >
              Trade. Level Up. Win.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                fontSize: '21px',
                color: '#3C3C43',
                textAlign: 'center',
                maxWidth: '650px',
                margin: '0 auto 40px'
              }}
            >
              The marketplace where every transaction is rewarding.
              Join 50,000+ traders earning FLOG coins daily.
            </motion.p>

            {/* XP Progress Bar Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              style={{
                maxWidth: '600px',
                margin: '0 auto 40px',
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #AF52DE, #5856D6)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    Level 15
                  </span>
                  <span style={{ fontWeight: 600 }}>Power Trader</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3C3C43' }}>2,450 / 3,000 XP</span>
              </div>
              <div style={{
                height: '12px',
                background: '#F2F2F7',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #AF52DE, #5856D6)',
                    position: 'relative'
                  }}
                />
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '60px'
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0, 122, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToMarketplace}
                style={{
                  background: '#007AFF',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontSize: '17px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Start Trading <span>→</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(175, 82, 222, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToMarketplace}
                style={{
                  background: 'linear-gradient(135deg, #AF52DE, #5856D6)',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontSize: '17px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🎁 Claim Daily Reward
              </motion.button>
            </motion.div>

            {/* Stats Grid - 4 cards in a row */}
            <motion.div
              ref={ref}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate={controls}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '60px'
              }}
            >
              {/* Legendary Rank Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFD700, #FFA500)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#34C759',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  +25%
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '12px'
                }}>
                  🏆
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                  <AnimatedCounter end={1337} />
                </div>
                <div style={{ fontSize: '14px', color: '#3C3C43' }}>Global Rank</div>
              </motion.div>

              {/* Items Traded Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #AF52DE, #5856D6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '12px'
                }}>
                  📈
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                  <AnimatedCounter end={847} />
                </div>
                <div style={{ fontSize: '14px', color: '#3C3C43' }}>Items Traded</div>
              </motion.div>

              {/* Day Streak Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '12px'
                }}>
                  ⚡
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                  <AnimatedCounter end={15} />
                </div>
                <div style={{ fontSize: '14px', color: '#3C3C43' }}>Day Streak</div>
              </motion.div>

              {/* Achievements Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '12px'
                }}>
                  💎
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                  <AnimatedCounter end={23} />
                </div>
                <div style={{ fontSize: '14px', color: '#3C3C43' }}>Achievements</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Activity Ticker - SCROLLING TEXT */}
        <div style={{
          background: 'linear-gradient(90deg, white, transparent, white)',
          padding: '16px 0',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div className="ticker-scroll" style={{
            display: 'flex',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ padding: '0 40px' }}>🔥 <strong>AlexPro</strong> just found a Legendary iPhone 15</span>
            <span style={{ padding: '0 40px' }}>⚡ <strong>SpeedTrader</strong> completed all daily quests</span>
            <span style={{ padding: '0 40px' }}>💎 <strong>DiamondHands</strong> reached Level 30!</span>
            <span style={{ padding: '0 40px' }}>🎁 <strong>LuckyOne</strong> won 5,000 FLOG from Mystery Box</span>
            <span style={{ padding: '0 40px' }}>🔥 <strong>AlexPro</strong> just found a Legendary iPhone 15</span>
            <span style={{ padding: '0 40px' }}>⚡ <strong>SpeedTrader</strong> completed all daily quests</span>
            <span style={{ padding: '0 40px' }}>💎 <strong>DiamondHands</strong> reached Level 30!</span>
            <span style={{ padding: '0 40px' }}>🎁 <strong>LuckyOne</strong> won 5,000 FLOG from Mystery Box</span>
          </div>
        </div>

        {/* Features Section */}
        <section style={{
          padding: '60px 20px',
          background: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: '34px',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '12px'
              }}
            >
              Power-Up Your Trading
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: '17px',
                color: '#3C3C43',
                textAlign: 'center',
                marginBottom: '48px'
              }}
            >
              Unlock features as you level up and dominate the marketplace
            </motion.p>

            {/* Feature Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {/* Feature Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(175, 82, 222, 0.2)' }}
                style={{
                  background: '#F2F2F7',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '2px solid #AF52DE',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(175, 82, 222, 0.9)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  EPIC
                </div>
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  🎯
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                    Daily Quest System
                  </h3>
                  <p style={{ fontSize: '15px', color: '#3C3C43', marginBottom: '16px' }}>
                    Complete challenges to earn massive rewards. New quests every 24 hours!
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{
                      background: 'rgba(175, 82, 222, 0.1)',
                      color: '#AF52DE',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      +500 XP
                    </span>
                    <span style={{
                      background: 'rgba(255, 149, 0, 0.1)',
                      color: '#FF9500',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      +200 FLOG
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0, 122, 255, 0.2)' }}
                style={{
                  background: '#F2F2F7',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 122, 255, 0.9)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  RARE
                </div>
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  💎
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                    Legendary Items
                  </h3>
                  <p style={{ fontSize: '15px', color: '#3C3C43', marginBottom: '16px' }}>
                    Hunt for ultra-rare items with special effects and massive value multipliers.
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{
                      background: 'rgba(175, 82, 222, 0.1)',
                      color: '#AF52DE',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      +1000 XP
                    </span>
                    <span style={{
                      background: 'rgba(255, 149, 0, 0.1)',
                      color: '#FF9500',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      5x Value
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(79, 172, 254, 0.2)' }}
                style={{
                  background: '#F2F2F7',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  🎁
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                    Mystery Boxes
                  </h3>
                  <p style={{ fontSize: '15px', color: '#3C3C43', marginBottom: '16px' }}>
                    Open loot boxes for random rewards ranging from coins to legendary items!
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{
                      background: 'rgba(255, 149, 0, 0.1)',
                      color: '#FF9500',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      50-5000 FLOG
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{
        padding: '48px 20px',
        textAlign: 'center',
        borderTop: '0.5px solid rgba(60, 60, 67, 0.16)'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #AF52DE, #5856D6)',
            color: 'white',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          🎮 Demo Mode - Play with Fake FLOG Coins
        </motion.div>
      </footer>

      {/* Add CSS for scrolling animation */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </>
  );
}
