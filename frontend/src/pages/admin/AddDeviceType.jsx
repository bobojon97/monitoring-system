import React, { useState } from "react";

export default function AddDeviceType() {
  const [form, setForm] = useState({ model: "", oid: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/models/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

      const data = await response.json();
      setMessage(`✅ Тип устройства добавлен: ${data.model.model}`);
      setForm({ model: "", oid: "" });
    } catch (error) {
      console.error("Ошибка при добавлении типа устройства:", error);
      setMessage("❌ Не удалось добавить тип устройства");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Добавить тип устройства</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="model"
          value={form.model}
          onChange={handleChange}
          placeholder="Название модели"
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="oid"
          value={form.oid}
          onChange={handleChange}
          placeholder="OID"
          className="border p-2 w-full rounded"
          required
        />

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
