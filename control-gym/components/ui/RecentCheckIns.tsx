import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Avatar from "./Avatar";

type CheckIn = {
  id: string;
  name: string;
  membership: string;
  time: string;
  image: string;
};

const CHECK_INS: CheckIn[] = [
  {
    id: "1",
    name: "Jordan Smith",
    membership: "Elite",
    time: "Just now",
    image: "https://i.pravatar.cc/150?u=jordan",
  },
  {
    id: "2",
    name: "Sarah Connor",
    membership: "Basic",
    time: "12 mins ago",
    image: "https://i.pravatar.cc/150?u=sarah",
  },
];

const RecentCheckIns: React.FC = () => {
  return (
    <View className="my-5 px-1">
      {/* Header de la sección */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[20px] font-extrabold text-[#1A1A1A]">
          Check-ins Recientes
        </Text>
        <TouchableOpacity>
          <Text className="text-[14px] font-bold text-[#66BB6A] tracking-wide">
            VER TODOS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Check-ins */}
      {CHECK_INS.map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-2xl p-4 flex-row items-center mb-3 shadow-sm shadow-black/5"
        >
          <Avatar size="md" uri={item.image} />

          <View className="flex-1 ml-4">
            <Text className="text-[16px] font-bold text-[#1A1A1A] mb-0.5">
              {item.name}
            </Text>
            <Text className="text-[13px] text-[#94A3B8]">
              Membresía:{" "}
              <Text className="text-[#64748B] font-medium">
                {item.membership}
              </Text>
            </Text>
          </View>

          <View className="items-end justify-between h-10">
            <Text className="text-[12px] font-bold text-[#1A1A1A]">
              {item.time}
            </Text>
            {/* Punto verde de estado activo */}
            <View className="w-2 h-2 rounded-full bg-[#66BB6A] mt-1.5" />
          </View>
        </View>
      ))}
    </View>
  );
};

export default RecentCheckIns;
