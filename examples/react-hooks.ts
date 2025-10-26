/**
 * React Hooks for NFT Rental & Marketplace
 * 
 * Custom React hooks for integrating the marketplace with React applications.
 * These hooks provide state management and easy-to-use functions for marketplace operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { 
  createListing, 
  rentNFT, 
  buyNFT, 
  lockNFTInKiosk, 
  unlockNFTFromKiosk,
  getMarketplaceStats,
  getListing,
  getRental,
  listenToMarketplaceEvents,
  calculateRentalCost,
  isRentalExpired,
  processRentalExpiry,
  NFTListing,
  RentalAgreement
} from './typescript-integration';

// ===== TYPES =====

export interface MarketplaceState {
  listings: NFTListing[];
  rentals: RentalAgreement[];
  stats: {
    totalListings: number;
    totalRentals: number;
    platformFeePercentage: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export interface UseMarketplaceReturn {
  state: MarketplaceState;
  actions: {
    createListing: (params: CreateListingParams) => Promise<void>;
    rentNFT: (listingId: string, paymentAmount: number) => Promise<void>;
    buyNFT: (listingId: string, kioskId: string, kioskOwnerCapId: string, paymentAmount: number) => Promise<void>;
    lockNFT: (params: LockNFTParams) => Promise<void>;
    unlockNFT: (params: UnlockNFTParams) => Promise<void>;
    processExpiredRentals: (rentalIds: string[]) => Promise<void>;
    refreshData: () => Promise<void>;
  };
}

export interface CreateListingParams {
  kioskId: string;
  kioskOwnerCapId: string;
  nftId: string;
  salePrice: number;
  rentalPrice: number;
  duration: number;
  listingType: 'Rental' | 'Sale' | 'Both';
}

export interface LockNFTParams {
  kioskId: string;
  kioskOwnerCapId: string;
  nftId: string;
  nftType: string;
  transferPolicyId?: string;
}

export interface UnlockNFTParams {
  kioskId: string;
  kioskOwnerCapId: string;
  nftId: string;
  nftType: string;
}

// ===== MAIN MARKETPLACE HOOK =====

export function useMarketplace(signer: Ed25519Keypair): UseMarketplaceReturn {
  const [state, setState] = useState<MarketplaceState>({
    listings: [],
    rentals: [],
    stats: null,
    loading: false,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Set up event listening
  useEffect(() => {
    const unsubscribe = listenToMarketplaceEvents();
    return () => unsubscribe();
  }, []);

  const loadMarketplaceData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const stats = await getMarketplaceStats();
      setState(prev => ({ 
        ...prev, 
        stats, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      }));
    }
  }, []);

  const handleCreateListing = useCallback(async (params: CreateListingParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await createListing(
        signer,
        params.kioskId,
        params.kioskOwnerCapId,
        params.nftId,
        params.salePrice,
        params.rentalPrice,
        params.duration,
        params.listingType
      );
      
      // Refresh data after successful listing
      await loadMarketplaceData();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create listing',
        loading: false 
      }));
    }
  }, [signer, loadMarketplaceData]);

  const handleRentNFT = useCallback(async (listingId: string, paymentAmount: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await rentNFT(signer, listingId, paymentAmount);
      await loadMarketplaceData();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to rent NFT',
        loading: false 
      }));
    }
  }, [signer, loadMarketplaceData]);

  const handleBuyNFT = useCallback(async (
    listingId: string, 
    kioskId: string, 
    kioskOwnerCapId: string, 
    paymentAmount: number
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await buyNFT(signer, listingId, kioskId, kioskOwnerCapId, paymentAmount);
      await loadMarketplaceData();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to buy NFT',
        loading: false 
      }));
    }
  }, [signer, loadMarketplaceData]);

  const handleLockNFT = useCallback(async (params: LockNFTParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await lockNFTInKiosk(
        signer,
        params.kioskId,
        params.kioskOwnerCapId,
        params.nftId,
        params.nftType,
        params.transferPolicyId
      );
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to lock NFT',
        loading: false 
      }));
    }
  }, [signer]);

  const handleUnlockNFT = useCallback(async (params: UnlockNFTParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await unlockNFTFromKiosk(
        signer,
        params.kioskId,
        params.kioskOwnerCapId,
        params.nftId,
        params.nftType
      );
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to unlock NFT',
        loading: false 
      }));
    }
  }, [signer]);

  const handleProcessExpiredRentals = useCallback(async (rentalIds: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await Promise.all(
        rentalIds.map(rentalId => processRentalExpiry(signer, rentalId))
      );
      await loadMarketplaceData();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to process expired rentals',
        loading: false 
      }));
    }
  }, [signer, loadMarketplaceData]);

  return {
    state,
    actions: {
      createListing: handleCreateListing,
      rentNFT: handleRentNFT,
      buyNFT: handleBuyNFT,
      lockNFT: handleLockNFT,
      unlockNFT: handleUnlockNFT,
      processExpiredRentals: handleProcessExpiredRentals,
      refreshData: loadMarketplaceData,
    },
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * Hook for managing NFT listings
 */
export function useListings(signer: Ed25519Keypair) {
  const { state, actions } = useMarketplace(signer);
  
  const [myListings, setMyListings] = useState<NFTListing[]>([]);
  const [availableListings, setAvailableListings] = useState<NFTListing[]>([]);

  useEffect(() => {
    // Filter listings based on user's address
    const userAddress = signer.getPublicKey().toSuiAddress();
    
    const my = state.listings.filter(listing => listing.owner === userAddress);
    const available = state.listings.filter(listing => 
      listing.status === 'Available' && listing.owner !== userAddress
    );
    
    setMyListings(my);
    setAvailableListings(available);
  }, [state.listings, signer]);

  const createNewListing = useCallback(async (params: CreateListingParams) => {
    await actions.createListing(params);
  }, [actions]);

  const cancelListing = useCallback(async (listingId: string) => {
    // This would need to be implemented in the TypeScript integration
    console.log('Cancel listing:', listingId);
  }, []);

  return {
    myListings,
    availableListings,
    createListing: createNewListing,
    cancelListing,
    loading: state.loading,
    error: state.error,
  };
}

/**
 * Hook for managing rentals
 */
export function useRentals(signer: Ed25519Keypair) {
  const { state, actions } = useMarketplace(signer);
  
  const [myRentals, setMyRentals] = useState<RentalAgreement[]>([]);
  const [rentedToMe, setRentedToMe] = useState<RentalAgreement[]>([]);
  const [expiredRentals, setExpiredRentals] = useState<RentalAgreement[]>([]);

  useEffect(() => {
    const userAddress = signer.getPublicKey().toSuiAddress();
    
    const my = state.rentals.filter(rental => rental.owner === userAddress);
    const rented = state.rentals.filter(rental => rental.renter === userAddress);
    const expired = state.rentals.filter(rental => 
      rental.is_active && isRentalExpired(rental.id)
    );
    
    setMyRentals(my);
    setRentedToMe(rented);
    setExpiredRentals(expired);
  }, [state.rentals, signer]);

  const rentNFT = useCallback(async (listingId: string, paymentAmount: number) => {
    await actions.rentNFT(listingId, paymentAmount);
  }, [actions]);

  const processExpiredRentals = useCallback(async () => {
    const expiredIds = expiredRentals.map(rental => rental.id);
    if (expiredIds.length > 0) {
      await actions.processExpiredRentals(expiredIds);
    }
  }, [expiredRentals, actions]);

  return {
    myRentals,
    rentedToMe,
    expiredRentals,
    rentNFT,
    processExpiredRentals,
    loading: state.loading,
    error: state.error,
  };
}

/**
 * Hook for marketplace statistics
 */
export function useMarketplaceStats() {
  const [stats, setStats] = useState<{
    totalListings: number;
    totalRentals: number;
    platformFeePercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMarketplaceStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

/**
 * Hook for rental cost calculation
 */
export function useRentalCost() {
  const calculateCost = useCallback((rentalPrice: number, durationMs: number) => {
    return calculateRentalCost(rentalPrice, durationMs);
  }, []);

  const calculateDailyCost = useCallback((rentalPrice: number, days: number) => {
    return rentalPrice * days;
  }, []);

  const calculateHourlyCost = useCallback((rentalPrice: number, hours: number) => {
    return (rentalPrice / 24) * hours;
  }, []);

  return {
    calculateCost,
    calculateDailyCost,
    calculateHourlyCost,
  };
}

/**
 * Hook for checking rental expiry
 */
export function useRentalExpiry() {
  const [expiredRentals, setExpiredRentals] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  const checkExpiry = useCallback(async (rentalIds: string[]) => {
    setChecking(true);
    
    try {
      const results = await Promise.all(
        rentalIds.map(id => isRentalExpired(id))
      );
      
      const expired = rentalIds.filter((id, index) => results[index]);
      setExpiredRentals(expired);
      
      return expired;
    } catch (error) {
      console.error('Error checking rental expiry:', error);
      return [];
    } finally {
      setChecking(false);
    }
  }, []);

  const clearExpired = useCallback(() => {
    setExpiredRentals([]);
  }, []);

  return {
    expiredRentals,
    checking,
    checkExpiry,
    clearExpired,
  };
}
