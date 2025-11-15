import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Левый сайдбар */}
      <Sidebar />

      {/* Правая рабочая область */}
      <div className="flex-1 p-6">
        <Outlet /> {/* Здесь будут рендериться вложенные страницы */}
      </div>
    </div>
  );
}
