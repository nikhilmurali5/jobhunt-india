export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const COMPANY_COLORS = [
  '#f87c1e', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444',
  '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6', '#6366f1',
];

export function getCompanyColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

export function getCompanyInitials(name) {
  const words = name.replace(/[^a-zA-Z\s]/g, '').split(' ').filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function formatNumber(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n;
}
