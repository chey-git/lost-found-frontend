import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// ✅ Firebase Config (from your .env file)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_name: "",
    description: "",
    location: "",
    contact_number: "",
    type: "lost",
  });
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);

  // Track user login state
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("http://localhost:5000/api/items");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("image", image);

      const res = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setForm({
          item_name: "",
          description: "",
          location: "",
          contact_number: "",
          type: "lost",
        });
        setImage(null);
        fetchItems();
      } else {
        console.error("Failed to submit item");
      }
    } catch (error) {
      console.error("Error submitting item:", error);
    }
  }

  function handleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  function handleLogout() {
    signOut(auth);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Campus Lost & Found
      </h1>

      {/* LOGIN SECTION */}
      {!user ? (
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="flex justify-between mb-4">
          <p className="text-gray-700">
            Signed in as <strong>{user.displayName}</strong>
          </p>
          <button onClick={handleLogout} className="text-red-500">
            Logout
          </button>
        </div>
      )}

      {/* FORM (only visible if logged in) */}
      {user && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 border rounded-lg shadow p-4 bg-white"
        >
          <input
            className="border p-2 w-full rounded"
            placeholder="Item Name"
            value={form.item_name}
            onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            required
          />
          <textarea
            className="border p-2 w-full rounded"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>
          <input
            className="border p-2 w-full rounded"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Contact Number"
            value={form.contact_number}
            onChange={(e) =>
              setForm({ ...form, contact_number: e.target.value })
            }
          />
          <select
            className="border p-2 w-full rounded"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <input
            type="file"
            className="block w-full text-sm text-gray-500"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Report Item
          </button>
        </form>
      )}

      {/* ITEMS LIST */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Reported Items</h2>
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i._id}
            className="border p-4 rounded shadow bg-gray-50 flex flex-col gap-2"
          >
            <h3 className="text-xl font-bold">{i.item_name}</h3>
            {i.image_url && (
              <img
                src={i.image_url}
                alt="item"
                className="max-h-48 object-cover rounded"
              />
            )}
            <p className="text-gray-700">{i.description}</p>
            <p className="text-sm text-gray-600">📍 {i.location}</p>
            <p className="text-sm text-gray-600">
              📞 {i.contact_number || "No contact provided"}
            </p>
            <p className="text-xs text-gray-500">
              📅{" "}
              {i.reported_at
                ? new Date(i.reported_at).toLocaleDateString()
                : "Date not available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
