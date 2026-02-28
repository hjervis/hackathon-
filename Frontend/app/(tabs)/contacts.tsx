import { useEffect, useState } from "react";
import {
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

// A single contact
type Contact = {
  id: string;
  contact_name: string;
  contact_phone: string;
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading contacts on screen open
  useEffect;

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    const newContact: Contact = {
      id: Date.now().toString(), // temp id until backend is up
      name: name.trim(),
      phone: phone.trim(),
    };

    setContacts((prev) => [...prev, newContact]);
    setName("");
    setPhone("");
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
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

        {/* Form */}
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
          <TouchableOpacity style={styles.addButton} onPress={addContact}>
            <Text style={styles.addButtonText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Contact List */}
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No contacts added yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              {/* Avatar initial */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name[0].toUpperCase()}
                </Text>
              </View>

              {/* Name + phone */}
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>

              {/* Remove button */}
              <TouchableOpacity onPress={() => removeContact(item.id)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
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
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    gap: 12,
    paddingBottom: 40,
  },
  emptyText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
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
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  contactName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  contactPhone: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  removeText: {
    color: "#475569",
    fontSize: 18,
    padding: 4,
  },
});
