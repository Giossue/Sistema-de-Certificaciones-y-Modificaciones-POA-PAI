export const formatMoney = (value: string | number) =>
  Number(value).toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
