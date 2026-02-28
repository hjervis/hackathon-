// storage helper handles secure store on native platforms and localStorage on web
import { getItem } from "../utils/storage";

const API_URL = process.env.EXPO_PUBLIC_IP_ADDRESS;

// Helper to get the token
export async function getToken(): Promise<string | null> {
  return await getItem("token");
}

// Helper to get current user's id
async function getUserId(): Promise<number> {
  const userJson = await getItem("user");
  if (!userJson) throw new Error("Not logged in");
  const user = JSON.parse(userJson);
  return user.id;
}

// Login function
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

// Register function
export async function register(
  username: string,
  email: string,
  password: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

// Example: fetch contacts
export async function fetchContacts() {
  const token = await getToken();
  const userId = await getUserId();
  const res = await fetch(`${API_URL}/users/${userId}/contacts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch contacts");
  return data;
}

// Add new contacts
export async function addContact(contact_name: string, contact_phone: string) {
  const token = await getToken();
  const userId = await getUserId();
  const res = await fetch(`${API_URL}/users/${userId}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contact_name, contact_phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to add new contact");
  return data;
}

// Delete contact by ID
export async function deleteContact(id: string) {
  const token = await getToken();
  const userId = await getUserId();
  const res = await fetch(`${API_URL}/users/${userId}/contacts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to delete contact");
  }
}
