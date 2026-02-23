interface PropertyLabelProps {
  children: React.ReactNode;
  variant: 'tudor' | 'hpl' | 'nissan' | 'tesla';
}

const variants = {
  tudor: { bg: '#E3F2FD', color: '#1565C0' },
  hpl: { bg: '#E8F5E9', color: '#2E7D32' },
  nissan: { bg: '#FFF3E0', color: '#E65100' },
  tesla: { bg: '#EDE7F6', color: '#4527A0' },
} as const;

export default function PropertyLabel({ children, variant }: PropertyLabelProps) {
  const { bg, color } = variants[variant];
  return (
    <span
      className="inline-block text-xs font-semibold tracking-wide uppercase px-2 py-0.5 rounded"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}
