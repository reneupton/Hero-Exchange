'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaThLarge, FaList, FaTimes, FaGavel, FaBox, FaArrowLeft } from 'react-icons/fa';
import NavigationHeader from '../components/NavigationHeader';
import CountdownTimer from '../components/CountdownTimer';
import { gamificationService } from '../services/gamificationService';
import { auctionService, AuctionItem } from '../services/auctionService';
import { useBidStore } from '@/hooks/useBidStore';
import toast from 'react-hot-toast';

type MarketplaceItem = AuctionItem & {
  emoji?: string;
  category?: string;
  rarity?: string;
  condition?: string;
  sellerUsername?: string;
  sellerLevel?: number;
  views?: number;
  isFeatured?: boolean;
  timeRemaining?: string;
  totalBids?: number;
  buyNowPrice?: number;
  startingBidPrice?: number;
  currentBidPrice?: number;
  expiresAt?: string;
  sellerId?: string;
  name?: string;
  description?: string;
};

type InventoryItem = {
  id: string;
  itemName: string;
  emoji: string;
  description: string;
  category: string;
  rarity: string;
  purchasePrice: number;
  acquiredAt: string;
  isListed: boolean;
  listingId?: string;
};

export default function MarketplacePage() {
  const router = useRouter();
  const userId = 'demo-user-123';
  const bids = useBidStore((state) => state.bids);

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [showListItemModal, setShowListItemModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const auctions = await auctionService.getAuctions();

      // Transform auction data to marketplace format
      const transformedItems: MarketplaceItem[] = auctions.map(auction => ({
        ...auction,
        // Map auction fields to marketplace fields
        name: `${auction.item.make} ${auction.item.model}`,
        description: `${auction.item.year} ${auction.item.color} - ${auction.item.mileage.toLocaleString()} miles`,
        buyNowPrice: auction.reservePrice * 1.5, // Set buy now as 1.5x reserve
        startingBidPrice: auction.reservePrice,
        currentBidPrice: auction.currentHighBid || auction.reservePrice,
        currentBidderId: auction.winner || undefined,
        emoji: '🚗',
        category: 'vehicles',
        rarity: 'common',
        condition: 'Used',
        sellerId: auction.seller,
        sellerUsername: auction.seller,
        sellerLevel: 10,
        views: 0,
        expiresAt: auction.auctionEnd,
        isFeatured: false,
        timeRemaining: '',
        totalBids: 0
      }));

      // Apply filters
      let filtered = transformedItems;

      // Category filter (not applicable for cars, but keeping structure)
      if (selectedCategory !== 'all') {
        // All auctions are vehicles in this case
      }

      // Rarity filter (not applicable for auctions)
      if (selectedRarity !== 'all') {
        // Skip for auctions
      }

      // Price filter
      filtered = filtered.filter(item => {
        const price = item.buyNowPrice ?? 0;
        return price >= priceMin && price <= priceMax;
      });

      // Sorting
      if (sortBy === 'price-low') {
        filtered.sort((a, b) => (a.buyNowPrice ?? 0) - (b.buyNowPrice ?? 0));
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => (b.buyNowPrice ?? 0) - (a.buyNowPrice ?? 0));
      } else if (sortBy === 'ending') {
        filtered.sort(
          (a, b) =>
            new Date(a.expiresAt ?? 0).getTime() - new Date(b.expiresAt ?? 0).getTime()
        );
      } else {
        // Recent
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setItems(filtered);
    } catch (error: any) {
      toast.error('Failed to load auctions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [priceMax, priceMin, selectedCategory, selectedRarity, sortBy]);

  const loadInventory = useCallback(async () => {
    try {
      const data = await gamificationService.getUserInventory(userId);
      setInventory(data);
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadItems();
    loadInventory();
  }, [loadItems, loadInventory]);

  // Listen for bid placed events from SignalR to refresh auction data
  useEffect(() => {
    // When bids change (via SignalR in SignalRProvider), refresh the auction list
    if (bids.length > 0) {
      loadItems();
    }
  }, [bids.length, loadItems]); // Re-run when new bids are added via SignalR

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🎯' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'fashion', name: 'Fashion', icon: '👕' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'collectibles', name: 'Collectibles', icon: '💎' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
  ];

  const rarities = [
    { id: 'all', name: 'All', color: 'gray' },
    { id: 'common', name: 'Common', color: '#E5E7EB' },
    { id: 'uncommon', name: 'Uncommon', color: '#10B981' },
    { id: 'rare', name: 'Rare', color: '#3B82F6' },
    { id: 'epic', name: 'Epic', color: '#8B5CF6' },
    { id: 'legendary', name: 'Legendary', color: '#F59E0B' }
  ];

  const filteredItems = items.filter(item =>
    (item.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sellerUsername && item.sellerUsername.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const featuredItems = filteredItems.filter(item => item.isFeatured);
  const regularItems = filteredItems.filter(item => !item.isFeatured);

  const handleItemClick = async (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handlePurchase = async (item: MarketplaceItem) => {
    if (item.sellerId === userId) {
      toast.error('You cannot purchase your own item!');
      return;
    }

    setSelectedItem(item);
    setShowDetailModal(false);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      await gamificationService.purchaseMarketplaceItem(userId, selectedItem.id);

      toast.success(`Successfully purchased ${selectedItem.name}! 🎉`, {
        duration: 4000,
        icon: '✅'
      });

      window.dispatchEvent(new Event('walletUpdate'));
      setShowPurchaseModal(false);
      setSelectedItem(null);

      await loadItems();
      await loadInventory();
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed', { icon: '❌' });
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedItem || !bidAmount) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (selectedItem.currentBidPrice && amount <= selectedItem.currentBidPrice) {
      toast.error(`Bid must be higher than current bid of ${selectedItem.currentBidPrice} FLOG`);
      return;
    }

    try {
      // Import the server action dynamically
      const { placeBidForAuction } = await import('../actions/auctionActions');
      const result = await placeBidForAuction(selectedItem.id, amount);

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success('Bid placed successfully! 🎯', { duration: 3000 });

      window.dispatchEvent(new Event('walletUpdate'));
      setShowBidModal(false);
      setBidAmount('');
      await loadItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    }
  };

  const handleListInventoryItem = async (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setShowListItemModal(true);
  };

  const handleSellItem = async (buyNowPrice: number, startingBidPrice?: number) => {
    if (!selectedInventoryItem) return;

    try {
      await gamificationService.listInventoryItem(
        userId,
        selectedInventoryItem.id,
        buyNowPrice,
        startingBidPrice,
        7
      );

      toast.success('Item listed successfully! 🎉');
      setShowListItemModal(false);
      setSelectedInventoryItem(null);

      await loadItems();
      await loadInventory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to list item');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingTop: '64px' }}>
      <NavigationHeader
        currentPage="marketplace"
        onNavigateHome={() => router.push('/')}
        onNavigateMarketplace={() => {}}
        userId={userId}
        cartItemCount={inventory.length}
        onCartClick={() => setShowInventory(true)}
      />

      {/* Filter Bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        position: 'sticky',
        top: '64px',
        zIndex: 90
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4b5563',
                  cursor: 'pointer'
                }}
              >
                <option value="recent">Recently Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="ending">Ending Soon</option>
              </select>

              <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '12px' }}>
                Showing {filteredItems.length} items
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: viewMode === 'grid' ? '#8b5cf6' : 'white',
                  border: '2px solid #e5e7eb',
                  color: viewMode === 'grid' ? 'white' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FaThLarge />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: viewMode === 'list' ? '#8b5cf6' : 'white',
                  border: '2px solid #e5e7eb',
                  color: viewMode === 'list' ? 'white' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FaList />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', display: 'flex', gap: '24px' }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0 }}>
          {/* Search */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 36px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Categories */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: '16px' }}>
              CATEGORIES
            </h3>
            {categories.map(category => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  background: selectedCategory === category.id ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'transparent',
                  color: selectedCategory === category.id ? 'white' : '#1f2937',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 500 }}>
                  <span>{category.icon}</span>
                  {category.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Price Range */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: '16px' }}>
              PRICE RANGE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                {priceMin} - {priceMax} FLOG
              </div>
            </div>
          </div>

          {/* Rarity Filter */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: '16px' }}>
              ITEM RARITY
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rarities.map(rarity => (
                <motion.button
                  key={rarity.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRarity(rarity.id)}
                  className={`rarity-badge rarity-${rarity.id}`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    textTransform: 'uppercase',
                    opacity: selectedRarity === rarity.id ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  {rarity.name}
                </motion.button>
              ))}
            </div>
          </div>
        </aside>

        {/* Items Container */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ color: '#6b7280' }}>Loading marketplace...</p>
            </div>
          ) : (
            <>
              {/* Featured Items */}
              {featuredItems.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Featured Items
                      <span style={{
                        padding: '4px 10px',
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        HOT
                      </span>
                    </h2>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {featuredItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        userId={userId}
                        onClick={handleItemClick}
                        onPurchase={handlePurchase}
                        onBid={() => {
                          setSelectedItem(item);
                          setShowBidModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Items */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {regularItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    userId={userId}
                    onClick={handleItemClick}
                    onPurchase={handlePurchase}
                    onBid={() => {
                      setSelectedItem(item);
                      setShowBidModal(true);
                    }}
                  />
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                    No items found
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inventory Sidebar */}
      <AnimatePresence>
        {showInventory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInventory(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 999
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '450px',
                background: 'white',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBox /> My Inventory ({inventory.length})
                </h2>
                <button onClick={() => setShowInventory(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>
                  <FaTimes />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {inventory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <FaBox style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
                    <p style={{ color: '#6b7280' }}>Your inventory is empty</p>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>
                      Purchase items from the marketplace to add them here
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {inventory.map(item => (
                      <div key={item.id} style={{
                        background: '#f9fafb',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        position: 'relative'
                      }}>
                        <div style={{ fontSize: '40px' }}>{item.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>{item.itemName}</h4>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{item.description}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className={`rarity-badge rarity-${item.rarity}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                              {item.rarity}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              Paid: {item.purchasePrice} FLOG
                            </span>
                          </div>
                          {item.isListed ? (
                            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                              📝 Currently Listed
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleListInventoryItem(item)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Sell This Item
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            userId={userId}
            onClose={() => setShowDetailModal(false)}
            onPurchase={handlePurchase}
            onBid={() => {
              setShowDetailModal(false);
              setShowBidModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedItem && (
          <PurchaseModal
            item={selectedItem}
            onClose={() => setShowPurchaseModal(false)}
            onConfirm={confirmPurchase}
          />
        )}
      </AnimatePresence>

      {/* Bid Modal */}
      <AnimatePresence>
        {showBidModal && selectedItem && (
          <BidModal
            item={selectedItem}
            bidAmount={bidAmount}
            onBidAmountChange={setBidAmount}
            onClose={() => {
              setShowBidModal(false);
              setBidAmount('');
            }}
            onPlaceBid={handlePlaceBid}
          />
        )}
      </AnimatePresence>

      {/* List Item Modal */}
      <AnimatePresence>
        {showListItemModal && selectedInventoryItem && (
          <ListItemModal
            item={selectedInventoryItem}
            onClose={() => {
              setShowListItemModal(false);
              setSelectedInventoryItem(null);
            }}
            onList={handleSellItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ItemCard Component
function ItemCard({ item, userId, onClick, onPurchase, onBid }: {
  item: MarketplaceItem;
  userId: string;
  onClick: (item: MarketplaceItem) => void;
  onPurchase: (item: MarketplaceItem) => void;
  onBid: () => void;
}) {
  const getRarityStyle = (rarity: string) => {
    const styles: Record<string, any> = {
      common: { background: '#E5E7EB', color: '#4b5563' },
      uncommon: { background: '#10B981', color: 'white' },
      rare: { background: 'linear-gradient(135deg, #3B82F6, #06b6d4)', color: 'white' },
      epic: { background: 'linear-gradient(135deg, #8B5CF6, #ec4899)', color: 'white' },
      legendary: { background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white', boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }
    };
    return styles[rarity] || styles.common;
  };

  const isOwnItem = item.sellerId === userId;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
      onClick={() => onClick(item)}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.3s',
        cursor: 'pointer',
        position: 'relative',
        opacity: isOwnItem ? 0.7 : 1
      }}
    >
      {/* Image Area */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '80px',
        position: 'relative'
      }}>
        {item.emoji || '🚗'}

        {/* Rarity Badge */}
        {item.rarity && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            ...getRarityStyle(item.rarity)
          }}>
            {item.rarity}
          </div>
        )}

        {isOwnItem && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '6px 12px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            YOUR ITEM
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>
            {item.name}
          </h3>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            background: '#10b981',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 600
          }}>
            {item.condition || 'Active'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.sellerUsername || item.seller}</span>
          {item.sellerLevel && <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>⭐ {item.sellerLevel}</span>}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <CountdownTimer expiresAt={item.expiresAt ?? ""} />
        </div>

        {item.startingBidPrice && (
          <div style={{ marginBottom: '8px', padding: '8px', background: '#fef3c7', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 600, marginBottom: '4px' }}>
              <FaGavel style={{ marginRight: '4px' }} />
              Current Bid: {item.currentBidPrice || 0} FLOG
            </div>
            {item.totalBids !== undefined && (
              <div style={{ fontSize: '11px', color: '#92400e' }}>
                {item.totalBids} bid{item.totalBids !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {item.buyNowPrice}
            </span>
            <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 600 }}>
              FLOG
            </span>
          </div>

          {!isOwnItem && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {item.startingBidPrice && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBid();
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Bid
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchase(item);
                }}
                style={{
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Buy
              </motion.button>
            </div>
          )}
        </div>

        {item.views !== undefined && (
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #f3f4f6'
          }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
              👁️ {item.views}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Detail Modal Component
function ItemDetailModal({ item, userId, onClose, onPurchase, onBid }: {
  item: MarketplaceItem;
  userId: string;
  onClose: () => void;
  onPurchase: (item: MarketplaceItem) => void;
  onBid: () => void;
}) {
  const isOwnItem = item.sellerId === userId;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#6b7280'
          }}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '100px', marginBottom: '16px' }}>{item.emoji || '🚗'}</div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
            {item.name}
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>
            {item.description}
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            {item.rarity && (
              <span className={`rarity-badge rarity-${item.rarity}`}>
                {item.rarity}
              </span>
            )}
            <span style={{
              padding: '4px 12px',
              background: '#10b981',
              color: 'white',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {item.condition || 'Active'}
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <CountdownTimer expiresAt={item.expiresAt ?? ""} />
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>
            Seller Information
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 700
            }}>
              {(item.sellerUsername || item.seller)?.[0]}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                {item.sellerUsername || item.seller}
              </div>
              {item.sellerLevel && (
                <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600 }}>
                  ⭐ Level {item.sellerLevel}
                </div>
              )}
            </div>
          </div>
        </div>

        {item.startingBidPrice && (
          <div style={{
            background: '#fef3c7',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginBottom: '12px', textTransform: 'uppercase' }}>
              <FaGavel style={{ marginRight: '8px' }} />
              Bidding Information
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#92400e' }}>Starting Bid:</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#92400e' }}>
                {item.startingBidPrice} FLOG
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#92400e' }}>Current Bid:</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#92400e' }}>
                {item.currentBidPrice} FLOG
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#92400e', marginTop: '8px' }}>
              Total Bids: {item.totalBids}
            </div>
          </div>
        )}

        <div style={{
          background: '#f9fafb',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: '#6b7280' }}>Buy Now Price</span>
            <span style={{ fontSize: '36px', fontWeight: 700, color: '#f97316' }}>
              {item.buyNowPrice} FLOG
            </span>
          </div>
        </div>

        {isOwnItem ? (
          <div style={{
            padding: '16px',
            background: '#fee2e2',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#991b1b',
            fontWeight: 600
          }}>
            This is your listing
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            {item.startingBidPrice && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBid}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FaGavel /> Place Bid
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPurchase(item)}
              style={{
                flex: 1,
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Buy Now
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// Purchase Modal Component
function PurchaseModal({ item, onClose, onConfirm }: {
  item: MarketplaceItem;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '450px',
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
          Confirm Purchase
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Are you sure you want to purchase <strong>{item.name}</strong>?
        </p>

        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Total Amount
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#f97316' }}>
            {item.buyNowPrice} FLOG
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Confirm Purchase
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// Bid Modal Component
function BidModal({ item, bidAmount, onBidAmountChange, onClose, onPlaceBid }: {
  item: MarketplaceItem;
  bidAmount: string;
  onBidAmountChange: (value: string) => void;
  onClose: () => void;
  onPlaceBid: () => void;
}) {
  const minBid = (item.currentBidPrice || item.startingBidPrice || 0) + 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '450px',
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            <FaGavel />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
            Place Your Bid
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            {item.name}
          </p>
        </div>

        <div style={{
          background: '#fef3c7',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>
            Current Bid
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#92400e' }}>
            {item.currentBidPrice} FLOG
          </div>
          <div style={{ fontSize: '12px', color: '#92400e', marginTop: '8px' }}>
            Minimum bid: {minBid} FLOG
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
            Your Bid Amount (FLOG)
          </label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => onBidAmountChange(e.target.value)}
            placeholder={`Min: ${minBid}`}
            min={minBid}
            style={{
              width: '100%',
              padding: '14px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 600
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlaceBid}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Place Bid
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// List Item Modal Component
function ListItemModal({ item, onClose, onList }: {
  item: InventoryItem;
  onClose: () => void;
  onList: (buyNowPrice: number, startingBidPrice?: number) => void;
}) {
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [startingBidPrice, setStartingBidPrice] = useState('');
  const [enableBidding, setEnableBidding] = useState(false);

  const handleSubmit = () => {
    const buyPrice = parseFloat(buyNowPrice);
    if (isNaN(buyPrice) || buyPrice <= 0) {
      toast.error('Please enter a valid buy now price');
      return;
    }

    if (enableBidding) {
      const bidPrice = parseFloat(startingBidPrice);
      if (isNaN(bidPrice) || bidPrice <= 0 || bidPrice >= buyPrice) {
        toast.error('Starting bid must be less than buy now price');
        return;
      }
      onList(buyPrice, bidPrice);
    } else {
      onList(buyPrice);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#6b7280'
          }}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '80px', marginBottom: '16px' }}>{item.emoji}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
            List Item for Sale
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            {item.itemName}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
            Buy Now Price (FLOG)
          </label>
          <input
            type="number"
            value={buyNowPrice}
            onChange={(e) => setBuyNowPrice(e.target.value)}
            placeholder="Enter price"
            min="1"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            You paid: {item.purchasePrice} FLOG
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enableBidding}
              onChange={(e) => setEnableBidding(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>
              Enable Bidding
            </span>
          </label>
        </div>

        {enableBidding && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
              Starting Bid Price (FLOG)
            </label>
            <input
              type="number"
              value={startingBidPrice}
              onChange={(e) => setStartingBidPrice(e.target.value)}
              placeholder="Enter starting bid"
              min="1"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Must be less than buy now price
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            List Item
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
