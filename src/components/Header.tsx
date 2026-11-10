import React from 'react';
import { UserRole } from '../types';
import { USER_ROLES_INFO } from '../utils/statusUtils';
import { Layers, BarChart3, Plus, UserCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'reporting' | 'print';
  setActiveTab: (tab: 'dashboard' | 'reporting' | 'print') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenNewFiche: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onOpenNewFiche,
}) => {
  const currentRoleMeta = USER_ROLES_INFO[currentRole];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap">
                EDF-SEI <span className="text-slate-400">/</span> Enedis
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Prestations Spécifiques
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('reporting')}
              className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'reporting'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Indicateurs & Reporting
            </button>
          </nav>

          {/* Zone 3: Actions & Role Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role selector dropdown */}
            <div className="relative flex items-center">
              <label htmlFor="role-select" className="sr-only">Rôle utilisateur</label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-500 hidden lg:inline">Rôle :</span>
                <select
                  id="role-select"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer truncate max-w-[190px]"
                  title={`${currentRoleMeta.title} - ${currentRoleMeta.subtitle}`}
                >
                  <option value="DEMANDEUR_SEI">W. Tambouran (Demandeur SEI)</option>
                  <option value="INSTRUCTEUR_ENEDIS">S. Dubois (Instructeur Enedis)</option>
                  <option value="VALIDEUR_SEI">M. Lefebvre (Valideur SEI)</option>
                  <option value="PMO_OBSERVATEUR">Cellule PMO (Superviseur)</option>
                </select>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewFiche}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Demande</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
