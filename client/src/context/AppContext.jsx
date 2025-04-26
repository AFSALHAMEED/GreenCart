import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const isSellerIn = useLocation().pathname.includes("seller");
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [userLogIn, setUserLogIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItem, setCartItem] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      console.log("error: ", error);
      setIsSeller(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItem(data.user.cartItem);
      }
    } catch (error) {
      console.log("error: ", error);
      setUser(null);
      setCartItem({});
    }
  };

  const addToCart = (itemsId) => {
    let cartData = structuredClone(cartItem);

    if (cartData[itemsId]) {
      cartData[itemsId] += 1;
    } else {
      cartData[itemsId] = 1;
    }
    setCartItem(cartData);
    toast.success("Added To cart");
  };

  const updateCart = (itemsId, quantity) => {
    let cartData = structuredClone(cartItem);
    cartData[itemsId] = quantity;
    setCartItem(cartData);
    toast.success("Cart Updated");
  };

  const removeFromCart = (itemsId) => {
    let cartData = structuredClone(cartItem);
    if (cartData[itemsId]) {
      cartData[itemsId] -= 1;
      if (cartData[itemsId] === 0) {
        delete cartData[itemsId];
      }
    }
    setCartItem(cartData);
    toast.success("Removed From Cart");
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItem) {
      totalCount += cartItem[item];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItem) {
      let itemInfo = products.find((product) => product._id === item);
      if (cartItem[item] > 0) {
        totalAmount += itemInfo.offerPrice * cartItem[item];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchSeller();
    fetchProducts();
    fetchUser();
  }, []);

  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", {
          userId: user,
          cartItem,
        });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    const keys = Object.keys(cartItem);

    if (user && keys.length > 0) {
      updateCart();
    }
  }, [cartItem]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    userLogIn,
    setUserLogIn,
    products,
    currency,
    addToCart,
    updateCart,
    removeFromCart,
    cartItem,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    isSellerIn,
    axios,
    fetchSeller,
    fetchProducts,
    setCartItem,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
