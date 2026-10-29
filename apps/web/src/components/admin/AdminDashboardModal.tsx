import { useState, type FC, type FormEvent } from 'react';
import { useAuthStore, type User } from '../../store/useAuthStore';
import { useEventStore } from '../../store/useEventStore';
import {
  ShieldAlert,
  Users,
  PlusCircle,
  Activity,
  Trash2,
  X,
  CheckCircle,
  Database,
  Radio,
  Sparkles,
} from 'lucide-react';
import { EventCategory, EventSource, type WorldEvent } from '../../types';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export const AdminDashboardModal: FC<AdminDashboardModalProps> = ({ onClose }) => {
  const currentUser = useAuthStore((s) => s.user);
  const events = useEventStore((s) => s.events);
  const addEvent = useEventStore((s) => s.addEvent);
  const isSimulatorActive = useEventStore((s) => s.isSimulatorActive);
  const setSimulatorActive = useEventStore((s) => s.setSimulatorActive);

  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'system'>('users');

  // Local state for managed users (simulated user database)
  const [managedUsers, setManagedUsers] = useState<User[]>([
    {
      id: 'usr_admin_1',
      email: 'admin@worldpulse.io',
      role: 'ADMIN',
      created_at: '2026-01-15T08:00:00Z',
    },
    {
      id: 'usr_op_2',
      email: 'operative.lead@intel.gov',
      role: 'OPERATIVE',
      created_at: '2026-03-22T14:30:00Z',
    },
    {
      id: 'usr_analyst_3',
      email: 'analyst.geospatial@defense.net',
      role: 'OPERATIVE',
      created_at: '2026-06-10T11:15:00Z',
    },
    {
      id: 'usr_viewer_4',
      email: 'guest.researcher@mit.edu',
      role: 'USER',
      created_at: '2026-08-04T09:45:00Z',
    },
  ]);

  // Form state for creating a new user
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'USER' | 'OPERATIVE' | 'ADMIN'>('OPERATIVE');

  // Form state for manual telemetry event injection
  const [injectTitle, setInjectTitle] = useState('');
  const [injectCategory, setInjectCategory] = useState<EventCategory>(EventCategory.Natural);
  const [injectSource, setInjectSource] = useState<EventSource>(EventSource.USGS);
  const [injectImportance, setInjectImportance] = useState(8.5);
  const [injectLat, setInjectLat] = useState(35.6895);
  const [injectLon, setInjectLon] = useState(139.6917);
  const [injectCountry, setInjectCountry] = useState('Japan');
  const [injectRegion, setInjectRegion] = useState('Tokyo Bay');
  const [injectDesc, setInjectDesc] = useState('');
  const [injectSuccess, setInjectSuccess] = useState(false);

  const handleAddUser = (e: FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    const user: User = {
      id: `usr_${Date.now().toString(36)}`,
      email: newUserEmail.trim(),
      role: newUserRole,
      created_at: new Date().toISOString(),
    };
    setManagedUsers([user, ...managedUsers]);
    setNewUserEmail('');
  };

  const handleDeleteUser = (id: string) => {
    setManagedUsers(managedUsers.filter((u) => u.id !== id));
  };

  const handleToggleUserRole = (id: string) => {
    setManagedUsers(
      managedUsers.map((u) => {
        if (u.id !== id) return u;
        const nextRole: 'USER' | 'OPERATIVE' | 'ADMIN' =
          u.role === 'USER' ? 'OPERATIVE' : u.role === 'OPERATIVE' ? 'ADMIN' : 'USER';
        return { ...u, role: nextRole };
      })
    );
  };

  const handleInjectEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!injectTitle.trim()) return;

    const newEvt: WorldEvent = {
      id: `evt-admin-${Date.now()}`,
      source: injectSource,
      category: injectCategory,
      type: 'ADMIN_MANUAL_INJECTION',
      title: injectTitle.trim(),
      description: injectDesc.trim() || `Manual strategic intelligence injected by Command Operator.`,
      country: injectCountry.trim() || 'Global Coordinates',
      region: injectRegion.trim() || undefined,
      timestamp: new Date().toISOString(),
      importance: Number(injectImportance),
      location: {
        latitude: Number(injectLat),
        longitude: Number(injectLon),
      },
      metadata: {
        injectedBy: currentUser?.email || 'admin@worldpulse.io',
        verified: true,
      },
    };

    addEvent(newEvt);
    setInjectSuccess(true);
    setTimeout(() => setInjectSuccess(false), 4000);
    setInjectTitle('');
    setInjectDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)]">
        {/* Tactical Corner Reticles */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-slate-100 uppercase flex items-center gap-2">
                <span>TACTICAL COMMAND & CONTROL // ADMIN CONSOLE</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Role-Based Access Control, Manual Telemetry Injection, and Ingestion Lifecycle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>OPERATIVE MANAGEMENT ({managedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>MANUAL INCIDENT INJECTION</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>STREAM GOVERNOR</span>
          </button>
        </div>

        {/* ── TAB 1: User & Operatives Management ── */}
        {activeTab === 'users' && (
          <div className="mt-5 space-y-5 font-mono">
            {/* Create Operative Form */}
            <form onSubmit={handleAddUser} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-100 uppercase mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>AUTHORIZE NEW OPERATIVE CREDENTIAL</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="operative.callsign@agency.gov"
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'USER' | 'OPERATIVE' | 'ADMIN')}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="USER">ROLE: USER (Read Only)</option>
                  <option value="OPERATIVE">ROLE: OPERATIVE (Analyst Clearance)</option>
                  <option value="ADMIN">ROLE: ADMIN (Full Control)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                >
                  PROVISION ACCESS
                </button>
              </div>
            </form>

            {/* Managed Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Operative Identity</th>
                    <th className="py-2.5 px-4">Clearance Role</th>
                    <th className="py-2.5 px-4">Issued Timestamp</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {managedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/30 transition-all">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {u.email}
                        {currentUser?.email === u.email && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleUserRole(u.id)}
                          title="Click to cycle role (USER -> OPERATIVE -> ADMIN)"
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : u.role === 'OPERATIVE'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {u.role} ⟳
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950 hover:text-rose-200 transition-all cursor-pointer"
                          title="Revoke Operative Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: Manual Incident Injection ── */}
        {activeTab === 'events' && (
          <form onSubmit={handleInjectEvent} className="mt-5 space-y-4 font-mono">
            {injectSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>TELEMETRY INJECTED INTO LIVE STREAM // PLOTTED TO 3D GLOBE</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  value={injectTitle}
                  onChange={(e) => setInjectTitle(e.target.value)}
                  placeholder="e.g. Subsea Telecommunications Fiber Severed"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Threat Level / Importance (1 - 10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={injectImportance}
                    onChange={(e) => setInjectImportance(Number(e.target.value))}
                    className="flex-1 accent-cyan-400"
                  />
                  <span className="text-xs font-bold text-cyan-300 w-12">{injectImportance.toFixed(1)}/10</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Category</label>
                <select
                  value={injectCategory}
                  onChange={(e) => setInjectCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value={EventCategory.Natural}>Natural (Seismic / Volcano)</option>
                  <option value={EventCategory.Technology}>Technology (Cyber / Infrastructure)</option>
                  <option value={EventCategory.Space}>Space (Orbital / Astronomical)</option>
                  <option value={EventCategory.Finance}>Finance (Markets / Disruption)</option>
                  <option value={EventCategory.Weather}>Weather (Severe Anomalies)</option>
                  <option value={EventCategory.Geopolitics}>Geopolitics (Conflicts / Treaties)</option>
                  <option value={EventCategory.News}>News (Global Wire Alerts)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Feed Source Attribution</label>
                <select
                  value={injectSource}
                  onChange={(e) => setInjectSource(e.target.value as EventSource)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value={EventSource.USGS}>USGS Earthquake Center</option>
                  <option value={EventSource.GitHub}>GitHub Live Pipeline</option>
                  <option value={EventSource.NASA}>NASA JPL Deep Space</option>
                  <option value={EventSource.CoinGecko}>CoinGecko Market Sentinel</option>
                  <option value={EventSource.OpenMeteo}>Open-Meteo Weather Array</option>
                  <option value={EventSource.Wikimedia}>Wikimedia Foundation</option>
                  <option value={EventSource.News}>Breaking Intelligence News</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Latitude (°)</label>
                <input
                  type="number"
                  step="any"
                  value={injectLat}
                  onChange={(e) => setInjectLat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Longitude (°)</label>
                <input
                  type="number"
                  step="any"
                  value={injectLon}
                  onChange={(e) => setInjectLon(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Nation / Country</label>
                <input
                  type="text"
                  value={injectCountry}
                  onChange={(e) => setInjectCountry(e.target.value)}
                  placeholder="e.g. Iceland"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Regional Sector</label>
                <input
                  type="text"
                  value={injectRegion}
                  onChange={(e) => setInjectRegion(e.target.value)}
                  placeholder="e.g. Reykjanes Peninsula"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Tactical Briefing Synopsis</label>
              <textarea
                rows={2}
                value={injectDesc}
                onChange={(e) => setInjectDesc(e.target.value)}
                placeholder="Detailed tactical summary and impact analysis..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.2)] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>DISPATCH TELEMETRY EVENT TO GLOBE</span>
            </button>
          </form>
        )}

        {/* ── TAB 3: System Pipeline & Stream Governor ── */}
        {activeTab === 'system' && (
          <div className="mt-5 space-y-4 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>SYNTHETIC INGESTION GENERATOR</span>
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                      isSimulatorActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {isSimulatorActive ? 'ACTIVE' : 'HALTED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
                  Controls the continuous background event synthesizer. Generates stochastic multi-source events with coordinate telemetry.
                </p>
                <button
                  onClick={() => setSimulatorActive(!isSimulatorActive)}
                  className={`w-full py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isSimulatorActive
                      ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {isSimulatorActive ? 'PAUSE INGESTION ENGINE' : 'RESUME INGESTION ENGINE'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>STREAM BUFFER STATUS</span>
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    NOMINAL
                  </span>
                </div>
                <div className="space-y-2 text-xs mt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Events in memory buffer:</span>
                    <strong className="text-slate-100">{events.length} records</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Active Layers Enabled:</span>
                    <strong className="text-cyan-300">6 Domains</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cache Eviction Ceiling:</span>
                    <strong className="text-slate-100">300 items FIFO</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
