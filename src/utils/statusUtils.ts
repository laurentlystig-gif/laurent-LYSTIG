import { FicheDemande, FicheStatus, UserRole } from '../types';

export interface StatusConfig {
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const STATUS_MAP: Record<FicheStatus, StatusConfig> = {
  REDACTION: {
    label: 'En cours de rédaction',
    shortLabel: 'Rédaction',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    description: 'La fiche est en cours d\'élaboration par le demandeur EDF-SEI.',
  },
  EN_ATTENTE_INSTRUCTION: {
    label: 'En attente d\'instruction',
    shortLabel: 'À instruire',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'La fiche a été transmise à Enedis pour cadrage technique et chiffrage.',
  },
  EN_COURS_ANALYSE: {
    label: 'En cours d\'analyse / chiffrage',
    shortLabel: 'Instruction',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    description: 'Les experts Enedis étudient les impacts SI et élaborent le chiffrage.',
  },
  EN_ATTENTE_VALIDATION: {
    label: 'En attente de validation client',
    shortLabel: 'À valider SEI',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    description: 'Le chiffrage technique est soumis à l\'arbitrage du client EDF-SEI.',
  },
  MODIFICATIONS_DEMANDEES: {
    label: 'Modifications demandées',
    shortLabel: 'À corriger',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    description: 'Le client EDF-SEI a demandé un réajustement de chiffrage ou de périmètre.',
  },
  VALIDE: {
    label: 'Validé / Approuvé',
    shortLabel: 'Validé',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'La prestation spécifique est formellement approuvée et engagée.',
  },
  REFUSE: {
    label: 'Refusé / Annulé',
    shortLabel: 'Refusé',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    description: 'La fiche est rejetée avec motif ou annulée.',
  },
};

export function computeFicheTotals(fiche: FicheDemande) {
  const lignes = fiche.instructionEnedis.lignesPrestation || [];
  const tauxCharges = fiche.instructionEnedis.tauxChargesEnvironnement ?? 0.25;

  let totalNonCharge = 0;
  let capexNonCharge = 0;
  let opexNonCharge = 0;
  let totalJoursHomme = 0;

  for (const l of lignes) {
    const montant = l.montantHT || (l.joursHomme * l.tauxJournalier) || 0;
    totalNonCharge += montant;
    totalJoursHomme += l.joursHomme || 0;
    if (l.budgetType === 'CAPEX') {
      capexNonCharge += montant;
    } else {
      opexNonCharge += montant;
    }
  }

  const multiplier = 1 + tauxCharges;
  const totalCharge = totalNonCharge * multiplier;
  const capexCharge = capexNonCharge * multiplier;
  const opexCharge = opexNonCharge * multiplier;

  return {
    totalNonCharge,
    totalCharge,
    capexNonCharge,
    opexNonCharge,
    capexCharge,
    opexCharge,
    totalJoursHomme,
    tauxCharges,
  };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateFr(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
}

export const USER_ROLES_INFO: Record<UserRole, { title: string; subtitle: string; entity: 'SEI' | 'ENEDIS' | 'ALL' }> = {
  DEMANDEUR_SEI: {
    title: 'Willy TAMBOURAN',
    subtitle: 'Demandeur Métier · Délégation Réseau & Patrimoine (EDF-SEI)',
    entity: 'SEI',
  },
  INSTRUCTEUR_ENEDIS: {
    title: 'Sylvain DUBOIS',
    subtitle: 'Instructeur & Chef de Projet SI (Enedis DSI)',
    entity: 'ENEDIS',
  },
  VALIDEUR_SEI: {
    title: 'Marc LEFEBVRE',
    subtitle: 'Valideur Budgétaire & Arbitrage (Directeur EDF-SEI)',
    entity: 'SEI',
  },
  PMO_OBSERVATEUR: {
    title: 'Cellule PMO & Pilotage',
    subtitle: 'Coordination Transverse & Traçabilité (EDF-SEI / Enedis)',
    entity: 'ALL',
  },
};

export function exportFichesToCSV(fiches: FicheDemande[]) {
  const headers = [
    'Reference',
    'Date Soumission',
    'Statut',
    'Demandeur',
    'Direction SEI',
    'Domaine Fonctionnel',
    'Application Cible',
    'Intitule du Besoin',
    'Criticite',
    'Jalon Cible',
    'Budget Non Charge (EUR)',
    'Budget Charge (EUR)',
    'CAPEX Charge (EUR)',
    'OPEX Charge (EUR)',
    'Pilote Enedis',
    'Pilote SEI',
  ];

  const rows = fiches.map((f) => {
    const totals = computeFicheTotals(f);
    return [
      `"${f.id}"`,
      `"${f.dateSoumission}"`,
      `"${STATUS_MAP[f.statut]?.label || f.statut}"`,
      `"${f.besoinSEI.demandeurPrenom} ${f.besoinSEI.demandeurNom}"`,
      `"${f.besoinSEI.demandeurDirection}"`,
      `"${f.besoinSEI.domaineFonctionnel}"`,
      `"${f.besoinSEI.applicationCible}"`,
      `"${f.besoinSEI.intituleBesoin.replace(/"/g, '""')}"`,
      `"${f.besoinSEI.criticiteTemps}"`,
      `"${f.besoinSEI.jalonSouhaite}"`,
      totals.totalNonCharge.toFixed(2),
      totals.totalCharge.toFixed(2),
      totals.capexCharge.toFixed(2),
      totals.opexCharge.toFixed(2),
      `"${f.gouvernance.piloteEnedis}"`,
      `"${f.gouvernance.piloteSEI}"`,
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Synthese_Prestations_SEI_Enedis_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
