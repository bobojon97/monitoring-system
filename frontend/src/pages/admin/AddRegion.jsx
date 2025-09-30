import React, { useState } from "react";

export default function AddRegion() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/regions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

      const data = await response.json();
      setMessage(`✅ Регион добавлен: ${data.region.name}`);
      setName("");
    } catch (error) {
      console.error("Ошибка при добавлении региона:", error);
      setMessage("❌ Не удалось добавить регион");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Добавить регион</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название региона"
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
