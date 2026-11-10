export type FicheStatus =
  | 'REDACTION'               // En cours de rédaction
  | 'EN_ATTENTE_INSTRUCTION' // Soumis, en attente de prise en charge Enedis
  | 'EN_COURS_ANALYSE'       // En cours d'analyse / chiffrage Enedis
  | 'EN_ATTENTE_VALIDATION'  // Chiffré par Enedis, en attente d'arbitrage client SEI
  | 'MODIFICATIONS_DEMANDEES'// Renvoyé en correction à Enedis
  | 'VALIDE'                 // Validé / Approuvé formellement
  | 'REFUSE';                // Refusé / Annulé

export type UserRole =
  | 'DEMANDEUR_SEI'    // Willy TAMBOURAN - SEI Délégation Réseau & Patrimoine
  | 'INSTRUCTEUR_ENEDIS' // Sylvain DUBOIS - Chef de Projet Enedis DSI
  | 'VALIDEUR_SEI'     // Marc LEFEBVRE - Directeur SEI / Décideur Budgétaire
  | 'PMO_OBSERVATEUR'; // Coordination transverse

export type BudgetType = 'CAPEX' | 'OPEX';

export interface PrestationLine {
  id: string;
  poste: string;               // Ex: Développements spécifiques SIG & extension du MDD
  description: string;
  joursHomme: number;          // Nombre de j.h
  tauxJournalier: number;      // Taux moyen HT
  montantHT: number;           // Total HT non chargé (joursHomme * tauxJournalier ou forfait)
  budgetType: BudgetType;      // CAPEX ou OPEX
  codeEOTP: string;            // Ex: I-2026-SEI-SIG-01
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  date: string;
  author: string;
  role: string;
  action: string;
  comment?: string;
  oldStatus?: FicheStatus;
  newStatus?: FicheStatus;
}

export interface GovernanceInfo {
  piloteEnedis: string;
  piloteEnedisEmail: string;
  piloteSEI: string;
  piloteSEIEmail: string;
  signataireEnedis: string;
  signataireSEI: string;
  conventionCadre: string;
  periodeValiditeChiffrage: string;
}

export interface ExpressionBesoinSEI {
  demandeurNom: string;
  demandeurPrenom: string;
  demandeurDirection: string;  // Ex: Délégation Réseau et Patrimoine / SEI
  demandeurTelephone: string;
  demandeurEmail: string;
  filiereMetier: string;       // Ex: Exploitation & Ingénierie Réseaux
  domaineFonctionnel: string;  // Ex: Patrimoine, Cartographie, Téléconduite
  applicationCible: string;    // Ex: SIG, GMAO, GDO
  intituleBesoin: string;      // Ex: Implémentation de la gestion de la HTB dans le SIG
  contexteDescription: string; // Description détaillée
  
  // Qualification
  criticiteTemps: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  justificationCriticite: string; // Échéance réglementaire / Situation de crise / Référentiel
  risquesNonFaire: string;        // Rupture de service, risque réglementaire, perte d'information
  prescrits: string;              // Règlementaires, métier, sûreté/sécurité
  apportsAttendus: string;        // Centralisation, réduction erreurs, collaboration
  specificitesSEI: string;        // Particularités insulaires, HTB sous gestion SEI, fuseaux horaires
  jalonSouhaite: string;          // Ex: T3-2027
  dateCibleMiseEnService: string; // Ex: 2027-09-30
  
  attachments: Attachment[];
}

export interface InstructionEnedis {
  instructeurNom: string;
  instructeurEmail: string;
  contraintesTechniques: string; // Lotissement, dépendances SI
  dependancesSI: string;         // Ex: Montée de version MDD SIG v14.2 requise
  impactArchitecture: string;
  tauxChargesEnvironnement: number; // Ex: 0.25 (25%)
  lignesPrestation: PrestationLine[];
  dateRetourInstruction?: string;
  observationsTechniques?: string;
}

export interface FicheDemande {
  id: string;                    // Ex: F2026-183
  dateSoumission: string;        // Ex: 2026-03-12
  dateDerniereModification: string;
  statut: FicheStatus;
  
  gouvernance: GovernanceInfo;
  besoinSEI: ExpressionBesoinSEI;
  instructionEnedis: InstructionEnedis;
  
  historiqueAudit: AuditLogEntry[];
}
