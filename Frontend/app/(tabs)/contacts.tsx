import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addContact, deleteContact, fetchContacts } from "../../api/api";
import { useAuth } from "@/components/auth/auth-context";

// A single contact
type Contact = {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_user_id?: number; // may be null if contact not yet a user
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState<Record<number, boolean>>({}); // map user_id -> isSharing
  const { addSocketListener } = useAuth();

  // listen for socket messages so we can update UI when a contact begins/stops sharing
  useEffect(() => {
    const remove = addSocketListener?.((msg) => {
      if (msg.type === "contact_started") {
        setSharing((prev) => ({ ...prev, [msg.user_id]: true }));
      } else if (msg.type === "contact_ended") {
        setSharing((prev) => ({ ...prev, [msg.user_id]: false }));
      }
    });
    return () => remove?.();
  }, [addSocketListener]);

  // Loading contacts on screen open
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await fetchContacts();
        setContacts(data);
      } catch (e: any) {
        setError("failed to load contacts");
      } finally {
        setLoadingContacts(false);
      }
    };
    loadContacts();
  }, []);

  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const newContact = await addContact(name.trim(), phone.trim());
      setContacts((prev) => [...prev, newContact]);
      setName("");
      setPhone("");
    } catch (e: any) {
      setError("Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  const removeContact = async (id: string) => {
    setError(null);
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError("Failed to remove contact");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          These people will be notified when you trigger an SOS.
        </Text>

        {/* ADDED: show any API errors to the user */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Form — unchanged visually */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#475569"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#475569"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {/* CHANGED: calls handleAddContact instead of addContact, shows spinner while submitting */}
          <TouchableOpacity
            style={[styles.addButton, submitting && { opacity: 0.6 }]}
            onPress={handleAddContact}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>+ Add Contact</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ADDED: show spinner while contacts are loading from backend */}
        {loadingContacts ? (
          <ActivityIndicator color="#ef4444" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No contacts added yet.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.contactCard}>
                <View style={styles.avatar}>
                  {/* CHANGED: item.contact_name instead of item.name */}
                  <Text style={styles.avatarText}>
                    {item.contact_name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  {/* CHANGED: item.contact_name and item.contact_phone to match backend */}
                  <Text style={styles.contactName}>{item.contact_name}</Text>
                  <Text style={styles.contactPhone}>{item.contact_phone}</Text>
                </View>
                {item.contact_user_id != null && sharing[item.contact_user_id] && (
                  <Text style={styles.sharingIndicator}>📍 sharing</Text>
                )}
                {/* CHANGED: calls handleRemoveContact instead of removeContact */}
                <TouchableOpacity onPress={() => removeContact(item.id)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: "#64748b", fontSize: 14, marginBottom: 24 },
  errorText: { color: "#ef4444", fontSize: 13, marginBottom: 12 }, // ADDED
  form: { gap: 12, marginBottom: 24 },
  input: {
    backgroundColor: "#1e1e2e",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2d2d3e",
  },
  addButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  list: { gap: 12, paddingBottom: 40 },
  emptyText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  sharingIndicator: {
    color: "#10b981",
    fontSize: 12,
    marginLeft: 8,
  },
  contactCard: {
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#2d2d3e",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  contactName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  contactPhone: { color: "#64748b", fontSize: 13, marginTop: 2 },
  removeText: { color: "#475569", fontSize: 18, padding: 4 },
});
