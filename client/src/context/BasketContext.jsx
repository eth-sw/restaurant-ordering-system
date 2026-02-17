import {createContext, useEffect, useMemo, useState} from "react";
import PropTypes from 'prop-types';

const BasketContext = createContext();

/**
 * BasketProvider Context.
 * Manages the global state of a user's basket.
 * Puts data in localStorage for if the page reloads.
 *
 * @param children Child components that need access to basket context
 * @returns {React.JSX.Element} Prover component wrapping application
 *
 * @author Ethan Swain
 */
export const BasketProvider = ({ children }) => {
    // Create basket from localStorage if available, otherwise it's an empty array
    const [basketItems, setBasketItems] = useState(() => {
        const localData = localStorage.getItem('food_basket');
        return localData ? JSON.parse(localData) : [];
    });

    // Update localStorage when basketItems changes
    useEffect(() => {
        localStorage.setItem('food_basket', JSON.stringify(basketItems));
    }, [basketItems]);

    /**
     * Adds an item to the basket.
     * Only allows items from one restaurant at a time.
     *
     * @param item Menu item object to add
     * @param restaurantId ID of the restaurant the item belongs to
     */
    const addToBasket = (item, restaurantId) => {
        // Check if basket already has items from a different restaurant
        if (basketItems.length > 0 && basketItems[0].restaurantId !== restaurantId) {
            if (!globalThis.confirm("Start a new basket?")) {
                return;
            }
            setBasketItems([]); // Clears old basket
        }

        setBasketItems((prevItems) => {
            // Check if item already exists in basket
            const existingItem = prevItems.find((i) => i._id === item._id);
            if (existingItem) {
                // Increment quantity
                return prevItems.map((i) =>
                    i._id === item._id ? {...i, qty: i.qty + 1} : i
                );
            }
            // Add new items, initial quanity is 1
            return [...prevItems, {...item, qty: 1, restaurantId}];
        });
    };

    /**
     * Removes an items from the basket regardless of quanity
     *
     * @param itemId ID of item to remove
     */
    const removeFromBasket = (itemId) => {
        setBasketItems((prevItems) => prevItems.filter((i) => i._id !== itemId));
    };

    /**
     * Decreases quantity of a specific item
     * Removes item entirely if quantity drops to 0
     *
     * @param itemId ID of the item to decrease
     */
    const decreaseQuantity = (itemId) => {
        setBasketItems((prevItems) =>
            prevItems.map((i) =>
                i._id === itemId ? {...i, qty: i.qty - 1} : i
            ).filter((i) => i.qty > 0)
        );
    };

    /**
     * Calculate total price of all items in basket
     *
     * @returns {*} Total price
     */
    const getBasketTotal = () => {
        return basketItems.reduce((total, item) => total + item.price * item.qty, 0)
    };

    /**
     * Context value as memo.
     * Prevents unnecessary re-rendering of components by only creating an object when basketItems changes
     */
    const contextValue = useMemo(() => ({
        basketItems,
        addToBasket,
        removeFromBasket,
        decreaseQuantity,
        getBasketTotal,
    }), [basketItems]);

    return (
        <BasketContext.Provider value={contextValue}>
            {children}
        </BasketContext.Provider>
    );
};

BasketProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default BasketContext;