import { useState } from 'react'

const ORDER_API = 'http://136.248.113.7:3001/orders';
const TRACKING_API = 'http://136.248.113.7:3002/tracking';

function App() {
  const [orderId, setOrderId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [shippingType, setShippingType] = useState('standard');
  const [items, setItems] = useState('');
  
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState('EM_TRANSITO');
  const [updateLocation, setUpdateLocation] = useState('');
  
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (msg: string, type: string) => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: orderId,
        customerId,
        weight: Number(weight),
        distance: Number(distance),
        shippingType,
        items: items.split(',').map(i => i.trim())
      };
      
      const res = await fetch(ORDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Erro ao criar pedido');
      
      // Auto-criar o rastreio inicial para facilitar a demonstração
      await fetch(TRACKING_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          status: 'PREPARANDO',
          location: 'Centro de Distribuição Inicial'
        })
      });

      showNotification('Pedido e Rastreio gerados com sucesso!', 'success');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleConsultTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${TRACKING_API}/${trackingId}`);
      if (!res.ok) throw new Error('Rastreio não encontrado');
      const data = await res.json();
      setTrackingResult(data);
      showNotification('Rastreio atualizado!', 'success');
    } catch (err: any) {
      showNotification(err.message, 'error');
      setTrackingResult(null);
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        orderId: trackingId,
        status: updateStatus,
        location: updateLocation
      };
      
      const res = await fetch(TRACKING_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Erro ao atualizar rastreio');
      showNotification('Rastreio atualizado com sucesso!', 'success');
      handleConsultTracking(e); // recarrega os dados
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <h1>Logios Dashboard</h1>
        </div>
        <p>Sistema Inteligente de Logística e Rastreio</p>
      </header>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main className="main-content">
        <section className="glass-card">
          <div className="card-header">
            <h2>Criar Novo Pedido</h2>
            <div className="badge">Order Service</div>
          </div>
          <form onSubmit={handleCreateOrder} className="modern-form">
            <div className="form-row">
              <div className="input-group">
                <label>ID do Pedido</label>
                <input required placeholder="ex: pedido-123" value={orderId} onChange={e => setOrderId(e.target.value)} />
              </div>
              <div className="input-group">
                <label>ID do Cliente</label>
                <input required placeholder="ex: cliente-abc" value={customerId} onChange={e => setCustomerId(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Peso (kg)</label>
                <input type="number" required placeholder="10" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Distância (km)</label>
                <input type="number" required placeholder="50" value={distance} onChange={e => setDistance(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Tipo de Frete</label>
                <select value={shippingType} onChange={e => setShippingType(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Itens (separados por vírgula)</label>
              <input required placeholder="1x Notebook, 2x Mouse" value={items} onChange={e => setItems(e.target.value)} />
            </div>
            <button type="submit" className="primary-button">Gerar Pedido</button>
          </form>
        </section>

        <section className="glass-card tracking-card">
          <div className="card-header">
            <h2>Rastreamento</h2>
            <div className="badge secondary">Tracking Service</div>
          </div>
          
          <form onSubmit={handleConsultTracking} className="tracking-search">
            <div className="input-group horizontal">
              <input required placeholder="Digite o ID do pedido..." value={trackingId} onChange={e => setTrackingId(e.target.value)} />
              <button type="submit" className="primary-button">Consultar</button>
            </div>
          </form>

          {trackingResult && (
            <div className="tracking-result">
              <div className="status-indicator">
                <div className={`pulse-ring ${trackingResult.status.toLowerCase()}`}></div>
                <h3>Status: {trackingResult.status}</h3>
              </div>
              
              <div className="tracking-details">
                <p><strong>Localização Atual:</strong> {trackingResult.location}</p>
                <p><strong>Última atualização:</strong> {new Date(trackingResult.updatedAt).toLocaleString()}</p>
              </div>

              <div className="update-section">
                <h4>Atualizar Rastreio</h4>
                <form onSubmit={handleUpdateTracking} className="modern-form">
                  <div className="form-row">
                    <div className="input-group">
                      <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}>
                        <option value="PREPARANDO">Preparando</option>
                        <option value="EM_TRANSITO">Em Trânsito</option>
                        <option value="ENTREGUE">Entregue</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <input required placeholder="Nova localização" value={updateLocation} onChange={e => setUpdateLocation(e.target.value)} />
                    </div>
                    <button type="submit" className="outline-button">Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
