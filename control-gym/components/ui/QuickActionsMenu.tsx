import React from "react";
import { View, TouchableWithoutFeedback, Modal } from "react-native";
import ActionItem from "./ActionItem";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface QuickActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onActionPress: (action: string) => void;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  visible,
  onClose,
  onActionPress,
}) => {
  // const primary = useThemeColor({}, "tint");
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end items-end">
          <View className="mb-[150px] mr-8 ">
            <ActionItem
              label="Nuevo Cliente"
              iconName="account-plus-outline"
              onPress={() => onActionPress("Nuevo Cliente")}
            />
            <ActionItem
              label="Nuevo Pago"
              iconName="credit-card-plus-outline"
              onPress={() => onActionPress("Nuevo Pago")}
            />
            <ActionItem
              label="Check-in"
              iconName="qrcode-scan"
              onPress={() => onActionPress("Check-in")}
            />
            <ActionItem
              label="Agregar Personal"
              iconName="briefcase-plus-outline"
              onPress={() => onActionPress("Agregar Personal")}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default QuickActionsMenu;
