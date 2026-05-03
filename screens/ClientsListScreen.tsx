// src/screens/ClientsListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../stores/authStores";
import { ClientService } from "../services/clientServices";
import { AlertModal, useModal } from "../components/Componentes";

const clientService = new ClientService();

// ─── Ícones SVG ──────────────────────────────────────────────────────────────

const SearchIcon = ({ size = 20, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Path
      d="M21 21L16.65 16.65"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const PlusIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const PhoneIcon = ({ size = 16, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
      fill={color}
    />
  </Svg>
);

const MailIcon = ({ size = 16, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6L12 13L2 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = ({ size = 18, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BackIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EmptyIcon = ({ size = 64, color = "#334155" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
    <Path
      d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M19 11L21 13L19 15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Componente de item ───────────────────────────────────────────────────────

const ClientCard = ({
  client,
  onPress,
}: {
  client: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.cardWrapper}
  >
    <BlurView intensity={15} tint="dark" style={styles.card}>
      <View style={styles.cardInner}>
        <View style={styles.cardInfo}>
          <Text style={styles.clientName} numberOfLines={1}>
            {client.nome}
          </Text>
          <View style={styles.cardMeta}>
            {client.telefone ? (
              <View style={styles.metaRow}>
                <PhoneIcon size={13} color="#64748B" />
                <Text style={styles.metaText}>{client.telefone}</Text>
              </View>
            ) : null}
            {client.email ? (
              <View style={styles.metaRow}>
                <MailIcon size={13} color="#64748B" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {client.email}
                </Text>
              </View>
            ) : null}
            {!client.telefone && !client.email && (
              <Text style={styles.metaTextEmpty}>Sem contato cadastrado</Text>
            )}
          </View>
        </View>
        <ChevronRightIcon size={18} color="#64748B" />
      </View>
    </BlurView>
  </TouchableOpacity>
);

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ClientsListScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { showModal, modalProps } = useModal();
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    const { clients: data, error } = await clientService.fetchUserClients(
      user.id,
    );
    if (error) {
      showModal({
        title: "Erro",
        message: "Não foi possível carregar os clientes.",
      });
    } else {
      setClients(data);
      setFiltered(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadClients(true);
    }, [user]),
  );

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) {
      setFiltered(clients);
    } else {
      setFiltered(
        clients.filter(
          (c) =>
            (c.nome && c.nome.toLowerCase().includes(q)) ||
            (c.telefone && c.telefone.includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)),
        ),
      );
    }
  }, [search, clients]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClients(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0A0E27", "#1A1F3A", "#0F172A"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando clientes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E27", "#1A1F3A", "#0F172A"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Clientes</Text>
            <Text style={styles.headerSubtitle}>
              {clients.length === 0
                ? "Nenhum cliente ainda"
                : `${clients.length} cliente${clients.length !== 1 ? "s" : ""} cadastrado${clients.length !== 1 ? "s" : ""}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate("ClientDetail", { client: null })
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <PlusIcon size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchIcon size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, telefone ou e-mail..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
      </BlurView>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyIcon size={72} color="#1E293B" />
            <Text style={styles.emptyTitle}>
              {search ? "Nenhum resultado" : "Nenhum cliente ainda"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? "Tente uma busca diferente"
                : "Adicione seu primeiro cliente tocando no botão +"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() =>
              navigation.navigate("ClientDetail", { client: item })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <AlertModal {...modalProps} />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E27" },
  gradient: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    top: -80,
    right: -80,
    opacity: 0.7,
  },
  orb2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    bottom: -60,
    left: -60,
    opacity: 0.7,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 15, color: "#94A3B8" },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, paddingHorizontal: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },
  headerSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#E2E8F0" },

  // List
  listContent: { padding: 20, paddingBottom: 40 },
  separator: { height: 10 },

  // Card
  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
  },
  cardInfo: { flex: 1 },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardMeta: { gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: "#94A3B8", flex: 1 },
  metaTextEmpty: { fontSize: 13, color: "#334155", fontStyle: "italic" },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
    marginTop: 24,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 32,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyActionText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
