import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Для модального окна
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Списки для селектов
  const [regions, setRegions] = useState([]);
  const [models, setModels] = useState([]);

  // Форма редактирования
  const [form, setForm] = useState({
    bs_name: "",
    ip_bs: "",
    ip_switch: "",
    model_id: "",
    region_id: ""
  });

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const devicesPerPage = 15;

  // Загрузка устройств
  useEffect(() => {
    fetch("http://localhost:8080/devices/")
      .then((res) => res.json())
      .then((data) => {
        setDevices(data.devices || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке данных:", err);
        setLoading(false);
      });
  }, []);

  // Загрузка регионов и моделей
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [regionsRes, modelsRes] = await Promise.all([
          fetch("http://localhost:8080/regions/").then(r => r.json()),
          fetch("http://localhost:8080/device-types/").then(r => r.json())
        ]);
        setRegions(regionsRes);
        setModels(modelsRes);
      } catch (err) {
        console.error("Ошибка загрузки опций:", err);
      }
    };
    loadOptions();
  }, []);

    // Пагинация
  // Фильтрация по BS Name
  const filteredDevices = devices.filter(d =>
    d.bs_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Пагинация по отфильтрованным данным
  const totalPages = Math.ceil(filteredDevices.length / devicesPerPage);
  const startIndex = (currentPage - 1) * devicesPerPage;
  const currentDevices = filteredDevices.slice(startIndex, startIndex + devicesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Открытие модалки + заполнение формы
  const openModal = (device) => {
    setSelectedDevice(device);
    setForm({
      bs_name: device.bs_name,
      ip_bs: device.ip_bs,
      ip_switch: device.ip_switch,
      model_id: device.model?.id || "",
      region_id: device.region?.id || ""
    });
    setIsModalOpen(true);
  };

  // Закрытие модалки
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  // Изменение полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Сохранение изменений
  const handleSave = async () => {
  if (!selectedDevice) return;

  const payload = {
    bs_name: form.bs_name,
    ip_bs: form.ip_bs,
    ip_switch: form.ip_switch,
    model_id: form.model_id ? Number(form.model_id) : undefined,
    region_id: form.region_id ? Number(form.region_id) : undefined
  };

  try {
    const res = await fetch(`http://localhost:8080/devices/${selectedDevice.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const result = await res.json();

      // Обновляем устройство в списке
      setDevices(prev =>
        prev.map(d =>
          d.id === selectedDevice.id
            ? {
                ...d,
                bs_name: result.device.bs_name,
                ip_bs: result.device.ip_bs,
                ip_switch: result.device.ip_switch,
                model_id: result.device.model_id,
                region_id: result.device.region_id,
                model: models.find(m => m.id === result.device.model_id) || d.model,
                region: regions.find(r => r.id === result.device.region_id) || d.region
              }
            : d
        )
      );

      // Показываем сообщение об успехе
      setSuccessMessage("Устройство успешно обновлено!");

      // Скрываем через 3 секунды
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Закрываем модалку
      closeModal();
    } else {
      const err = await res.json();
      setSuccessMessage(""); // очищаем, если была ошибка
      alert("Ошибка: " + (err.detail || "Не удалось обновить"));
    }
  } catch (err) {
    console.error("Ошибка при сохранении:", err);
    setSuccessMessage("");
    alert("Ошибка соединения с сервером");
  }
};

const handleDelete = async (device) => {
  if (!window.confirm(`Вы уверены, что хотите удалить устройство "${device.bs_name}"?`)) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/devices/${device.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      // Удаляем из списка
      setDevices(prev => prev.filter(d => d.id !== device.id));
      setSuccessMessage("Устройство успешно удалено!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      const err = await res.json();
      alert("Ошибка: " + (err.detail || "Не удалось удалить"));
    }
  } catch (err) {
    console.error("Ошибка при удалении:", err);
    alert("Ошибка соединения с сервером");
  }
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
  <h1 className="text-3xl font-bold text-gray-800 text-center">Админ панель</h1>
  <div className="h-1 w-24 bg-blue-600 rounded mt-2 mx-auto"></div>

  {/* Успешное сообщение и поиск */}
  <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center">
    {/* Сообщение об успехе */}
    {successMessage && (
      <div className="px-4 py-2 bg-green-100 border border-green-200 text-green-800 text-sm rounded-lg animate-fade-in max-w-xs">
        {successMessage}
      </div>
    )}

    {/* Поле поиска */}
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder="Поиск по BS Name"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Сброс на первую страницу при поиске
        }}
        className="
          w-full 
          border border-gray-300 
          rounded-lg 
          px-4 
          py-2 
          text-sm 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-100
          placeholder-gray-500
        "
      />
    </div>
  </div>
</div>

      {/* Таблица */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="text-gray-500 text-lg">Загрузка устройств...</div>
        </div>
      ) : currentDevices.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Нет доступных устройств
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-200/60 border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white ...">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">ID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">BS Name</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">IP BS</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">IP Switch</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">Модель</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">Регион</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider relative z-10">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {currentDevices.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-25 border-b border-gray-25">
                    <td className="px-4 py-3 font-medium">{d.id}</td>
                    <td className="px-4 py-3 font-medium text-blue-700">{d.bs_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.ip_bs}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.ip_switch}</td>
                    <td className="px-4 py-3">{d.model?.model || '—'}</td>
                    <td className="px-4 py-3">{d.region?.name || '—'}</td>
                    <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => openModal(d)}
                        className="
                          text-xs font-medium
                          text-blue-600 hover:text-blue-800
                          bg-blue-50 hover:bg-blue-100
                          px-2.5 py-1 
                          rounded
                          transition
                        "
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(d)}
                        className="
                          text-xs font-medium
                          text-red-600 hover:text-red-800
                          bg-red-50 hover:bg-red-100
                          px-2.5 py-1 
                          rounded
                          transition
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="flex justify-center mt-8 mb-4">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
              
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, arr) => {
                  const prevPage = arr[index - 1];
                  if (prevPage && page - prevPage > 1) {
                    return <span key="dots" className="px-3 py-1.5 text-gray-500 text-sm">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  );
                })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
              
              </button>
            </nav>
          </div>

          <p className="text-center text-sm text-gray-500">
            Страница {currentPage} из {totalPages} • Всего: {devices.length}
          </p>
        </>
      )}

      {/* Модальное окно — Форма редактирования */}
      {isModalOpen && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Редактировать устройство</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">BS Name</label>
                  <input
                    type="text"
                    name="bs_name"
                    value={form.bs_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">IP BS</label>
                  <input
                    type="text"
                    name="ip_bs"
                    value={form.ip_bs}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">IP Switch</label>
                  <input
                    type="text"
                    name="ip_switch"
                    value={form.ip_switch}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Модель</label>
                  <select
                    name="model_id"
                    value={form.model_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">— Выберите модель —</option>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Регион</label>
                  <select
                    name="region_id"
                    value={form.region_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">— Выберите регион —</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}