import React, { useState } from 'react';
import { CreateWorkOrderForm } from '../components/CreateWorkOrderForm';

export function WorkOrdersPage() {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    alert('✅ Ordem de Serviço criada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ordens de Serviço</h1>
            <p className="text-gray-600">Crie e gerencie ordens de serviço</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              + Nova Ordem
            </button>
          )}
        </div>

        {showForm ? (
          <CreateWorkOrderForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mb-4 text-6xl">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma ordem criada</h2>
            <p className="text-gray-600 mb-6">Clique no botão acima para criar sua primeira ordem de serviço</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Criar Ordem de Serviço
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
