import React, { useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ButtonCustom from "@/components/ui/ButtonCustom";

interface ManualEntryModalProps {
  visible: boolean;
  searchQuery: string;
  searchResults: any[];
  selectedClient: any;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  primaryColor: string;
  loading?: boolean;
  onClose: () => void;
  onSearchChange: (text: string) => void;
  onSelectClient: (client: any) => void;
  onConfirm: () => void;
  onDeny: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  visible,
  searchQuery,
  searchResults,
  selectedClient,
  backgroundColor,
  cardColor,
  textColor,
  textSecondaryColor,
  primaryColor,
  loading = false,
  onClose,
  onSearchChange,
  onSelectClient,
  onConfirm,
  onDeny,
}) => {
  const handleDeselectClient = () => {
    onSelectClient(null);
  };

  const renderClientItem = useCallback(
    ({ item }: { item: any }) => {
      const isActive = !!item.isActive;
      const statusColor = isActive ? "#10b981" : "#ef4444";
      const statusBg = isActive ? "#10b98120" : "#ef444420";
      const isSelected = selectedClient?._id === item._id;

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onSelectClient(item)}
          style={[
            styles.resultItem,
            {
              backgroundColor: cardColor,
              borderColor: isSelected ? primaryColor : "transparent",
            },
          ]}
        >
          <View
            style={{ backgroundColor: `${primaryColor}20` }}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <MaterialIcons name="person" size={22} color={primaryColor} />
          </View>
          <View className="flex-1 ml-3">
            <Text
              style={{ color: textColor }}
              className="text-base font-semibold"
              numberOfLines={1}
            >
              {item.firstName} {item.lastName}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <View
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: statusColor }}
              />
              <Text style={{ color: statusColor, fontSize: 12 }}>
                {isActive ? "Activo" : "Inactivo"}
              </Text>
            </View>
          </View>
          {isSelected && (
            <MaterialIcons name="check-circle" size={22} color={primaryColor} />
          )}
        </TouchableOpacity>
      );
    },
    [selectedClient, cardColor, primaryColor, textColor, onSelectClient],
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  // Contenido principal del modal
  const renderContent = () => {
    if (loading) {
      return (
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text
            style={{ color: textSecondaryColor }}
            className="text-base mt-4 text-center"
          >
            Cargando clientes...
          </Text>
        </View>
      );
    }

    // Cliente seleccionado → mostrar detalle
    if (selectedClient) {
      return (
        <View className="py-4">
          <TouchableOpacity
            onPress={handleDeselectClient}
            className="flex-row items-center mb-4"
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color={primaryColor}
            />
            <Text
              style={{ color: primaryColor }}
              className="text-sm font-semibold ml-1"
            >
              Volver a resultados
            </Text>
          </TouchableOpacity>

          <View
            style={[styles.clientCard, { backgroundColor: cardColor }]}
            className="w-full p-6 rounded-3xl"
          >
            <View className="items-center mb-6">
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: `${primaryColor}20` },
                ]}
                className="w-20 h-20 rounded-full items-center justify-center mb-3"
              >
                <MaterialIcons name="person" size={40} color={primaryColor} />
              </View>
              <Text
                style={{ color: textColor }}
                className="text-xl font-bold text-center"
              >
                {selectedClient.firstName} {selectedClient.lastName}
              </Text>
            </View>

            <View
              style={{ borderTopWidth: 1, borderTopColor: `${textSecondaryColor}20` }}
              className="pt-3"
            >
              <View className="flex-row items-center justify-between py-2">
                <Text
                  style={{ color: textSecondaryColor }}
                  className="text-base"
                >
                  Estado
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: selectedClient.isActive
                        ? "#10b98120"
                        : "#ef444420",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedClient.isActive ? "#10b981" : "#ef4444",
                    }}
                    className="text-sm font-semibold"
                  >
                    {selectedClient.isActive ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
            </View>

            {!selectedClient.isActive && (
              <View
                style={{ backgroundColor: "#fef2f2" }}
                className="mt-4 p-3 rounded-xl flex-row items-start"
              >
                <MaterialIcons
                  name="warning"
                  size={20}
                  color="#ef4444"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <Text style={{ color: "#ef4444" }} className="text-sm flex-1">
                  Este cliente tiene membresía inactiva
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    // Hay resultados de búsqueda → mostrar lista
    if (searchQuery.length >= 2 && searchResults.length > 0) {
      return (
        <View className="flex-1">
          <Text
            style={{ color: textSecondaryColor }}
            className="text-xs font-semibold mb-3 uppercase tracking-wide"
          >
            {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderClientItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      );
    }

    // Sin resultados o búsqueda vacía → placeholder
    return (
      <View className="items-center justify-center py-12">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: `${textSecondaryColor}15` }}
        >
          <MaterialIcons
            name={searchQuery.length >= 2 ? "search-off" : "person-search"}
            size={32}
            color={textSecondaryColor}
          />
        </View>
        <Text
          style={{ color: textSecondaryColor }}
          className="text-base text-center font-medium"
        >
          {searchQuery.length >= 2
            ? "No se encontraron clientes"
            : "Busca un cliente por nombre"}
        </Text>
        {searchQuery.length < 2 && searchQuery.length > 0 && (
          <Text
            style={{ color: textSecondaryColor }}
            className="text-sm text-center mt-1 opacity-70"
          >
            Escribe al menos 2 caracteres
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor }]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={{ color: textColor }} className="text-2xl font-bold">
                Ingreso Manual
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="px-6 mb-4">
              <View
                style={[styles.searchContainer, { backgroundColor: cardColor }]}
              >
                <MaterialIcons
                  name="search"
                  size={24}
                  color={textSecondaryColor}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Buscar cliente por nombre..."
                  placeholderTextColor={textSecondaryColor}
                  value={searchQuery}
                  onChangeText={(text) => {
                    onSearchChange(text);
                    if (selectedClient) onSelectClient(null);
                  }}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      onSearchChange("");
                      onSelectClient(null);
                    }}
                  >
                    <MaterialIcons
                      name="cancel"
                      size={20}
                      color={textSecondaryColor}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Content Area */}
            <View className="px-6 flex-1">{renderContent()}</View>

            {/* Action Buttons */}
            <View className="px-6 pb-6 pt-2 gap-3">
              <ButtonCustom
                title="Registrar Acceso"
                onPress={onConfirm}
                disabled={!selectedClient || !selectedClient.isActive}
                tertiary={!selectedClient || !selectedClient.isActive}
              />
              <ButtonCustom
                title="Denegar Acceso"
                onPress={onDeny}
                disabled={!selectedClient}
                secondary
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "95%",
    minHeight: "90%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 2,
  },
  clientCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarPlaceholder: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
