import { BadgeButton } from "@/components/ui/BadgeButton";
import ButtonCustom from "@/components/ui/ButtonCustom";
import DateSelect from "@/components/ui/DateSelect";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import PaymentMethodSelector from "@/components/ui/PaymentMethodSelector";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { useClientsQuery } from "@/hooks/queries/useClients";
import { usePeriodPricingQuery } from "@/hooks/queries/usePeriodPricing";
import { useRenewMembership } from "@/hooks/queries/useRenewMembership";
import { useToast } from "@/hooks/useToast";
import {
  calculateExpirationDate,
  formatDate,
  hasExpired,
} from "@/utils/membershipUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PERIOD_OPTIONS = [
  { key: "1 dia", label: "1 Dia" },
  { key: "7 dias", label: "7 Dias" },
  { key: "15 dias", label: "15 Dias" },
  { key: "mensual", label: "Mensual" },
] as const;

interface ClientItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  selected_period?: string;
  endDate?: string;
  startDate?: string;
  createdAt?: string;
  membershipStartDate?: string;
  paymentMethod?: string;
}

export default function RenewMembershipScreen() {
  const { colors, primaryColor } = useTheme();
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();

  // Data queries
  const { data: clients = [] } = useClientsQuery();
  const { data: pricingData } = usePeriodPricingQuery();
  const periodPricing = pricingData?.periodPricing;
  const renewMutation = useRenewMembership();
  const loading = renewMutation.isPending;

  // Client search state
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);

  // Form state
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [period, setPeriod] = useState<string>("mensual");
  const [price, setPrice] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "efectivo" | "transferencia"
  >("efectivo");

  // Auto-populate price from period pricing
  useEffect(() => {
    if (periodPricing && period) {
      const periodKey = period.toLowerCase() as keyof typeof periodPricing;
      const autoPrice = periodPricing[periodKey];
      if (autoPrice !== undefined && autoPrice > 0) {
        setPrice(String(autoPrice));
      } else {
        setPrice("");
      }
    }
  }, [period, periodPricing]);

  // Filter and sort clients: inactive/expired first
  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();
    let filtered = (clients as ClientItem[]).filter((c) => {
      if (!term) return true;
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return fullName.includes(term) || c.email?.toLowerCase().includes(term);
    });

    // Sort: inactive first, then by name
    filtered.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? 1 : -1;
      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
      );
    });

    return filtered;
  }, [clients, search]);

  const formatPrice = (value: number) => `$${value.toLocaleString()}`;

  const getBadgeLabel = (option: (typeof PERIOD_OPTIONS)[number]) => {
    if (!periodPricing) return option.label;
    const periodKey = option.key as keyof typeof periodPricing;
    const p = periodPricing[periodKey];
    if (p && p > 0) return `${option.label} - ${formatPrice(p)}`;
    return option.label;
  };

  const getClientStatus = (client: ClientItem) => {
    if (!client.isActive) return { label: "Inactivo", color: colors.error };
    const expDate = calculateExpirationDate(
      client.membershipStartDate,
      client.createdAt,
      client.selected_period,
    );
    if (hasExpired(expDate)) return { label: "Expirado", color: "#D97706" };
    return { label: "Activo", color: "#10B981" };
  };

  const getClientExpiration = (client: ClientItem) => {
    if (client.endDate) return formatDate(new Date(client.endDate));
    const expDate = calculateExpirationDate(
      client.membershipStartDate,
      client.createdAt,
      client.selected_period,
    );
    return formatDate(expDate);
  };

  const handleSelectClient = (client: ClientItem) => {
    setSelectedClient(client);
    setSearch("");
    // Pre-fill payment method from client's current method
    if (
      client.paymentMethod === "efectivo" ||
      client.paymentMethod === "transferencia"
    ) {
      setPaymentMethod(client.paymentMethod);
    }
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setSearch("");
  };

  const handleRenew = () => {
    if (!selectedClient) {
      showWarning("Selecciona un cliente");
      return;
    }
    if (!period) {
      showWarning("Selecciona un periodo");
      return;
    }
    if (!startDate) {
      showWarning("Selecciona una fecha de inicio");
      return;
    }

    renewMutation.mutate(
      {
        clientId: selectedClient._id,
        startDate,
        selected_period: period,
        paymentMethod,
        paymentAmount: price ? Number(price) : 0,
      },
      {
        onSuccess: () => {
          showSuccess("Membresía actualizada correctamente");
          setTimeout(() => router.back(), 1000);
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : "No se pudo actualizar";
          showError(message);
        },
      },
    );
  };

  const renderClientItem = ({ item }: { item: ClientItem }) => {
    const status = getClientStatus(item);
    return (
      <TouchableOpacity
        onPress={() => handleSelectClient(item)}
        activeOpacity={0.7}
        className="flex-row items-center p-3 rounded-xl mb-2"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <MaterialIcons name="person" size={20} color={primaryColor} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text }}
          >
            {item.firstName} {item.lastName}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {item.selected_period || "Sin periodo"} ·{" "}
            {getClientExpiration(item)}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: `${status.color}20` }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}
    >
      <HeaderTopScrenn isBackButton title="Actualizar Membresía" />

      {!selectedClient ? (
        /* ─── Fase 1: Búsqueda y selección de cliente ─── */
        <View className="flex-1">
          <TextField
            placeholder="Buscar por nombre o email..."
            value={search}
            onChangeText={setSearch}
            leftIcon={
              <MaterialIcons name="search" size={20} color="#9CA3AF" />
            }
          />
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item._id}
            renderItem={renderClientItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-8">
                <MaterialIcons
                  name="person-search"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  className="mt-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {search
                    ? "No se encontraron clientes"
                    : "Busca un cliente para renovar"}
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        /* ─── Fase 2: Formulario de renovación ─── */
        <>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="flex-1"
          >
            <View className="w-full max-w-xl self-center">
              {/* Card del cliente seleccionado */}
              <View
                className="flex-row items-center p-4 rounded-2xl mb-4"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  borderWidth: 1,
                  borderColor: `${primaryColor}30`,
                }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${primaryColor}25` }}
                >
                  <MaterialIcons name="person" size={24} color={primaryColor} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    {selectedClient.firstName} {selectedClient.lastName}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getClientStatus(selectedClient).color}20`,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: getClientStatus(selectedClient).color,
                        }}
                      >
                        {getClientStatus(selectedClient).label}
                      </Text>
                    </View>
                    <Text
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {getClientExpiration(selectedClient)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClearClient}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${colors.border}50` }}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Fecha de inicio */}
              <DateSelect
                label="Fecha de inicio"
                value={startDate}
                onChange={setStartDate}
                placeholder="Selecciona la fecha de inicio"
                width="full"
              />

              {/* Periodo */}
              <Text
                style={{ color: colors.text }}
                className="mb-2 font-bold text-sm"
              >
                Periodo
              </Text>
              <View className="flex flex-row gap-2 flex-wrap mb-4">
                {PERIOD_OPTIONS.map((option) => (
                  <BadgeButton
                    key={option.key}
                    label={getBadgeLabel(option)}
                    onPress={() => setPeriod(option.key)}
                    isSelected={period === option.key}
                  />
                ))}
              </View>

              {/* Precio */}
              <TextField
                label="Precio"
                placeholder="$0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                leftIcon={
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color="#9CA3AF"
                  />
                }
              />

              {/* Método de pago */}
              <Text
                style={{ color: colors.text }}
                className="mb-2 font-bold text-sm"
              >
                Método de Pago
              </Text>
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              {/* Resumen */}
              {price && Number(price) > 0 && (
                <View
                  className="rounded-xl p-3 mt-4 mb-2 flex-row items-center justify-between"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderWidth: 1,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  <View>
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="text-xs uppercase"
                    >
                      Total a cobrar
                    </Text>
                    <Text
                      style={{ color: colors.text }}
                      className="text-xl font-bold"
                    >
                      {formatPrice(Number(price))}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="text-xs"
                    >
                      {PERIOD_OPTIONS.find((o) => o.key === period)?.label ||
                        period}{" "}
                      ·{" "}
                      {paymentMethod === "efectivo"
                        ? "Efectivo"
                        : "Transferencia"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <ButtonCustom
            title={loading ? "Actualizando..." : "Renovar Membresía"}
            onPress={handleRenew}
            disabled={loading}
          />
        </>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={3000}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
