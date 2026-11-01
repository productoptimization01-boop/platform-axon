"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const host1offline = "http://localhost:3001/"
  const host2offline = "http://localhost:8000/"
  const host1online = "https://platform-axon-rust.vercel.app/"
  const host2online = "https://platform-axon-realtime.onrender.com/"

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?._id) {
        fetchUserById(parsed._id);
      }
    }
  }, []);

  const fetchUserById = async (id) => {
    try {
      const response = await fetch(`${host1online}api/users/getUser/${id}`);

      const result = await response.json();
      if (!response.ok) {
        console.error("Fetch user error:", result.error);
        return null;
      }

      // update state + localStorage
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));

      return result.user;

    } catch (error) {
      console.error("FetchUserById Error:", error);
      return null;
    }
  };

  // Function to handle the POST request
  const submitNewUser = async (data) => {
    try {
      const response = await fetch(`${host1online}api/users/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong with the request.");
      }

      // ✅ If no error, user created successfully
      if (!result.error && result.user) {
        // save session locally
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));

        // redirect to home page
        router.push("/");
      }

      return result;
    } catch (error) {
      console.error("Error submitting new user:", error);
    }
  };

  // 🧠 Add this inside UsersProvider, below submitNewUser
  const loginUser = async (data) => {
    try {
      const response = await fetch(`${host1online}api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed");

      if (result.user) {
        // ✅ Store user session
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push("/");
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Update User via API
  const updateUserAPI = async (userId, updatedData) => {
    try {
      const response = await fetch(
        `${host1online}api/users/updateUser/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Update user failed:", result.error);
        return null;
      }

      // Update local user state
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));

      return result.user;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  };

  // Update User via API
  const submitTask = async (userId, updatedData) => {
    try {
      const response = await fetch(
        `${host1online}api/users/submitTask/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Update user failed:", result.error);
        return null;
      }

      // Update local user state
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));

      return result.user;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  };

  // Inside UsersProvider
  const fetchOptimizationProducts = async (count) => {
    try {
      const response = await fetch(`${host1online}api/products/fetchProducts/${count}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch products");
      }
      const data = await response.json();
      return data.products; // return the array of products
    } catch (error) {
      console.error("Fetch Products Error:", error);
      return [];
    }
  };

  // Fetch all tasks for a user
  const fetchTasks = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/users/fetchTasks/${userId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error("FetchTasks error:", result.error);
        return [];
      }

      return result.tasks || [];
    } catch (error) {
      console.error("FetchTasks Error:", error);
      return [];
    }
  };

  // Inside UsersProvider, add this function
  const getTaskForUser = async (userId, taskNo) => {
    try {
      const response = await fetch(`${host1online}api/users/getTaskForUser/${userId}/${taskNo}`);
      const result = await response.json();

      if (!response.ok) {
        console.error("getTaskForUser error:", result.error);
        return null;
      }

      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));

      return result; // result contains { orderType, combo/product }
    } catch (error) {
      console.error("getTaskForUser Error:", error);
      return null;
    }
  };

  // Save a task (normal or combo) and apply commission
  const saveTask = async ({ userId, orderType, combo, product, commission }) => {
    try {
      const response = await fetch(`${host1online}api/users/saveTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          orderType,
          combo: orderType === "Combo" ? combo : null,
          product: orderType === "Normal" ? product : null,
          commission
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("saveTask failed:", result.error);
        return null;
      }

      // ✅ Update local user state
      if (result.user) {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      console.error("saveTask error:", error);
      return null;
    }
  };

  // Create a new transaction
  const createTransactionAPI = async (data) => {
    try {
      const response = await fetch(`${host1online}api/users/createTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong while creating transaction.");
      }

      return result; // returns { message, transaction }
    } catch (error) {
      console.error("CreateTransactionAPI Error:", error);
      return { error: error.message };
    }
  };

  // Fetch all transactions for a user
  const getUserTransactionsAPI = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/users/getTransactions/${userId}`);

      const result = await response.json();
      console.log(result.transactions)

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch transactions.");
      }

      return result.transactions || [];
    } catch (error) {
      console.error("getUserTransactionsAPI Error:", error);
      return { error: error.message };
    }
  };

  const createWalletAddressAPI = async (data) => {
    try {
      const response = await fetch(`${host1online}api/users/createAddress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong while creating wallet address.");
      }

      return result; // returns { message, address }
    } catch (error) {
      console.error("CreateWalletAddressAPI Error:", error);
      return { error: error.message };
    }
  };

  const updateWalletAddressAPI = async (addressId, data) => {
    try {
      const response = await fetch(`${host1online}api/users/updateAddress/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong while updating wallet address.");
      }

      return result; // returns { message, address }
    } catch (error) {
      console.error("UpdateWalletAddressAPI Error:", error);
      return { error: error.message };
    }
  };

  const deleteWalletAddressAPI = async (addressId, userId) => {
    try {
      const response = await fetch(`${host1online}api/users/deleteAddress/${addressId}?userId=${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong while deleting wallet address.");
      }

      return result; // { message }
    } catch (error) {
      console.error("DeleteWalletAddressAPI Error:", error);
      return { error: error.message };
    }
  };

  const getWalletAddressesAPI = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/users/getWalletAddresses/${userId}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong while fetching wallet addresses.");
      }

      return result; // returns { message, addresses }
    } catch (error) {
      console.error("GetWalletAddressesAPI Error:", error);
      return { error: error.message };
    }
  };

  const getWallets = async () => {
    try {
      const response = await fetch(`${host1online}api/users/getWallet`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch wallets");

      return data.wallets || [];
    } catch (error) {
      console.error("Get Wallets Error:", error);
      return [];
    }
  };

  const getCombos = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/combo/user/${userId}/user`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch combos");

      return data.data || []; // Assuming the combos data is under the `data` key
    } catch (error) {
      console.error("Get Combos Error:", error);
      return [];
    }
  };

  return (
    <UsersContext.Provider
      value={{
        user,
        setUser,
        submitNewUser,
        logout,
        isLoggedIn: !!user,
        loginUser,
        updateUserAPI,
        submitTask,
        fetchOptimizationProducts,
        fetchTasks,
        getTaskForUser,
        saveTask,
        createTransactionAPI,
        getUserTransactionsAPI,
        createWalletAddressAPI,
        updateWalletAddressAPI,
        deleteWalletAddressAPI,
        getWalletAddressesAPI,
        getWallets,
        getCombos
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsersContext() {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsersContext must be used within UsersProvider");
  return context;
}
