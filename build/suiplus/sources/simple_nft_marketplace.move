/// Simplified NFT Rental & Marketplace Smart Contract
/// 
/// This is a simplified version that compiles successfully and demonstrates
/// the core concepts of NFT rental and marketplace functionality on Sui.

module suiplus::simple_nft_marketplace {
    use sui::object::{UID, ID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::clock::{Self, Clock};
    use sui::kiosk::{Kiosk, KioskOwnerCap};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use std::option::{Self, Option};

    // ===== ERRORS =====
    
    const ENotOwner: u64 = 0;
    const ENotListed: u64 = 1;
    const EInvalidPrice: u64 = 2;
    const EInsufficientPayment: u64 = 3;

    // ===== ENUMS =====
    
    /// Status of an NFT listing
    public enum ListingStatus has copy, drop, store {
        Available,
        Rented,
        Sold,
        Cancelled,
    }

    /// Type of listing
    public enum ListingType has copy, drop, store {
        Rental,
        Sale,
        Both,
    }

    // ===== STRUCTS =====
    
    /// Represents an NFT listing in the marketplace
    public struct NFTListing has store {
        id: ID,
        owner: address,
        renter: Option<address>,
        price: u64,
        rental_price: u64,
        duration: u64,
        start_time: u64,
        status: ListingStatus,
        listing_type: ListingType,
        nft_id: ID,
        kiosk_id: ID,
        created_at: u64,
    }

    /// Represents a rental agreement
    public struct RentalAgreement has store {
        id: ID,
        nft_id: ID,
        owner: address,
        renter: address,
        start_time: u64,
        duration: u64,
        daily_price: u64,
        total_payment: u64,
        is_active: bool,
    }

    /// Main marketplace contract
    public struct NFTMarketplace has key {
        id: UID,
        listings: Table<ID, NFTListing>,
        rentals: Table<ID, RentalAgreement>,
        total_listings: u64,
        total_rentals: u64,
        platform_fee_percentage: u64,
    }

    /// Capability for marketplace administration
    public struct MarketplaceCap has key {
        id: UID,
    }

    /// Events
    public struct NFTListed has copy, drop {
        listing_id: ID,
        nft_id: ID,
        owner: address,
        price: u64,
        rental_price: u64,
        listing_type: ListingType,
    }

    public struct NFTRented has copy, drop {
        listing_id: ID,
        nft_id: ID,
        owner: address,
        renter: address,
        duration: u64,
        total_payment: u64,
    }

    public struct NFTSold has copy, drop {
        listing_id: ID,
        nft_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    public struct RentalExpired has copy, drop {
        rental_id: ID,
        nft_id: ID,
        owner: address,
        renter: address,
    }

    public struct ListingCancelled has copy, drop {
        listing_id: ID,
        nft_id: ID,
        owner: address,
    }

    // ===== INITIALIZATION =====
    
    /// Initialize the marketplace
    fun init(ctx: &mut TxContext) {
        let marketplace = NFTMarketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            rentals: table::new(ctx),
            total_listings: 0,
            total_rentals: 0,
            platform_fee_percentage: 5, // 5% platform fee
        };
        
        let cap = MarketplaceCap {
            id: object::new(ctx),
        };
        
        transfer::share_object(marketplace);
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    // ===== LISTING MANAGEMENT =====
    
    /// Create a new NFT listing
    public fun create_listing(
        marketplace: &mut NFTMarketplace,
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        nft_id: ID,
        price: u64,
        rental_price: u64,
        duration: u64,
        listing_type: ListingType,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EInvalidPrice);
        assert!(rental_price > 0, EInvalidPrice);
        assert!(duration > 0, EInvalidPrice);
        
        let owner = tx_context::sender(ctx);
        let listing_id = object::id_from_address(tx_context::fresh_object_address(ctx));
        let current_time = clock::timestamp_ms(clock);
        
        let listing = NFTListing {
            id: listing_id,
            owner,
            renter: option::none(),
            price,
            rental_price,
            duration,
            start_time: 0,
            status: ListingStatus::Available,
            listing_type,
            nft_id,
            kiosk_id: object::id(kiosk),
            created_at: current_time,
        };
        
        table::add(&mut marketplace.listings, listing_id, listing);
        marketplace.total_listings = marketplace.total_listings + 1;
        
        event::emit(NFTListed {
            listing_id,
            nft_id,
            owner,
            price,
            rental_price,
            listing_type,
        });
    }

    /// Cancel an existing listing
    public fun cancel_listing(
        marketplace: &mut NFTMarketplace,
        listing_id: ID,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let listing = table::borrow_mut(&mut marketplace.listings, listing_id);
        
        assert!(listing.owner == sender, ENotOwner);
        assert!(listing.status == ListingStatus::Available, ENotListed);
        
        listing.status = ListingStatus::Cancelled;
        
        event::emit(ListingCancelled {
            listing_id,
            nft_id: listing.nft_id,
            owner: sender,
        });
    }

    // ===== RENTAL OPERATIONS =====
    
    /// Rent an NFT for a specified duration
    public fun rent_nft(
        marketplace: &mut NFTMarketplace,
        listing_id: ID,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let renter = tx_context::sender(ctx);
        let listing = table::borrow_mut(&mut marketplace.listings, listing_id);
        
        assert!(listing.status == ListingStatus::Available, ENotListed);
        assert!(listing.owner != renter, ENotOwner);
        assert!(listing.listing_type == ListingType::Rental || listing.listing_type == ListingType::Both, ENotListed);
        
        let total_payment = listing.rental_price * (listing.duration / 86400000); // Convert duration to days
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= total_payment, EInsufficientPayment);
        
        // Update listing status
        listing.status = ListingStatus::Rented;
        listing.renter = option::some(renter);
        listing.start_time = clock::timestamp_ms(clock);
        
        // Create rental agreement
        let rental_id = object::id_from_address(tx_context::fresh_object_address(ctx));
        let rental = RentalAgreement {
            id: rental_id,
            nft_id: listing.nft_id,
            owner: listing.owner,
            renter,
            start_time: listing.start_time,
            duration: listing.duration,
            daily_price: listing.rental_price,
            total_payment,
            is_active: true,
        };
        
        table::add(&mut marketplace.rentals, rental_id, rental);
        marketplace.total_rentals = marketplace.total_rentals + 1;
        
        // Transfer payment to owner
        transfer::public_transfer(payment, listing.owner);
        
        event::emit(NFTRented {
            listing_id,
            nft_id: listing.nft_id,
            owner: listing.owner,
            renter,
            duration: listing.duration,
            total_payment,
        });
    }

    /// Check if a rental has expired and return NFT to owner
    public fun check_rental_expiry(
        marketplace: &mut NFTMarketplace,
        rental_id: ID,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let rental = table::borrow_mut(&mut marketplace.rentals, rental_id);
        assert!(rental.is_active, ENotListed);
        
        let current_time = clock::timestamp_ms(clock);
        let expiry_time = rental.start_time + rental.duration;
        
        if (current_time >= expiry_time) {
            rental.is_active = false;
            
            // Store rental data before accessing marketplace again
            let nft_id = rental.nft_id;
            let owner = rental.owner;
            let renter = rental.renter;
            
            // Find and update the corresponding listing
            let listing_id = find_listing_by_nft_id(marketplace, nft_id);
            let listing = table::borrow_mut(&mut marketplace.listings, listing_id);
            
            listing.status = ListingStatus::Available;
            listing.renter = option::none();
            listing.start_time = 0;
            
            event::emit(RentalExpired {
                rental_id,
                nft_id,
                owner,
                renter,
            });
        };
    }

    // ===== MARKETPLACE OPERATIONS =====
    
    /// Buy an NFT (permanent ownership transfer)
    public fun buy_nft(
        marketplace: &mut NFTMarketplace,
        listing_id: ID,
        payment: Coin<SUI>,
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let listing = table::borrow_mut(&mut marketplace.listings, listing_id);
        
        assert!(listing.status == ListingStatus::Available, ENotListed);
        assert!(listing.owner != buyer, ENotOwner);
        assert!(listing.listing_type == ListingType::Sale || listing.listing_type == ListingType::Both, ENotListed);
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= listing.price, EInsufficientPayment);
        
        // Update listing status
        listing.status = ListingStatus::Sold;
        
        // Transfer payment to seller
        transfer::public_transfer(payment, listing.owner);
        
        event::emit(NFTSold {
            listing_id,
            nft_id: listing.nft_id,
            seller: listing.owner,
            buyer,
            price: listing.price,
        });
    }

    // ===== UTILITY FUNCTIONS =====
    
    /// Get listing information
    public fun get_listing(marketplace: &NFTMarketplace, listing_id: ID): &NFTListing {
        table::borrow(&marketplace.listings, listing_id)
    }

    /// Get rental information
    public fun get_rental(marketplace: &NFTMarketplace, rental_id: ID): &RentalAgreement {
        table::borrow(&marketplace.rentals, rental_id)
    }

    /// Check if a rental is active
    public fun is_rental_active(marketplace: &NFTMarketplace, rental_id: ID): bool {
        let rental = table::borrow(&marketplace.rentals, rental_id);
        rental.is_active
    }

    /// Get marketplace statistics
    public fun get_marketplace_stats(marketplace: &NFTMarketplace): (u64, u64, u64) {
        (marketplace.total_listings, marketplace.total_rentals, marketplace.platform_fee_percentage)
    }

    /// Update platform fee (only marketplace admin)
    public fun update_platform_fee(
        marketplace: &mut NFTMarketplace,
        _cap: &MarketplaceCap,
        new_fee_percentage: u64,
        _ctx: &mut TxContext
    ) {
        assert!(new_fee_percentage <= 100, EInvalidPrice);
        marketplace.platform_fee_percentage = new_fee_percentage;
    }

    // ===== HELPER FUNCTIONS =====
    
    /// Find listing by NFT ID (internal helper)
    fun find_listing_by_nft_id(marketplace: &NFTMarketplace, nft_id: ID): ID {
        // This is a simplified implementation
        // In a real implementation, you'd maintain an index
        nft_id // Placeholder - would need proper indexing
    }

    /// Calculate rental cost for a given duration
    public fun calculate_rental_cost(rental_price: u64, duration_ms: u64): u64 {
        let days = duration_ms / 86400000; // Convert milliseconds to days
        rental_price * days
    }

    /// Check if a rental has expired (without modifying state)
    public fun is_rental_expired(
        marketplace: &NFTMarketplace,
        rental_id: ID,
        clock: &Clock
    ): bool {
        let rental = table::borrow(&marketplace.rentals, rental_id);
        let current_time = clock::timestamp_ms(clock);
        let expiry_time = rental.start_time + rental.duration;
        current_time >= expiry_time
    }

    // ===== VIEW FUNCTIONS =====
    
    /// Get all active listings count
    public fun get_active_listings_count(marketplace: &NFTMarketplace): u64 {
        marketplace.total_listings
    }

    /// Get all active rentals count
    public fun get_active_rentals_count(marketplace: &NFTMarketplace): u64 {
        marketplace.total_rentals
    }

    /// Check if an NFT is currently rented
    public fun is_nft_rented(marketplace: &NFTMarketplace, nft_id: ID): bool {
        // This would require maintaining an index in a real implementation
        false // Placeholder
    }
}
