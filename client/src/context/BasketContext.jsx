import {createContext, useEffect, useMemo, useState} from "react";
import PropTypes from 'prop-types';
import {jwtDecode} from "jwt-decode";

const BasketContext = createContext();

/**
 * BasketProvider Context.
 * Manages the global state of a user's basket.
 * Puts data in localStorage by user id for when users are logged in on multiple tabs.
 *
 * @param children Child components that need access to basket context
 * @returns {React.JSX.Element} Provider component wrapping the app
 *
 * @author Ethan Swain
 */
export const BasketProvider = ({children}) => {
    let user = null;
    const token = localStorage.getItem('token');
    if (token) {
        try {
            user = jwtDecode(token).user;
        } catch (err) {
        }
    }

    const storageKey = user ? `basket_${user.id}` : 'basket_guest';

    // Create basket from localStorage if available, otherwise it's an empty array
    const [basketItems, setBasketItems] = useState(() => {
        const localData = localStorage.getItem(storageKey);
        return localData ? JSON.parse(localData) : [];
    });

    useEffect(() => {
        if (user && ['admin', 'supervisor', 'staff'].includes(user.role)) return;
        localStorage.setItem(storageKey, JSON.stringify(basketItems));
    }, [basketItems, storageKey, user]);

    /**
     * Adds an item to the basket or increments quantity if it already exists.
     * Only the user who added the items to their basket can modify it.
     *
     * @param item Menu item object to add
     */
    const addToBasket = (item) => {
        if (user && ['admin', 'supervisor', 'staff'].includes(user.role)) {
            alert("Staff and admins cannot place orders");
            return;
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
            return [...prevItems, {...item, qty: 1}];
        });
    };

    /**
     * Removes an item from the basket regardless of quantity.
     *
     * @param itemId ID of item to remove
     */
    const removeFromBasket = (itemId) => {
        setBasketItems((prevItems) => prevItems.filter((i) => i._id !== itemId));
    };

    /**
     * Decreases quantity of a specific item.
     * Removes item entirely if quantity drops to 0.
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
     * Calculates total price of all items in basket.
     *
     * @returns {number} Total price
     */
    const getBasketTotal = () => {
        return basketItems.reduce((total, item) => total + item.price * item.qty, 0);
    };

    /**
     * Removes all items from the basket.
     */
    const clearBasket = () => {
        setBasketItems([]);
    };

    /**
     * Context value as memo.
     * Prevents re-rendering of child components.
     */
    const contextValue = useMemo(() => ({
        basketItems,
        addToBasket,
        removeFromBasket,
        decreaseQuantity,
        getBasketTotal,
        clearBasket
    }), [basketItems]);

    return (
        <BasketContext.Provider value={contextValue}>
            {children}
        </BasketContext.Provider>
    );
};

BasketProvider.propTypes = {children: PropTypes.node.isRequired};
export default BasketContext;