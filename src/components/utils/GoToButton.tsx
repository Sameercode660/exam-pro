import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface propsTypes  {
  where: string;
  path: string;
}

export default function GoToButton({where, path}: propsTypes) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`${path}`)}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm shadow-lg hover:scale-105 transition-all duration-200"
    >
      Go to {where}
      <ArrowRight size={16} />
    </button>
  );
}
