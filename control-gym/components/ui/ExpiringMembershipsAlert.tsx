import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ModalCustom from "./ModalCustom";
import { useTheme } from "@/context/ThemeContext";

interface ExpiringMembershipsAlertProps {
  count: number;
  expiringData?: any;
}

const ExpiringMembershipsAlert: React.FC<ExpiringMembershipsAlertProps> = ({
  count,
  expiringData,
}) => {
  const [isExpiringModalOpen, setIsExpiringModalOpen] = useState(false);
  const { colors } = useTheme();

  const formatExpirationDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getDaysUntilExpiration = (dateString: string) =>
    Math.ceil(
      (new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

  const expiringSoonClients = (expiringData?.clients ?? [])
    .filter((client) => {
      const daysLeft = getDaysUntilExpiration(client.expiresAt);
      return daysLeft >= 0 && daysLeft <= 7;
    })
    .sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsExpiringModalOpen(true)}
        style={{ backgroundColor: "#FEF3C7" }}
        className="rounded-2xl p-4 mx-1 my-2 flex-row items-center"
      >
        <View
          style={{ backgroundColor: "#FDE68A" }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
        >
          <MaterialIcons name="warning" size={22} color="#D97706" />
        </View>
        <View className="flex-1">
          <Text style={{ color: "#92400E" }} className="text-sm font-bold">
            {count} {count === 1 ? "membresía vence" : "membresías vencen"} esta
            semana
          </Text>
          <Text style={{ color: "#B45309" }} className="text-xs mt-0.5">
            Toca para ver detalles
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#D97706" />
      </TouchableOpacity>
      <ModalCustom
        visible={isExpiringModalOpen}
        onRequestClose={() => setIsExpiringModalOpen(false)}
        animationType="fade"
      >
        <View
          style={{ backgroundColor: colors.card }}
          className="w-[90%] max-h-[80%] rounded-2xl p-4"
        >
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text
                style={{ color: colors.text }}
                className="text-lg font-bold"
              >
                Membresías por vencer
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs mt-0.5"
              >
                {expiringSoonClients.length} clientes esta semana
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsExpiringModalOpen(false)}
              style={{ backgroundColor: `${colors.textSecondary}22` }}
              className="px-3 py-1 rounded-lg"
            >
              <Text style={{ color: colors.text }}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {expiringSoonClients.length === 0 ? (
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm text-center py-6"
              >
                No hay clientes por vencer esta semana.
              </Text>
            ) : (
              expiringSoonClients.map((client) => (
                <View
                  key={client._id}
                  style={{ borderColor: `${colors.textSecondary}25` }}
                  className="border rounded-xl p-3 mb-2"
                >
                  <Text
                    style={{ color: colors.text }}
                    className="font-semibold text-sm"
                  >
                    {client.name}
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-xs mt-1"
                  >
                    Plan: {client.membershipType}
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-xs"
                  >
                    Vence: {formatExpirationDate(client.expiresAt)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ModalCustom>
    </>
  );
};

export default ExpiringMembershipsAlert;
