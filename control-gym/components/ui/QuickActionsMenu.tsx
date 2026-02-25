import React, { useCallback } from "react";
import { View, TouchableWithoutFeedback, Modal } from "react-native";
import ActionItem from "./ActionItem";
import { useUserStore } from "@/stores/store";

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
  const user = useUserStore((state) => state.user);

  const isStaff = user?.role === "empleado";

  const handleNewClient = useCallback(
    () => onActionPress("new-client"),
    [onActionPress],
  );
  const handleNewPayment = useCallback(
    () => onActionPress("new-payment"),
    [onActionPress],
  );
  const handleCheckIn = useCallback(
    () => onActionPress("check-in"),
    [onActionPress],
  );
  const handleStaff = useCallback(
    () => onActionPress("staff"),
    [onActionPress],
  );

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
              onPress={handleNewClient}
            />
            <ActionItem
              label="Nuevo Pago"
              iconName="credit-card-plus-outline"
              onPress={handleNewPayment}
            />
            <ActionItem
              label="Check-in"
              iconName="qrcode-scan"
              onPress={handleCheckIn}
            />
            {!isStaff && (
              <ActionItem
                label="Agregar Personal"
                iconName="briefcase-plus-outline"
                onPress={handleStaff}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default QuickActionsMenu;
