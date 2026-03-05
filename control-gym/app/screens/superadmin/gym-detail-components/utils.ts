export const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";
