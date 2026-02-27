import React from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ButtonCustom from "@/components/ui/ButtonCustom";

export interface AccessResult {
  allowed: boolean;
  clientName: string;
  message: string;
  membershipType?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
}

interface AccessResultCardProps {
  result: AccessResult;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  onScanAnother: () => void;
  onClose: () => void;
}

const membershipLabels: Record<string, string> = {
  basico: "Básico",
  pro: "Pro",
  proplus: "Pro+",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export const AccessResultCard: React.FC<AccessResultCardProps> = ({
  result,
  cardColor,
  textColor,
  textSecondaryColor,
  borderColor,
  onScanAnother,
  onClose,
}) => {
  const allowed = result.allowed;

  const statusColor = allowed ? "#10B981" : "#DC2626";
  const statusBg = allowed ? "#D1FAE5" : "#FEE2E2";
  const statusIcon = allowed ? "check-circle" : "cancel";
  const statusTitle = allowed ? "Acceso Permitido" : "Acceso Denegado";

  const infoItems = [
    {
      icon: "card-membership" as const,
      label: "Membresía",
      value:
        membershipLabels[result.membershipType || ""] ||
        result.membershipType ||
        "—",
    },
    {
      icon: "email" as const,
      label: "Email",
      value: result.email || "—",
    },
    {
      icon: "phone" as const,
      label: "Teléfono",
      value: result.phone || "—",
    },
    {
      icon: "event" as const,
      label: "Vencimiento",
      value: formatDate(result.endDate),
    },
  ];

  return (
    <ScrollView
      className="flex-1 px-6"
      contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Status Card */}
      <View
        style={{
          backgroundColor: cardColor,
          borderRadius: 20,
          borderWidth: 1,
          borderColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Status Header */}
        <View
          style={{
            backgroundColor: statusBg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          className="items-center py-6"
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: statusColor + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <MaterialIcons name={statusIcon} size={44} color={statusColor} />
          </View>
          <Text style={{ color: statusColor }} className="text-xl font-bold">
            {statusTitle}
          </Text>
          {result.message && (
            <Text
              style={{ color: statusColor }}
              className="text-sm mt-1 text-center opacity-80"
            >
              {result.message}
            </Text>
          )}
        </View>

        {/* Client Name */}
        <View className="items-center pt-5 pb-3 px-6">
          <Text
            style={{ color: textColor }}
            className="text-2xl font-bold text-center"
          >
            {result.clientName}
          </Text>
        </View>

        {/* Info Items */}
        {result.clientName && (
          <View className="px-6 pb-4">
            {infoItems.map((item, index) => (
              <View
                key={item.icon}
                style={{
                  borderBottomWidth: index < infoItems.length - 1 ? 1 : 0,
                  borderBottomColor: borderColor,
                }}
                className="flex-row items-center py-3"
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: textSecondaryColor + "15",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={18}
                    color={textSecondaryColor}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    style={{ color: textSecondaryColor }}
                    className="text-xs"
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{ color: textColor }}
                    className="text-sm font-semibold"
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Buttons */}
        <View className="px-6 pb-6 gap-3">
          <ButtonCustom title="Escanear Otro" onPress={onScanAnother} />
          <ButtonCustom title="Cerrar" onPress={onClose} secondary />
        </View>
      </View>
    </ScrollView>
  );
};
