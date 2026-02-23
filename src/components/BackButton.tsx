import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href = '/', label = 'Dashboard' }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      ← {label}
    </Link>
  );
}
