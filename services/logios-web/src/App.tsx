import { useState, useEffect } from 'react';
import './index.css';

const ORDER_API = 'http://136.248.113.7:3001/orders';
const TRACKING_API = 'http://136.248.113.7:3002/tracking';
const AUDIT_API = 'http://136.248.113.7:3001/audit';

export default function App() {
  const [orders, setOrders] = useState<any[]>([]);
  const [trackings, setTrackings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5s for realtime effect
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, trackingsRes, auditRes] = await Promise.all([
        fetch(ORDER_API).catch(() => null),
        fetch(TRACKING_API).catch(() => null),
        fetch(AUDIT_API).catch(() => null)
      ]);

      if (ordersRes && ordersRes.ok) setOrders(await ordersRes.json());
      if (trackingsRes && trackingsRes.ok) setTrackings(await trackingsRes.json());
      if (auditRes && auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Calcula Métricas
  const totalOrders = orders.length;
  // Simulando Receita (Peso * Distancia * 1.5)
  const totalRevenue = orders.reduce((acc, o) => acc + (o.weight * o.distance * 1.5), 0);
  const ticketMedio = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const processando = trackings.filter(t => t.status === 'PREPARANDO').length;
  const emRota = trackings.filter(t => t.status === 'EM_TRANSITO').length;
  const entregues = trackings.filter(t => t.status === 'ENTREGUE').length;
  const cancelados = trackings.filter(t => t.status === 'CANCELADO').length;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"></div>
          <h2>LogisOS</h2>
        </div>
        <nav className="sidebar-menu">
          <p className="menu-label">MENU PRINCIPAL</p>
          <button className={`menu-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('Dashboard')}>
            <span className="icon">📊</span> Dashboard
          </button>
          <button className={`menu-item ${activeTab === 'Pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('Pedidos')}>
            <span className="icon">📦</span> Pedidos
          </button>
          <button className={`menu-item ${activeTab === 'Auditoria' ? 'active' : ''}`} onClick={() => setActiveTab('Auditoria')}>
            <span className="icon">📄</span> Auditoria
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">OP</div>
            <div>
              <p className="username">Operador 01</p>
              <p className="status">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <h1>{activeTab}</h1>
          <p>Visão geral da operação logística.</p>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="dashboard-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Receita Total</span>
                  <span className="icon-light">$</span>
                </div>
                <h3>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}</h3>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Ticket Médio</span>
                  <span className="icon-light">↗</span>
                </div>
                <h3>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticketMedio)}</h3>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Total de Pedidos</span>
                  <span className="icon-light">📦</span>
                </div>
                <h3>{totalOrders}</h3>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Em Rota</span>
                  <span className="icon-light">🚚</span>
                </div>
                <h3>{emRota}</h3>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Processando</span>
                  <span className="icon-light">⏳</span>
                </div>
                <h3>{processando}</h3>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Entregues</span>
                  <span className="icon-light">✅</span>
                </div>
                <h3>{entregues}</h3>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Cancelados</span>
                  <span className="icon-light">⊗</span>
                </div>
                <h3>{cancelados}</h3>
              </div>
            </div>

            {/* Auditoria Integrada */}
            <div className="audit-panel">
              <div className="audit-header">
                <div>
                  <h3>Feed de Auditoria em Tempo Real</h3>
                  <p>Últimos eventos registrados pelo sistema.</p>
                </div>
                <div className="badges">
                  <span className="badge-singleton">Singleton ⓘ</span>
                </div>
              </div>
              <div className="audit-feed">
                {auditLogs.length === 0 && <p className="empty-state">Nenhum evento registrado ainda.</p>}
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="audit-item">
                    <p className="timestamp">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    <p className="log-msg">
                      {log.message.includes('[Observer]') ? (
                        <>
                          <span className="highlight-observer">[Observer]</span> {log.message.replace('[Observer]', '')}
                        </>
                      ) : log.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab !== 'Dashboard' && (
          <div className="placeholder-content">
            <p>Selecione o Dashboard para ver as métricas e logs integrados do sistema.</p>
          </div>
        )}
      </main>
    </div>
  );
}
