import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Главная страница', icon: '🏠' },
    { path: '/admin/devices', label: 'Добавить устройство', icon: '📟' },
    { path: '/admin/regions', label: 'Добавить регион', icon: '🌍' },
    { path: '/admin/device-types', label: 'Типы устройств', icon: '⚙️' },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-gray-200 shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold tracking-wide text-white">Админ панель</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © {new Date().getFullYear()} Monitoring System
      </div>
    </div>
  );
}
