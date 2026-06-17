import { useState, useEffect } from 'react';
import './index.css';

const ORDER_API = 'http://136.248.113.7:3001/orders';
const TRACKING_API = 'http://136.248.113.7:3002/tracking';
const AUDIT_API = 'http://136.248.113.7:3001/audit';
const LOGIN_API = 'http://136.248.113.7:3001/login';
const USERS_API = 'http://136.248.113.7:3001/users';

export default function App() {
  const [orders, setOrders] = useState<any[]>([]);
  const [trackings, setTrackings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('operator');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form States
  const generateRandomId = () => Math.floor(Math.random() * 100000).toString();
  const [orderId, setOrderId] = useState(generateRandomId());
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cep, setCep] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [shippingType, setShippingType] = useState('standard');
  const [items, setItems] = useState('');
  
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState('EM_TRANSITO');
  const [updateLocation, setUpdateLocation] = useState('');
  
  // User Management State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('operator');

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (msg: string, type: string) => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      if (!res.ok) throw new Error('Usuário ou senha incorretos');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      setUserRole(data.user.role);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole('operator');
    setActiveTab('Dashboard');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsAuthenticated(true);
      if (role) setUserRole(role);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5s for realtime effect
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [ordersRes, trackingsRes, auditRes, usersRes] = await Promise.all([
        fetch(ORDER_API).catch(() => null),
        fetch(TRACKING_API).catch(() => null),
        fetch(AUDIT_API).catch(() => null),
        userRole === 'admin' ? fetch(USERS_API).catch(() => null) : Promise.resolve(null)
      ]);

      if (ordersRes && ordersRes.ok) setOrders(await ordersRes.json());
      if (trackingsRes && trackingsRes.ok) setTrackings(await trackingsRes.json());
      if (auditRes && auditRes.ok) setAuditLogs(await auditRes.json());
      if (usersRes && usersRes.ok) setSystemUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: orderId,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        cep,
        referencePoint,
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
      setOrderId(generateRandomId());
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setDeliveryAddress('');
      setCep('');
      setReferencePoint('');
      fetchData(); // refresh data
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
      fetchData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Tem certeza que deseja APAGAR todos os dados do sistema?')) return;
    try {
      const res = await fetch(`${ORDER_API}/clear`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao limpar banco de dados');
      showNotification('Banco de dados limpo com sucesso!', 'success');
      setTrackingResult(null);
      fetchData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleExportBackup = () => {
    window.open(`${ORDER_API}/export`, '_blank');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });
      if (!res.ok) throw new Error('Erro ao criar usuário. Tente outro nome.');
      showNotification('Usuário criado com sucesso!', 'success');
      setNewUsername('');
      setNewPassword('');
      setNewRole('operator');
      fetchData();
    } catch (err: any) {
      showNotification(err.message, 'error');
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

  // Cálculos dinâmicos de Frete
  const parsedWeight = Number(weight) || 0;
  const parsedDistance = Number(distance) || 0;
  const standardCost = parsedWeight * 0.5 + parsedDistance * 0.1;
  const expressCost = parsedWeight * 0.8 + parsedDistance * 0.2;
  const standardDays = Math.max(1, Math.ceil(parsedDistance / 50));
  const expressDays = Math.max(1, Math.ceil(parsedDistance / 100));

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="login-card glass-card">
          <div className="login-header">
            <img src="/logo.png" alt="LogisOS Logo" className="logo-icon" />
            <h2>LogisOS</h2>
            <p>Sistema Inteligente de Logística e Rastreio</p>
          </div>
          <form onSubmit={handleLogin} className="modern-form">
            {loginError && <div className="error-msg">{loginError}</div>}
            <div className="input-group">
              <label>Usuário</label>
              <input required placeholder="ex: admin" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Senha</label>
              <input type="password" required placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
            </div>
            <button type="submit" className="primary-button" style={{marginTop: '12px'}}>Entrar no Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="LogisOS Logo" className="logo-icon" />
          <h2>LogisOS</h2>
          <button className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-menu">
          <p className="menu-label">MENU PRINCIPAL</p>
          <button className={`menu-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }}>
            <span className="icon">📊</span> Dashboard
          </button>
          <button className={`menu-item ${activeTab === 'Pedidos' ? 'active' : ''}`} onClick={() => { setActiveTab('Pedidos'); setIsMobileMenuOpen(false); }}>
            <span className="icon">📦</span> Pedidos
          </button>
          <button className={`menu-item ${activeTab === 'Auditoria' ? 'active' : ''}`} onClick={() => { setActiveTab('Auditoria'); setIsMobileMenuOpen(false); }}>
            <span className="icon">📄</span> Auditoria
          </button>
          {userRole === 'admin' && (
            <button className={`menu-item ${activeTab === 'Usuários' ? 'active' : ''}`} onClick={() => { setActiveTab('Usuários'); setIsMobileMenuOpen(false); }}>
              <span className="icon">👥</span> Usuários
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{userRole === 'admin' ? 'AD' : 'OP'}</div>
            <div>
              <p className="username">{userRole === 'admin' ? 'Admin Supremo' : 'Operador 01'}</p>
              <p className="status">Online</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {userRole === 'admin' && (
              <>
                <button className="primary-button" onClick={handleExportBackup} style={{width: '100%', backgroundColor: '#10b981'}}>
                  Exportar Excel
                </button>
                <button className="outline-button" onClick={handleClearDatabase} style={{width: '100%', borderColor: '#ef4444', color: '#ef4444'}}>
                  Limpar Banco
                </button>
              </>
            )}
            <button className="logout-button" style={{marginTop: 0}} onClick={handleLogout}>Sair da Conta</button>
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
        
        {activeTab === 'Pedidos' && (
          <div className="orders-content">
            {notification.show && (
              <div className={`notification ${notification.type}`}>
                {notification.message}
              </div>
            )}

            <div className="forms-grid">
              <section className="metric-card form-card">
                <div className="metric-header">
                  <h3>Criar Novo Pedido</h3>
                  <span className="badge-service">Order Service</span>
                </div>
                <form onSubmit={handleCreateOrder} className="modern-form">
                  <div className="form-row">
                    <div className="input-group">
                      <label>ID do Pedido (Numérico)</label>
                      <input required placeholder="ex: 12345" value={orderId} onChange={e => setOrderId(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>ID do Cliente</label>
                      <input required placeholder="ex: CLI-999" value={customerId} onChange={e => setCustomerId(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="input-group">
                      <label>Nome Completo do Cliente</label>
                      <input required placeholder="Nome do Destinatário" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Telefone / SMS</label>
                      <input required placeholder="(11) 99999-9999" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>E-mail (Notificações)</label>
                      <input type="email" required placeholder="cliente@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group" style={{ flex: 2 }}>
                      <label>Endereço de Entrega</label>
                      <input required placeholder="Rua, Número, Bairro, Cidade" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>CEP</label>
                      <input required placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="input-group full-width">
                    <label>Ponto de Referência</label>
                    <input placeholder="ex: Ao lado da padaria, prédio azul..." value={referencePoint} onChange={e => setReferencePoint(e.target.value)} />
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Peso Estimado (kg)</label>
                      <input type="number" step="0.1" required placeholder="10" value={weight} onChange={e => setWeight(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Distância da Entrega (km)</label>
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
                  <div className="input-group full-width">
                    <label>Itens do Pedido (separados por vírgula)</label>
                    <input required placeholder="1x Notebook, 2x Mouse" value={items} onChange={e => setItems(e.target.value)} />
                  </div>

                  {/* Simulação Dinâmica de Frete */}
                  {(parsedWeight > 0 || parsedDistance > 0) && (
                    <div style={{
                      marginTop: '16px', padding: '16px', borderRadius: '8px', 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                      display: 'flex', gap: '24px', flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.85rem' }}>SIMULAÇÃO STANDARD</p>
                        <h4 style={{ margin: '4px 0 0 0', color: shippingType === 'standard' ? '#fff' : '#888' }}>
                          R$ {standardCost.toFixed(2)}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Estimativa: {standardDays} dia(s)</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.85rem' }}>SIMULAÇÃO EXPRESS</p>
                        <h4 style={{ margin: '4px 0 0 0', color: shippingType === 'express' ? '#fff' : '#888' }}>
                          R$ {expressCost.toFixed(2)}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Estimativa: {expressDays} dia(s)</p>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="primary-button" style={{ marginTop: '16px' }}>Gerar Pedido Definitivo</button>
                </form>
              </section>

              <section className="metric-card form-card">
                <div className="metric-header">
                  <h3>Rastreamento</h3>
                  <span className="badge-service">Tracking Service</span>
                </div>
                <form onSubmit={handleConsultTracking} className="modern-form">
                  <div className="form-row">
                    <div className="input-group full-width" style={{flexDirection: 'row', gap: '8px'}}>
                      <input style={{flex: 1}} required placeholder="Digite o ID do pedido..." value={trackingId} onChange={e => setTrackingId(e.target.value)} />
                      <button type="submit" className="primary-button">Consultar</button>
                    </div>
                  </div>
                </form>

                {trackingResult && (
                  <div className="tracking-result">
                    <div className="status-box">
                      <h4>Status Atual: <span className="status-text">{trackingResult.status}</span></h4>
                      <p><strong>Local:</strong> {trackingResult.location}</p>
                      <p><strong>Atualizado em:</strong> {new Date(trackingResult.updatedAt).toLocaleString()}</p>
                    </div>

                    <div className="update-section">
                      <h4>Atualizar Status Manualmente</h4>
                      <form onSubmit={handleUpdateTracking} className="modern-form">
                        <div className="form-row">
                          <div className="input-group">
                            <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}>
                              <option value="PREPARANDO">Preparando</option>
                              <option value="EM_TRANSITO">Em Trânsito</option>
                              <option value="ENTREGUE">Entregue</option>
                              <option value="CANCELADO">Cancelado</option>
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
            </div>
          </div>
        )}

        {activeTab === 'Auditoria' && (
          <div className="audit-panel">
            <div className="audit-header">
              <div>
                <h3>Histórico Completo de Auditoria</h3>
                <p>Todos os eventos e logs gerados pelo sistema e registrados pelo Singleton.</p>
              </div>
              <div className="badges">
                <span className="badge-singleton">Singleton ⓘ</span>
              </div>
            </div>
            <div className="audit-feed" style={{maxHeight: 'none'}}>
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
        )}

        {activeTab === 'Usuários' && userRole === 'admin' && (
          <div className="orders-content">
            {notification.show && (
              <div className={`notification ${notification.type}`}>
                {notification.message}
              </div>
            )}
            
            <div className="forms-grid">
              <section className="metric-card form-card">
                <div className="metric-header">
                  <h3>Cadastrar Novo Usuário</h3>
                  <span className="badge-service">Admin Panel</span>
                </div>
                <form onSubmit={handleCreateUser} className="modern-form">
                  <div className="input-group">
                    <label>Nome de Usuário</label>
                    <input required placeholder="ex: joao.silva" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Senha</label>
                    <input type="password" required placeholder="Senha segura" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Nível de Acesso (Role)</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                      <option value="operator">Operador (Acesso Normal)</option>
                      <option value="admin">Administrador (Total Acesso)</option>
                    </select>
                  </div>
                  <button type="submit" className="primary-button" style={{marginTop: '12px'}}>Cadastrar Usuário</button>
                </form>
              </section>

              <section className="metric-card form-card">
                <div className="metric-header">
                  <h3>Usuários do Sistema</h3>
                </div>
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '16px'}}>
                    <thead>
                      <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left'}}>
                        <th style={{padding: '12px', color: '#888'}}>ID</th>
                        <th style={{padding: '12px', color: '#888'}}>Usuário</th>
                        <th style={{padding: '12px', color: '#888'}}>Permissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemUsers.map(u => (
                        <tr key={u.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                          <td style={{padding: '12px', color: '#fff'}}>{u.id}</td>
                          <td style={{padding: '12px', color: '#fff'}}>{u.username}</td>
                          <td style={{padding: '12px'}}>
                            <span className="badge-service" style={{backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: u.role === 'admin' ? '#ef4444' : '#3b82f6'}}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
