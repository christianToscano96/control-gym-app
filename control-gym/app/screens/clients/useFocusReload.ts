import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function useFocusReload(callback: () => void) {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback]),
  );
}
