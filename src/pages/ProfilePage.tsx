import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [settings, setSettings] = useState({
    currency: 'EUR',
    showDecimals: true,
    compactMode: false
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user?.user_metadata) {
      const meta = user.user_metadata;
      setFirstName(meta.first_name || '');
      setLastName(meta.last_name || '');
      setUsername(meta.username || '');
      setAvatarUrl(meta.avatar_url || '');
      if (meta.settings) {
        setSettings({ ...settings, ...meta.settings });
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        username: username,
        avatar_url: avatarUrl,
        settings: settings
      });
      setStatus({ msg: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (err: any) {
      setStatus({ msg: 'Erro ao guardar as alterações: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayedAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || user?.email || 'User')}&background=378ADD&color=fff&size=128`;

  return (
    <div className="flex flex-col min-h-full max-w-4xl mx-auto p-6 md:p-10 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">O meu Perfil</h1>
          <p className="text-gray-500 mt-1">Gira as tuas informações e preferências do dashboard.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-5 py-2.5 bg-white border border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Terminar Sessão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar - Avatar and quick info */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card flex flex-col items-center h-fit">
          <div className="relative group mb-6">
            <img 
              src={displayedAvatar} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center">{firstName} {lastName}</h3>
          <p className="text-sm text-gray-500 mb-6 italic">@{username || 'utilizador'}</p>
          
          <div className="w-full pt-6 border-t border-gray-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-700 font-medium truncate max-w-[120px]">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Membro desde</span>
                <span className="text-gray-700 font-medium">Abril 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Informações Pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Primeiro Nome</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="João" 
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Apelido</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Silva" 
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="joaosilva" 
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">URL da Fotografia</label>
                  <input 
                    type="url" 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg" 
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Definições do Dashboard</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Mostrar Decimais</p>
                      <p className="text-xs text-gray-400">Exibir valores como "12.5%" em vez de "13%"</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.showDecimals} 
                        onChange={(e) => setSettings({...settings, showDecimals: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Modo Compacto</p>
                      <p className="text-xs text-gray-400">Reduzir o espaçamento entre elementos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.compactMode} 
                        onChange={(e) => setSettings({...settings, compactMode: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Moeda Principal</label>
                    <select 
                      value={settings.currency} 
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                      <option value="GBP">Pound (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                {status && (
                  <p className={`text-sm font-bold ${status.type === 'success' ? 'text-brand-mintdark' : 'text-brand-red'}`}>
                    {status.msg}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 sm:flex-none px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </div>
          </form>

          <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-orange-800 font-bold">Segurança da Conta</h4>
              <p className="text-orange-700/70 text-sm mt-1">Deseja alterar a sua password ou remover a sua conta? Contacte o suporte técnico Antigravity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
