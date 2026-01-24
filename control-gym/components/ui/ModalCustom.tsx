import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewProps,
} from "react-native";

interface ModalCustomProps extends ViewProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  transparentBg?: boolean;
  animationType?: "none" | "slide" | "fade";
}

const ModalCustom: React.FC<ModalCustomProps> = ({
  visible,
  onRequestClose,
  children,
  transparentBg = true,
  animationType = "slide",
  ...props
}) => {
  return (
    <Modal
      visible={visible}
      transparent={transparentBg}
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.centered} {...props}>
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
});

export default ModalCustom;
