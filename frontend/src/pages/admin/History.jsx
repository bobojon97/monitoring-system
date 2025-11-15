import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function History() {
  const [devices, setDevices] = useState([]);
  const [bsName, setBsName] = useState('');
  const [pingStatus, setPingStatus] = useState('');
  const [portStatus, setPortStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // фиксированный лимит
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Загружаем список устройств
  useEffect(() => {
    fetch("http://localhost:8080/get-device/")
      .then(res => res.json())
      .then(setDevices)
      .catch(err => console.error("Ошибка загрузки устройств:", err));
  }, []);

//   useEffect(() => {
//   fetchData(1);
// }, []);

  const fetchData = async (pageNum = 1) => {
  const params = new URLSearchParams();
  if (bsName) params.append("bs_name", bsName);
  if (pingStatus) params.append("ping_status", pingStatus);
  if (portStatus) params.append("port_status", portStatus);
  if (startDate) params.append("start", startDate);
  if (endDate) params.append("end", endDate);
  params.append("page", pageNum);
  params.append("limit", limit);

  try {
    const res = await fetch(`http://localhost:8080/history/?${params.toString()}`);
    const json = await res.json();

    setData(json.data || []);
    setTotal(json.pagination.total);
    setTotalPages(json.pagination.total_pages);
    setPage(pageNum);
  } catch (err) {
    console.error("Ошибка загрузки истории:", err);
    setData([]);
  }
};

const handleSubmit = (e) => {
  e.preventDefault();
  fetchData(1); // всегда начинаем с 1-й страницы
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Заголовок и кнопка "Назад" */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">История устройства</h1>
        <Link
          to="/"
          className="
            inline-flex items-center gap-1.5
            text-sm font-medium
            text-blue-900 hover:text-gray-800
            transition
            group
          "
        >
          <span className="transform group-hover:-translate-x-1 transition">
            ←
          </span>
          Back to Home
        </Link>
      </div>

      {/* Форма фильтров */}
      <form
        onSubmit={handleSubmit}
        className="
          bg-white 
          border border-gray-400 
          rounded-xl 
          p-5 
          shadow-sm 
          hover:shadow 
          transition-shadow
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-5 
          gap-4 
          mb-6
        "
      >
        {/* BS Name */}
        <div>
          <label className="block text-xs font-medium text-blue-600 mb-1.5">BS Name</label>
          <select
            value={bsName}
            onChange={(e) => setBsName(e.target.value)}
            className="
              w-full 
              border border-gray-300 
              rounded-lg 
              px-3 
              py-2 
              text-sm 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-100
            "
          >
            <option value="">Все</option>
            {devices.map((device) => (
              <option key={device.id} value={device.bs_name}>
                {device.bs_name}
              </option>
            ))}
          </select>
        </div>

        {/* Ping Status */}
        <div>
          <label className="block text-xs font-medium text-blue-600 mb-1.5">Ping Status</label>
          <select
            value={pingStatus}
            onChange={(e) => setPingStatus(e.target.value)}
            className="
              w-full 
              border border-gray-300 
              rounded-lg 
              px-3 
              py-2 
              text-sm 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-100
            "
          >
            <option value="">Все</option>
            <option value="up">UP</option>
            <option value="down">DOWN</option>
          </select>
        </div>

        {/* Port Status */}
        <div>
          <label className="block text-xs font-medium text-blue-600 mb-1.5">Port Status</label>
          <input
            type="text"
            value={portStatus}
            onChange={(e) => setPortStatus(e.target.value)}
            placeholder=""
            className="
              w-full 
              border border-gray-300 
              rounded-lg 
              px-3 
              py-2 
              text-sm 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-100
            "
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-blue-600 mb-1.5">Дата начала</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="
              w-full 
              border border-gray-300 
              rounded-lg 
              px-3 
              py-2 
              text-sm 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-100
            "
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-blue-600 mb-1.5">Дата конца</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="
              w-full 
              border border-gray-300 
              rounded-lg 
              px-3 
              py-2 
              text-sm 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-100
            "
          />
        </div>
      </form>

      {/* Кнопка "Показать" — вынесена отдельно, чтобы не теряться */}
      <div className="flex justify-end mb-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="
            bg-blue-600 
            hover:bg-blue-700 
            text-white 
            px-6 
            py-2 
            rounded-lg 
            font-medium 
            text-sm 
            transition 
            shadow-sm 
            hover:shadow
          "
        >
          Показать
        </button>
      </div>

      {/* Таблица */}
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
        "
      >
        {data.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-100">
            {/* Заголовок таблицы — с градиентом как в HomePage */}
            <thead 
              className="
                bg-gradient-to-r 
                from-blue-600 
                via-indigo-700 
                to-purple-800
                text-white
                border-b-0
                shadow-sm
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

            <tbody className="divide-y divide-gray-50 text-sm">
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-25 transition-colors duration-100 border-b border-gray-25"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{row.bs_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`
                        inline-flex items-center gap-1.5
                        px-2 py-1 
                        rounded-lg 
                        text-xs font-bold uppercase
                        shadow-sm
                        ${
                          row.ping_status === 'up'
                            ? 'bg-green-50 text-green-800 border border-green-100'
                            : 'bg-red-50 text-red-800 border border-red-100'
                        }
                      `}
                    >
                      <span
                        className={`
                          w-1.5 h-1.5 rounded-full 
                          ${row.ping_status === 'up' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}
                        `}
                      ></span>
                      {row.ping_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.port_status || '—'}</td>
                  <td className="px-4 py-3 text-gray-800 font-mono text-xs">{row.checked_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            Нет данных по выбранным фильтрам
          </div>
        )}
        {total > 0 && (
  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
    <p className="text-sm text-gray-500">
      Страница {page} из {totalPages} • Всего записей: {total}
    </p>

    <nav className="flex items-center space-x-1">
      <button
        onClick={() => fetchData(page - 1)}
        disabled={page === 1}
        className={`
          px-3 py-1.5 text-sm rounded-lg transition
          ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
        `}
      >
      
      </button>

      {/* Показываем 1, ..., текущую-1, текущую, текущую+1, ..., последнюю */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p =>
          p === 1 ||
          p === totalPages ||
          (p >= page - 1 && p <= page + 1)
        )
        .map((p, index, arr) => {
          const prev = arr[index - 1];
          if (prev && p - prev > 1) {
            return <span key={`dots-${p}`} className="px-3 py-1.5 text-gray-500 text-sm">...</span>;
          }
          return (
            <button
              key={p}
              onClick={() => fetchData(p)}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition
                ${p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              {p}
            </button>
          );
        })}

      <button
        onClick={() => fetchData(page + 1)}
        disabled={page === totalPages}
        className={`
          px-3 py-1.5 text-sm rounded-lg transition
          ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
        `}
      >
        
      </button>
    </nav>
  </div>
)}
      </div>
    </div>
  );
}