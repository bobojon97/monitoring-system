import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

function HomePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useContext(AuthContext);



  useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000); // Обновляем каждую секунду

  return () => clearInterval(timer); // Очистка при размонтировании
}, []);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/ping-results/')
      .then((res) => res.json())
      .then((data) => {
        setDevices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 flex items-center gap-2">
            📡 Monitoring System
          </h1>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Real-Time Clock */}
            <div className="font-mono text-sm text-gray-600 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm min-w-fit">
              <time dateTime={currentTime.toISOString()} className="tabular-nums">
                {currentTime.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </time>
            </div>
            <span className="text-sm text-gray-600">
              Hello, <strong>{user?.username}</strong>
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
            {/* Buttons */}
            <Link
              to="/history"
              className="text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              History
            </Link>
            <Link
              to="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Admin Panel
            </Link>
          </div>
        </div>
        {/* Compact Table */}
        {loading ? (
          <div className="text-center text-2xl text-gray-500 font-medium py-16">
            Loading devices...
          </div>
        ) : error ? (
          <div className="text-center text-2xl text-red-500 font-medium py-16">
            {error}
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center text-2xl text-gray-500 font-medium py-16">
            No data available
          </div>
        ) : (
          <div
            className="
              rounded-2xl 
              overflow-hidden 
              bg-white
              shadow-xl 
              shadow-gray-200/60
              border border-gray-100
              transform
              hover:shadow-2xl
              transition-shadow
              duration-300
              mx-2
            "
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                {/* Header — компактный */}
                <thead 
                  className="
                    bg-gradient-to-r 
                    from-blue-600 
                    via-indigo-700 
                    to-purple-800
                    text-white
                    border-b-0
                    shadow-lg
                    shadow-blue-500/20
                    rounded-t-lg
                    overflow-hidden
                    relative
                    after:absolute 
                    after:bottom-0 
                    after:left-0 
                    after:right-0 
                    after:h-0.5 
                    after:bg-gradient-to-r 
                    after:from-transparent 
                    after:via-white/40 
                    after:to-transparent
                    before:absolute
                    before:inset-0
                    before:bg-white/5
                    before:rounded-t-lg
                    before:pointer-events-none
                  "
                >
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">
                      BS Name
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">
                      Ping Status
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">
                      Port Status
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">
                      Timestamp
                    </th>
                  </tr>
                </thead>

                {/* Body — компактные строки */}
                <tbody className="divide-y divide-gray-50 text-sm">
                  {devices.map((device, index) => (
                    <tr
                      key={index}
                      className="
                        hover:bg-gray-25 
                        transition-colors 
                        duration-150
                        group
                        border-b border-gray-25
                      "
                    >
                      <td className="px-4 py-2 font-medium text-gray-800 group-hover:text-blue-700">
                        {device.bs_name}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            px-2.5 py-1 
                            rounded-lg 
                            text-xs font-bold uppercase
                            shadow-sm
                            ${
                              device.ping_status === 'up'
                                ? 'bg-green-50 text-green-800 border border-green-100'
                                : 'bg-red-50 text-red-800 border border-red-100'
                            }
                          `}
                        >
                          <span
                            className={`
                              w-1.5 h-1.5 rounded-full 
                              ${device.ping_status === 'up' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}
                            `}
                          ></span>
                          {device.ping_status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {device.port_status || <span className="text-gray-800">—</span>}
                      </td>
                      <td className="px-4 py-2 text-gray-800 font-mono text-xs">
                        {device.checked_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;