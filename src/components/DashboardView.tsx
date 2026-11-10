import React, { useState, useMemo } from 'react';
import { FicheDemande, FicheStatus, UserRole } from '../types';
import { STATUS_MAP, computeFicheTotals, formatEuro, formatDateFr, exportFichesToCSV } from '../utils/statusUtils';
import {
  Search,
  Filter,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Printer,
  FileCheck2,
  FolderKanban,
  Layers,
  Euro,
  ArrowUpDown,
} from 'lucide-react';

interface DashboardViewProps {
  fiches: FicheDemande[];
  onSelectFiche: (fiche: FicheDemande) => void;
  onPrintFiche: (fiche: FicheDemande) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  fiches,
  onSelectFiche,
  onPrintFiche,
  currentRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDomaine, setSelectedDomaine] = useState<string>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'id' | 'dateSoumission' | 'budget'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Compute domains and directions for filter dropdowns
  const domaines = useMemo(() => {
    const set = new Set<string>();
    fiches.forEach((f) => {
      if (f.besoinSEI.domaineFonctionnel) set.add(f.besoinSEI.domaineFonctionnel);
      if (f.besoinSEI.applicationCible) set.add(f.besoinSEI.applicationCible);
    });
    return Array.from(set);
  }, [fiches]);

  const directions = useMemo(() => {
    const set = new Set<string>();
    fiches.forEach((f) => {
      if (f.besoinSEI.demandeurDirection) set.add(f.besoinSEI.demandeurDirection);
    });
    return Array.from(set);
  }, [fiches]);

  // Overall summary metrics
  const metrics = useMemo(() => {
    let totalBudgetValide = 0;
    let totalBudgetEnArbitrage = 0;
    let pendingValidationCount = 0;
    let pendingInstructionCount = 0;

    fiches.forEach((f) => {
      const totals = computeFicheTotals(f);
      if (f.statut === 'VALIDE') {
        totalBudgetValide += totals.totalNonCharge;
      }
      if (f.statut === 'EN_ATTENTE_VALIDATION') {
        totalBudgetEnArbitrage += totals.totalNonCharge;
        pendingValidationCount++;
      }
      if (f.statut === 'EN_ATTENTE_INSTRUCTION' || f.statut === 'EN_COURS_ANALYSE') {
        pendingInstructionCount++;
      }
    });

    return {
      totalBudgetValide,
      totalBudgetEnArbitrage,
      pendingValidationCount,
      pendingInstructionCount,
      totalFiches: fiches.length,
    };
  }, [fiches]);

  // Filtered and sorted fiches
  const filteredFiches = useMemo(() => {
    return fiches
      .filter((f) => {
        // Search filter
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          f.id.toLowerCase().includes(q) ||
          f.besoinSEI.intituleBesoin.toLowerCase().includes(q) ||
          f.besoinSEI.demandeurNom.toLowerCase().includes(q) ||
          f.besoinSEI.demandeurPrenom.toLowerCase().includes(q) ||
          f.besoinSEI.demandeurDirection.toLowerCase().includes(q) ||
          f.besoinSEI.applicationCible.toLowerCase().includes(q) ||
          f.besoinSEI.domaineFonctionnel.toLowerCase().includes(q);

        // Status filter
        const matchesStatus =
          selectedStatus === 'ALL' || f.statut === selectedStatus;

        // Domain filter
        const matchesDomaine =
          selectedDomaine === 'ALL' ||
          f.besoinSEI.domaineFonctionnel === selectedDomaine ||
          f.besoinSEI.applicationCible === selectedDomaine;

        // Direction filter
        const matchesDirection =
          selectedDirection === 'ALL' ||
          f.besoinSEI.demandeurDirection === selectedDirection;

        return matchesSearch && matchesStatus && matchesDomaine && matchesDirection;
      })
      .sort((a, b) => {
        if (sortField === 'id') {
          return sortAsc
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id);
        }
        if (sortField === 'dateSoumission') {
          return sortAsc
            ? a.dateSoumission.localeCompare(b.dateSoumission)
            : b.dateSoumission.localeCompare(a.dateSoumission);
        }
        if (sortField === 'budget') {
          const budgetA = computeFicheTotals(a).totalNonCharge;
          const budgetB = computeFicheTotals(b).totalNonCharge;
          return sortAsc ? budgetA - budgetB : budgetB - budgetA;
        }
        return 0;
      });
  }, [fiches, searchTerm, selectedStatus, selectedDomaine, selectedDirection, sortField, sortAsc]);

  const toggleSort = (field: 'id' | 'dateSoumission' | 'budget') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Context / Role notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Synthèse des Fiches de Prestation Spécifique
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Portefeuille unifié des expressions de besoins EDF-SEI instruites par Enedis DSI · Convention 2024-2028
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportFichesToCSV(fiches)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Exporter l'ensemble des demandes au format CSV compatible Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total des Demandes</span>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.totalFiches}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Enregistrées dans le référentiel central
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">À Arbitrer par le Client</span>
            <AlertTriangle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
            {metrics.pendingValidationCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatEuro(metrics.totalBudgetEnArbitrage)} HT soumis à décision
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">En Cadrage Enedis</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {metrics.pendingInstructionCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            En cours d'étude de faisabilité
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Budget Validé (Non Chargé)</span>
            <Euro className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatEuro(metrics.totalBudgetValide)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Engagements approuvés
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par référence (ex: F2026-183), titre, demandeur, application..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({fiches.length})
            </button>
            <button
              onClick={() => setSelectedStatus('EN_ATTENTE_VALIDATION')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatus === 'EN_ATTENTE_VALIDATION'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              À valider SEI ({metrics.pendingValidationCount})
            </button>
            <button
              onClick={() => setSelectedStatus('EN_COURS_ANALYSE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatus === 'EN_COURS_ANALYSE'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              En instruction ({fiches.filter((f) => f.statut === 'EN_COURS_ANALYSE').length})
            </button>
            <button
              onClick={() => setSelectedStatus('VALIDE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatus === 'VALIDE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Validés ({fiches.filter((f) => f.statut === 'VALIDE').length})
            </button>
          </div>
        </div>

        {/* Secondary dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-500">Filtrer par :</span>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-status" className="text-slate-500">Statut :</label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="ALL">Tous les statuts</option>
              {Object.entries(STATUS_MAP).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-domain" className="text-slate-500">Domaine / Appli :</label>
            <select
              id="filter-domain"
              value={selectedDomaine}
              onChange={(e) => setSelectedDomaine(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-800 focus:outline-none focus:border-blue-500 text-xs max-w-[200px] truncate"
            >
              <option value="ALL">Tous les domaines</option>
              {domaines.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-direction" className="text-slate-500">Direction :</label>
            <select
              id="filter-direction"
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-800 focus:outline-none focus:border-blue-500 text-xs max-w-[220px] truncate"
            >
              <option value="ALL">Toutes les directions</option>
              {directions.map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
          </div>

          {(selectedStatus !== 'ALL' || selectedDomaine !== 'ALL' || selectedDirection !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedDomaine('ALL');
                setSelectedDirection('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium ml-auto cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Réf. / ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('dateSoumission')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Demandeur / Entité</th>
                <th className="py-3 px-4">Intitulé du Besoin & Périmètre</th>
                <th className="py-3 px-3">Application / Domaine</th>
                <th
                  onClick={() => toggleSort('budget')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Budget Chiffré</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Échéance</th>
                <th className="py-3 px-4">Statut Actuel</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFiches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="font-medium text-sm">Aucune fiche de demande ne correspond à vos critères.</p>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou lancez une nouvelle recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredFiches.map((fiche) => {
                  const totals = computeFicheTotals(fiche);
                  const statusConf = STATUS_MAP[fiche.statut];
                  const isFlagship = fiche.id === 'F2026-183';

                  return (
                    <tr
                      key={fiche.id}
                      onClick={() => onSelectFiche(fiche)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        isFlagship ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* ID / Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{fiche.id}</span>
                          {isFlagship && (
                            <span className="text-[10px] font-sans font-semibold px-1 py-0.2 bg-blue-100 text-blue-800 rounded">
                              Exemple Type
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date Soumission */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {formatDateFr(fiche.dateSoumission)}
                      </td>

                      {/* Demandeur / Entité */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {fiche.besoinSEI.demandeurPrenom} {fiche.besoinSEI.demandeurNom}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {fiche.besoinSEI.demandeurDirection}
                        </div>
                      </td>

                      {/* Intitulé du Besoin */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 line-clamp-2 leading-snug">
                          {fiche.besoinSEI.intituleBesoin}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Criticité : <strong className={`font-semibold ${
                            fiche.besoinSEI.criticiteTemps === 'Critique' ? 'text-rose-600' :
                            fiche.besoinSEI.criticiteTemps === 'Haute' ? 'text-amber-600' : 'text-slate-600'
                          }`}>{fiche.besoinSEI.criticiteTemps}</strong></span>
                          <span>·</span>
                          <span>{fiche.besoinSEI.attachments?.length || 0} annexe(s)</span>
                        </div>
                      </td>

                      {/* Application / Domaine */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {fiche.besoinSEI.applicationCible}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {fiche.besoinSEI.domaineFonctionnel}
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {totals.totalNonCharge > 0 ? (
                          <div>
                            <div className="font-mono font-semibold text-slate-900 tabular-nums">
                              {formatEuro(totals.totalNonCharge)} <span className="text-[10px] font-normal text-slate-500">HT</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                              CAPEX: {formatEuro(totals.capexNonCharge)} · OPEX: {formatEuro(totals.opexNonCharge)}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Chargé: {formatEuro(totals.totalCharge)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">En chiffrage</span>
                        )}
                      </td>

                      {/* Échéance */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {fiche.besoinSEI.jalonSouhaite || '—'}
                        </span>
                      </td>

                      {/* Statut Actuel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConf.badgeBg} ${statusConf.badgeText} ${statusConf.badgeBorder}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectFiche(fiche)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Consulter et instruire la fiche"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintFiche(fiche)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Format officiel Word / PDF imprimable"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Affichage de <strong>{filteredFiches.length}</strong> fiche(s) sur {fiches.length} au total
          </span>
          <span className="text-slate-400">
            Conforme au modèle type Enedis / SEI F2026-183 (Gestion HTB dans SIG)
          </span>
        </div>
      </div>
    </div>
  );
};
