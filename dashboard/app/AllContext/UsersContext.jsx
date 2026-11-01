"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [transactions, setTransactions] = useState(null)

  const host1offline = "http://localhost:3001/"
  const host2offline = "http://localhost:8000/"
  const host1online = "https://platform-axon-rust.vercel.app/"
  const host2online = "https://platform-axon-realtime.onrender.com/"

  useEffect(() => {
    const eventSource = new EventSource(`${host2online}api/realtime-events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 🔥 INITIAL PENDING TRANSACTIONS
      if (data.event === "initial_transactions") {
        setTransactions(data.payload);
      }

      // 🔥 REALTIME TRANSACTION UPDATE
      if (data.event === "transaction_update") {
        const updatedDoc = data.payload.fullDocument;

        setTransactions((prev) => {
          const index = prev.findIndex(
            (item) => item._id === updatedDoc._id
          );

          // ❌ Pending se bahar gaya → remove
          if (updatedDoc.status !== "Pending") {
            return prev.filter((item) => item._id !== updatedDoc._id);
          }

          // 🔁 Update existing
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = updatedDoc;
            return updated;
          }

          // ➕ New Pending
          return [updatedDoc, ...prev];
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const submitNewUser = async (data) => {
    try {
      const newUser = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      router.push("/");
      return { user: newUser };
    } catch (error) {
      console.error("Error submitting new user:", error);
      return { error: error.message };
    }
  };

  const loginUser = async (data) => {
    try {
      const user = {
        _id: "1",
        username: data.username,
        loginPassword: data.loginPassword,
      };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/");
      return { user };
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

  // Inside UsersProvider
  const fetchProducts = async (count) => {
    console.log("Hitting API")
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

  // Create Combo
  const createCombo = async (payload) => {
    try {
      const response = await fetch(`${host1online}api/combo/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create combo");
      }

      return { success: true, combo: data.data };
    } catch (error) {
      console.error("Create Combo Error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get all combos
  const getAllCombos = async () => {
    try {
      const response = await fetch(`${host1online}api/combo`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Get All Combos Error:", error);
      return [];
    }
  };

  // Get combos by User ID
  const getCombosByUser = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/combo/user/${userId}/dashboard`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Get Combos By User Error:", error);
      return [];
    }
  };

  // Update Combo
  const updateCombo = async (id, payload) => {
    try {
      const response = await fetch(`${host1online}api/combo/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update combo");

      return { success: true, combo: data.data };
    } catch (error) {
      console.error("Update Combo Error:", error);
      return { success: false, error: error.message };
    }
  };

  // Delete Combo
  const deleteCombo = async (id) => {
    try {
      const response = await fetch(`${host1online}api/combo/delete/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete combo");

      return { success: true };
    } catch (error) {
      console.error("Delete Combo Error:", error);
      return { success: false, error: error.message };
    }
  };

  // Reset combos and tasks for a user
  const resetUserData = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/combo/reset/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to reset user data");

      return { success: true, ...data };
    } catch (error) {
      console.error("Reset User Data Error:", error);
      return { success: false, error: error.message };
    }
  };

  // Refresh for today: records a full set first (if any), then deletes
  // combos and tasks, like Reset. Starts a new day for the user.
  const refreshTasksForToday = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/combo/refresh-today/${userId}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to refresh tasks for today");
      return { success: true, ...data };
    } catch (error) {
      console.error("Refresh Tasks For Today Error:", error);
      return { success: false, error: error.message };
    }
  };

  // Completed sets counts for one user (today = Eastern Time date).
  const getCompletedSets = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/combo/completed-sets/${userId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch completed sets");
      return { success: true, today: data.today || 0, total: data.total || 0, date: data.date };
    } catch (error) {
      console.error("Completed Sets Error:", error);
      return { success: false, today: 0, total: 0 };
    }
  };

  // Completed sets summary for all users: { userId: { today, total } }.
  const getCompletedSetsSummary = async () => {
    try {
      const response = await fetch(`${host1online}api/combo/completed-sets-summary`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch completed sets summary");
      return { success: true, summary: data.summary || {}, date: data.date };
    } catch (error) {
      console.error("Completed Sets Summary Error:", error);
      return { success: false, summary: {} };
    }
  };

  const addWallet = async (payload) => {
    try {
      const response = await fetch(`${host1online}api/users/addWallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to add wallet");

      return { success: true, wallet: data.wallet };
    } catch (error) {
      console.error("Add Wallet Error:", error);
      return { success: false, error: error.message };
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

  const deleteWallet = async (id) => {
    try {
      const response = await fetch(`${host1online}api/users/deleteWallet/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete wallet");

      return { success: true };
    } catch (error) {
      console.error("Delete Wallet Error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateWallet = async (id, payload) => {
    try {
      const response = await fetch(`${host1online}api/users/updateWallet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update wallet");

      return { success: true, wallet: data.wallet };
    } catch (error) {
      console.error("Update Wallet Error:", error);
      return { success: false, error: error.message };
    }
  };


  const updateTransactionStatus = async (transactionId, status) => {
    try {
      const response = await fetch(`${host1online}api/users/updateTransaction/${transactionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update transaction status");

      return { success: true, transaction: data.transaction };
    } catch (error) {
      console.error("Update Transaction Status Error:", error);
      return { success: false, error: error.message };
    }
  };

  const getUserByUserId = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/users/getUserByUserId/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch user");

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Get User by UserId Error:", error);
      return { success: false, error: error.message };
    }
  };

  const fetchWalletAddress = async (addressId) => {
    try {
      const response = await fetch(`${host1online}api/users/fetchWalletAddress/${addressId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch wallet address");

      return { success: true, walletAddress: data.walletAddress };
    } catch (error) {
      console.error("Fetch Wallet Address Error:", error);
      return { success: false, error: error.message };
    }
  };

  const fetchTasksByUser = async (userId) => {
    try {
      const response = await fetch(`${host1online}api/users/fetchTasks/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tasks");
      }

      const data = await response.json();
      console.log("Fetched tasks:", data.tasks);
      return data.tasks; // returns an array of tasks
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  // Create a new transaction
  const createTransactionAPI = async (data) => {
    console.log(data)
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

  const getWalletAddressesByUser = async (userId) => {
    try {
      const response = await fetch(
        `${host1online}api/users/getWalletAddresses/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch wallet addresses");
      }

      return {
        success: true,
        addresses: data.addresses,
      };
    } catch (error) {
      console.error("Get Wallet Addresses Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const updateWalletAddress = async (addressId, payload) => {
    try {
      const response = await fetch(
        `${host1online}api/users/updateAddress/${addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), // { userId, walletLabel, walletAddress }
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update wallet address");
      }

      return {
        success: true,
        address: data.address,
      };
    } catch (error) {
      console.error("Update Wallet Address Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return (
    <UsersContext.Provider
      value={{
        user,
        submitNewUser,
        logout,
        isLoggedIn: !!user,
        loginUser,
        fetchProducts,
        createCombo,
        getAllCombos,
        getCombosByUser,
        updateCombo,
        deleteCombo,
        resetUserData,
        refreshTasksForToday,
        getCompletedSets,
        getCompletedSetsSummary,
        addWallet,
        getWallets,
        deleteWallet,
        updateWallet,
        updateTransactionStatus,
        transactions,
        getUserByUserId,
        fetchWalletAddress,
        fetchTasksByUser,
        createTransactionAPI,
        getWalletAddressesByUser,
        updateWalletAddress
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
