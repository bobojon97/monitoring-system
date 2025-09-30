import React, { useState, useEffect } from "react";

export default function AddDevice() {
  const [form, setForm] = useState({
    bs_name: "",
    ip_bs: "",
    region_id: "",
    ip_switch: "",
    model_id: ""
  });
  const [regions, setRegions] = useState([]);
  const [models, setModels] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Загружаем список регионов
    fetch("http://localhost:8080/regions/")
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error("Ошибка загрузки регионов:", err));

    // Загружаем список моделей
    fetch("http://localhost:8080/device-types/")
      .then(res => res.json())
      .then(data => setModels(data))
      .catch(err => console.error("Ошибка загрузки моделей:", err));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/devices/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bs_name: form.bs_name,
          ip_bs: form.ip_bs,
          region_id: Number(form.region_id),
          ip_switch: form.ip_switch,
          model_id: form.model_id ? Number(form.model_id) : null
        }),
      });

      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

      const data = await response.json();
      setMessage(`✅ Устройство добавлено: ${data.device.bs_name}`);
      setForm({
        bs_name: "",
        ip_bs: "",
        region_id: "",
        ip_switch: "",
        model_id: ""
      });
    } catch (error) {
      console.error("Ошибка при добавлении устройства:", error);
      setMessage("❌ Не удалось добавить устройство");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Добавить устройство</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="bs_name"
          value={form.bs_name}
          onChange={handleChange}
          placeholder="BS Name"
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="ip_bs"
          value={form.ip_bs}
          onChange={handleChange}
          placeholder="IP BS"
          className="border p-2 w-full rounded"
          required
        />

        {/* Выбор региона */}
        <select
          name="region_id"
          value={form.region_id}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Выберите регион</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="ip_switch"
          value={form.ip_switch}
          onChange={handleChange}
          placeholder="IP Switch"
          className="border p-2 w-full rounded"
          required
        />

        {/* Выбор модели */}
        <select
          name="model_id"
          value={form.model_id}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="">Выберите модель</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Добавить
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
