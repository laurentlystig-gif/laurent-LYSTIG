import React, { useState, useEffect } from 'react';
import { FicheDemande, UserRole } from './types';
import { INITIAL_FICHES } from './data/mockFiches';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FicheDetailModal } from './components/FicheDetailModal';
import { NewFicheModal } from './components/NewFicheModal';
import { PrintFicheView } from './components/PrintFicheView';
import { ReportingView } from './components/ReportingView';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'sei_enedis_fiches_v1';

export default function App() {
  const [fiches, setFiches] = useState<FicheDemande[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_FICHES;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('VALIDEUR_SEI');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reporting' | 'print'>('dashboard');
  const [selectedFiche, setSelectedFiche] = useState<FicheDemande | null>(null);
  const [printFicheTarget, setPrintFicheTarget] = useState<FicheDemande | null>(null);
  const [isNewFicheOpen, setIsNewFicheOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fiches));
    } catch {
      // storage unavailable
    }
  }, [fiches]);

  const handleUpdateFiche = (updated: FicheDemande) => {
    setFiches((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    if (selectedFiche && selectedFiche.id === updated.id) {
      setSelectedFiche(updated);
    }
    if (printFicheTarget && printFicheTarget.id === updated.id) {
      setPrintFicheTarget(updated);
    }
  };

  const handleCreateFiche = (newFiche: FicheDemande) => {
    setFiches((prev) => [newFiche, ...prev]);
    setIsNewFicheOpen(false);
    setSelectedFiche(newFiche);
  };

  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser le jeu de données démo aux valeurs d\'origine (incluant la fiche type F2026-183) ?')) {
      setFiches(INITIAL_FICHES);
      localStorage.removeItem(STORAGE_KEY);
      setSelectedFiche(null);
      setPrintFicheTarget(null);
      setActiveTab('dashboard');
    }
  };

  const handleOpenPrint = (fiche: FicheDemande) => {
    setPrintFicheTarget(fiche);
    setActiveTab('print');
  };

  // Compute next ID
  const nextId = `F2026-${String(fiches.length + 195).padStart(3, '0')}`;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'print') setPrintFicheTarget(null);
        }}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onOpenNewFiche={() => setIsNewFicheOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            fiches={fiches}
            onSelectFiche={(f) => setSelectedFiche(f)}
            onPrintFiche={handleOpenPrint}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'reporting' && (
          <ReportingView
            fiches={fiches}
            onSelectFiche={(f) => setSelectedFiche(f)}
          />
        )}

        {activeTab === 'print' && printFicheTarget && (
          <PrintFicheView
            fiche={printFicheTarget}
            onBack={() => {
              setActiveTab('dashboard');
              setPrintFicheTarget(null);
            }}
          />
        )}
      </main>

      {/* Fiche Detail Modal */}
      {selectedFiche && (
        <FicheDetailModal
          fiche={selectedFiche}
          onClose={() => setSelectedFiche(null)}
          onUpdateFiche={handleUpdateFiche}
          onPrintFiche={(f) => {
            setSelectedFiche(null);
            handleOpenPrint(f);
          }}
          currentRole={currentRole}
        />
      )}

      {/* New Fiche Modal */}
      {isNewFicheOpen && (
        <NewFicheModal
          onClose={() => setIsNewFicheOpen(false)}
          onCreateFiche={handleCreateFiche}
          currentRole={currentRole}
          nextId={nextId}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong className="text-slate-700">Portail Prestations Spécifiques SEI / Enedis</strong> · Digitalisation des processus de gouvernance SI conventionnelle
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Réinitialiser les fiches d'exemple d'origine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser démo</span>
            </button>
            <span className="text-slate-300">|</span>
            <span>Version conforme aux spécifications F2026-183</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
