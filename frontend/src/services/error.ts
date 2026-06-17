// Lay thong bao loi tu response cua backend (dang { message }) hoac fallback.
export function getErrorMessage(err: unknown, fallback = 'Da co loi xay ra'): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

// Dinh dang tien VND
export function formatVND(value: number | string | null | undefined): string {
  return `${Number(value ?? 0).toLocaleString('vi-VN')} đ`;
}
