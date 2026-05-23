import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StockAlert {
  type: 'critical' | 'warning' | 'info';
  equipmentId: string;
  equipmentName: string;
  message: string;
  details?: string;
}

interface OSStatusIndicator {
  osId: string;
  totalItems: number;
  selectedItems: number;
  checkedOutItems: number;
  checkedInItems: number;
  signedOutItems: number;
  signedInItems: number;
  status: 'draft' | 'ready' | 'in_transit' | 'completed' | 'issues';
}

interface AlertsProps {
  alerts: StockAlert[];
}

interface StatusIndicatorProps {
  status: OSStatusIndicator;
}

export function StockAlerts({ alerts }: AlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => (
        <Alert
          key={idx}
          variant={alert.type === 'critical' ? 'destructive' : 'default'}
          className={
            alert.type === 'warning' ? 'border-orange-500 bg-orange-50' : 
            alert.type === 'info' ? 'border-blue-500 bg-blue-50' : ''
          }
        >
          {alert.type === 'critical' && <AlertTriangle className="h-4 w-4 text-destructive" />}
          {alert.type === 'warning' && <AlertCircle className="h-4 w-4 text-orange-600" />}
          {alert.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-600" />}
          <AlertTitle className="text-sm font-semibold">{alert.equipmentName}</AlertTitle>
          <AlertDescription className="text-sm">{alert.message}</AlertDescription>
          {alert.details && (
            <div className="text-xs text-muted-foreground mt-1">{alert.details}</div>
          )}
        </Alert>
      ))}
    </div>
  );
}

export function OSStatusIndicator({ status }: StatusIndicatorProps) {
  const progress = status.totalItems > 0 ? Math.round((status.checkedInItems / status.totalItems) * 100) : 0;
  
  const getStatusColor = () => {
    if (status.status === 'completed') return 'text-green-600 bg-green-50 border-green-200';
    if (status.status === 'in_transit') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (status.status === 'ready') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status.status === 'issues') return 'text-destructive bg-destructive/10 border-destructive/30';
    return 'text-muted-foreground bg-muted/50 border-border';
  };

  const getStatusLabel = () => {
    switch (status.status) {
      case 'completed': return 'Finalizada';
      case 'in_transit': return 'Em Trânsito';
      case 'ready': return 'Pronta para Saída';
      case 'issues': return 'Problemas Detectados';
      default: return 'Rascunho';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_transit': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 space-y-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <div className="font-semibold text-sm">{getStatusLabel()}</div>
            <div className="text-xs opacity-75">
              OS {status.osId}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              status.status === 'completed' ? 'bg-green-600' :
              status.status === 'in_transit' ? 'bg-blue-600' :
              status.status === 'ready' ? 'bg-orange-600' :
              'bg-muted'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-white/50 rounded">
          <div className="font-semibold">{status.selectedItems}</div>
          <div className="text-muted-foreground">Selecionados</div>
        </div>
        <div className="text-center p-2 bg-white/50 rounded">
          <div className="font-semibold">{status.checkedOutItems}</div>
          <div className="text-muted-foreground">Saíram</div>
        </div>
        <div className="text-center p-2 bg-white/50 rounded">
          <div className="font-semibold">{status.checkedInItems}</div>
          <div className="text-muted-foreground">Retornaram</div>
        </div>
      </div>

      {/* Details */}
      {status.checkedOutItems > status.checkedInItems && (
        <div className="text-xs p-2 bg-white/50 rounded">
          <strong>{status.checkedOutItems - status.checkedInItems}</strong> equipamento(s) ainda em trânsito
        </div>
      )}
    </div>
  );
}

// Helper to generate alerts based on stock levels
export function generateStockAlerts(
  selectedItems: any[],
  equipment: any[],
  stockLevels: any[]
): StockAlert[] {
  const alerts: StockAlert[] = [];
  const stockMap = new Map(stockLevels.map((s: any) => [s.equipment_id, s]));

  selectedItems.forEach((item: any) => {
    const eq = equipment.find((e: any) => e.id === item.itemId);
    const stock = stockMap.get(item.itemId);
    const available = stock?.available_stock || 0;

    if (item.qty > available) {
      alerts.push({
        type: 'critical',
        equipmentId: item.itemId,
        equipmentName: eq?.name || 'Desconhecido',
        message: `Quantidade indisponível`,
        details: `Solicitado: ${item.qty} | Disponível: ${available}`,
      });
    }

    if (available < 3 && available > 0) {
      alerts.push({
        type: 'warning',
        equipmentId: item.itemId,
        equipmentName: eq?.name || 'Desconhecido',
        message: `Estoque baixo`,
        details: `Apenas ${available} unidade(s) disponível(is)`,
      });
    }
  });

  return alerts;
}
