import React, { useState } from 'react';
import { CreateEquipmentForm } from '../components/CreateEquipmentForm';
import { EquipmentsList } from '../components/EquipmentsList';

export function EquipmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshList((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Equipamentos</h1>
          <p className="text-gray-600">Gerencie seu inventário de equipamentos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna lateral com formulário */}
          <div className="lg:col-span-1">
            {showForm ? (
              <CreateEquipmentForm
                onSuccess={handleSuccess}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                + Novo Equipamento
              </button>
            )}
          </div>

          {/* Coluna principal com lista */}
          <div className="lg:col-span-2">
            <EquipmentsList refreshTrigger={refreshList} />
          </div>
        </div>
      </div>
    </div>
  );
}
