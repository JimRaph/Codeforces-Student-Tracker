import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 
        hover:opacity-80 transition-opacity underline underline-offset-4">
          CFST
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors duration-200 ${isActive('/')
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-800 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-200'
              }`}
          >
            Students
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium transition-colors duration-200 ${isActive('/admin')
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-800 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-200'
              }`}
          >
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default Navigation;
