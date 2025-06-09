// utils/stringUtils.ts (Nếu chưa có)
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};
