import React, { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import ModalCustom from "./ModalCustom";

interface ClientLite {
  _id: string;
  firstName?: string;
  lastName?: string;
  membershipType?: string;
  isActive?: boolean;
}

interface InactiveClientsAlertProps {
  clients: ClientLite[];
  compact?: boolean;
}

const InactiveClientsAlert: React.FC<InactiveClientsAlertProps> = ({
  clients,
  compact = false,
}) => {
  const { colors } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inactiveClients = useMemo(
    () =>
      (clients ?? [])
        .filter((client) => !client?.isActive)
        .sort((a, b) =>
          `${a.firstName ?? ""} ${a.lastName ?? ""}`.localeCompare(
            `${b.firstName ?? ""} ${b.lastName ?? ""}`,
            "es",
          ),
        ),
    [clients],
  );

  if (inactiveClients.length === 0) return null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsModalOpen(true)}
        style={{
          backgroundColor: "#FEE2E2",
          flex: compact ? 1 : undefined,
          minHeight: compact ? 86 : undefined,
        }}
        className={`rounded-2xl ${compact ? "p-3 flex-row items-center" : "p-4 mx-1 my-2 flex-row items-center"}`}
      >
        <View
          style={{ backgroundColor: "#FECACA" }}
          className={`rounded-full items-center justify-center ${compact ? "w-8 h-8 mr-2" : "w-10 h-10 mr-3"}`}
        >
          <MaterialIcons name="person-off" size={compact ? 18 : 22} color="#B91C1C" />
        </View>
        <View className="flex-1">
          {compact ? (
            <Text
              style={{
                color: "#7F1D1D",
                fontSize: 18,
                fontWeight: "800",
                lineHeight: 20,
              }}
            >
              {inactiveClients.length}
            </Text>
          ) : null}
          <Text
            style={{ color: "#7F1D1D" }}
            className={`font-bold ${compact ? "text-[11px]" : "text-sm"}`}
          >
            {compact
              ? inactiveClients.length === 1
                ? "Cliente inactivo"
                : "Clientes inactivos"
              : `${inactiveClients.length} ${inactiveClients.length === 1 ? "cliente inactivo" : "clientes inactivos"}`}
          </Text>
          {!compact ? (
            <Text style={{ color: "#991B1B" }} className="text-xs mt-1">
              Ver detalles
            </Text>
          ) : null}
        </View>
        <MaterialIcons
          name="chevron-right"
          size={compact ? 18 : 24}
          color="#B91C1C"
        />
      </TouchableOpacity>

      <ModalCustom
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        animationType="fade"
      >
        <View
          style={{ backgroundColor: colors.card }}
          className="w-[90%] max-h-[80%] rounded-2xl p-4"
        >
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text style={{ color: colors.text }} className="text-lg font-bold">
                Clientes inactivos
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                {inactiveClients.length} en total
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              style={{ backgroundColor: `${colors.textSecondary}22` }}
              className="px-3 py-1 rounded-lg"
            >
              <Text style={{ color: colors.text }}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {inactiveClients.map((client) => (
              <View
                key={client._id}
                style={{ borderColor: `${colors.textSecondary}25` }}
                className="border rounded-xl p-3 mb-2"
              >
                <Text style={{ color: colors.text }} className="font-semibold text-sm">
                  {`${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Sin nombre"}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
                  Estado: Inactivo
                </Text>
                {client.membershipType ? (
                  <Text style={{ color: colors.textSecondary }} className="text-xs">
                    Plan: {client.membershipType}
                  </Text>
                ) : null}
                <TouchableOpacity
                  onPress={() => {
                    setIsModalOpen(false);
                    router.push({
                      pathname: "/screens/clients/RenewMembershipScreen",
                      params: { clientId: client._id },
                    });
                  }}
                  activeOpacity={0.8}
                  style={{ backgroundColor: "#DC2626" }}
                  className="mt-3 py-2 px-3 rounded-lg self-start"
                >
                  <Text className="text-xs font-semibold text-white">Renovar membresía</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ModalCustom>
    </>
  );
};

export default InactiveClientsAlert;
