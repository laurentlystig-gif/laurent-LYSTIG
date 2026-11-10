import React, { useState } from 'react';
import { FicheDemande, FicheStatus, PrestationLine, UserRole, Attachment } from '../types';
import { STATUS_MAP, computeFicheTotals, formatEuro, formatDateFr, USER_ROLES_INFO } from '../utils/statusUtils';
import { WorkflowStepper } from './WorkflowStepper';
import {
  X,
  FileText,
  User,
  Building,
  Euro,
  History,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  Plus,
  Trash2,
  Paperclip,
  Download,
  Calendar,
  ShieldAlert,
  Sparkles,
  Printer,
  Edit3,
  Save,
  MessageSquare,
} from 'lucide-react';

interface FicheDetailModalProps {
  fiche: FicheDemande;
  onClose: () => void;
  onUpdateFiche: (updatedFiche: FicheDemande) => void;
  onPrintFiche: (fiche: FicheDemande) => void;
  currentRole: UserRole;
}

export const FicheDetailModal: React.FC<FicheDetailModalProps> = ({
  fiche,
  onClose,
  onUpdateFiche,
  onPrintFiche,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [isEditing, setIsEditing] = useState(false);
  const [editedFiche, setEditedFiche] = useState<FicheDemande>(JSON.parse(JSON.stringify(fiche)));
  const [decisionComment, setDecisionComment] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState<'APPROVE' | 'MODIFY' | 'REJECT' | 'SUBMIT_INSTRUCTION' | 'SUBMIT_CLIENT' | null>(null);

  // New attachment state
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState('PDF');
  const [newAttachmentSize, setNewAttachmentSize] = useState('1.2 Mo');
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  const totals = computeFicheTotals(editedFiche);
  const statusConf = STATUS_MAP[editedFiche.statut];
  const userRoleMeta = USER_ROLES_INFO[currentRole];

  // Financial row operations
  const handleAddPrestationLine = () => {
    const newLine: PrestationLine = {
      id: `lig-${Date.now()}`,
      poste: 'Nouvelle prestation technique',
      description: 'Préciser le périmètre de la prestation',
      joursHomme: 10,
      tauxJournalier: 700,
      montantHT: 7000,
      budgetType: 'CAPEX',
      codeEOTP: 'I-2026-SEI-NEW',
    };
    setEditedFiche({
      ...editedFiche,
      instructionEnedis: {
        ...editedFiche.instructionEnedis,
        lignesPrestation: [...editedFiche.instructionEnedis.lignesPrestation, newLine],
      },
    });
  };

  const handleRemovePrestationLine = (id: string) => {
    setEditedFiche({
      ...editedFiche,
      instructionEnedis: {
        ...editedFiche.instructionEnedis,
        lignesPrestation: editedFiche.instructionEnedis.lignesPrestation.filter((l) => l.id !== id),
      },
    });
  };

  const handleUpdateLine = (id: string, field: keyof PrestationLine, value: any) => {
    const updated = editedFiche.instructionEnedis.lignesPrestation.map((l) => {
      if (l.id === id) {
        const item = { ...l, [field]: value };
        if (field === 'joursHomme' || field === 'tauxJournalier') {
          item.montantHT = (item.joursHomme || 0) * (item.tauxJournalier || 0);
        }
        return item;
      }
      return l;
    });
    setEditedFiche({
      ...editedFiche,
      instructionEnedis: {
        ...editedFiche.instructionEnedis,
        lignesPrestation: updated,
      },
    });
  };

  // Attachments
  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName) return;
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: newAttachmentName.endsWith(`.${newAttachmentType.toLowerCase()}`)
        ? newAttachmentName
        : `${newAttachmentName}.${newAttachmentType.toLowerCase()}`,
      size: newAttachmentSize || '1.0 Mo',
      type: newAttachmentType,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: userRoleMeta.title,
    };
    setEditedFiche({
      ...editedFiche,
      besoinSEI: {
        ...editedFiche.besoinSEI,
        attachments: [...(editedFiche.besoinSEI.attachments || []), newAtt],
      },
    });
    setNewAttachmentName('');
    setShowAddAttachment(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setEditedFiche({
      ...editedFiche,
      besoinSEI: {
        ...editedFiche.besoinSEI,
        attachments: (editedFiche.besoinSEI.attachments || []).filter((a) => a.id !== id),
      },
    });
  };

  // Workflow transitions
  const executeWorkflowAction = (actionType: 'APPROVE' | 'MODIFY' | 'REJECT' | 'SUBMIT_INSTRUCTION' | 'SUBMIT_CLIENT') => {
    let newStatus: FicheStatus = editedFiche.statut;
    let actionLabel = '';

    if (actionType === 'APPROVE') {
      newStatus = 'VALIDE';
      actionLabel = 'Approbation formelle de la fiche de prestation spécifique';
    } else if (actionType === 'MODIFY') {
      newStatus = 'MODIFICATIONS_DEMANDEES';
      actionLabel = 'Demande de modifications et révision de chiffrage';
    } else if (actionType === 'REJECT') {
      newStatus = 'REFUSE';
      actionLabel = 'Refus et clôture sans suite';
    } else if (actionType === 'SUBMIT_INSTRUCTION') {
      newStatus = 'EN_ATTENTE_INSTRUCTION';
      actionLabel = 'Transmission pour cadrage et chiffrage Enedis DSI';
    } else if (actionType === 'SUBMIT_CLIENT') {
      newStatus = 'EN_ATTENTE_VALIDATION';
      actionLabel = 'Transmission du chiffrage détaillé pour arbitrage client SEI';
    }

    const newLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      author: userRoleMeta.title,
      role: userRoleMeta.subtitle,
      action: actionLabel,
      comment: decisionComment || 'Opération enregistrée dans le cadre du workflow officiel.',
      oldStatus: editedFiche.statut,
      newStatus,
    };

    const finalFiche: FicheDemande = {
      ...editedFiche,
      statut: newStatus,
      dateDerniereModification: new Date().toISOString().slice(0, 10),
      historiqueAudit: [newLog, ...editedFiche.historiqueAudit],
    };

    setEditedFiche(finalFiche);
    onUpdateFiche(finalFiche);
    setShowDecisionModal(null);
    setDecisionComment('');
  };

  const handleSaveChanges = () => {
    const newLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      author: userRoleMeta.title,
      role: userRoleMeta.subtitle,
      action: 'Mise à jour des informations de la fiche',
      comment: 'Modification des données et enregistrement.',
    };
    const finalFiche: FicheDemande = {
      ...editedFiche,
      dateDerniereModification: new Date().toISOString().slice(0, 10),
      historiqueAudit: [newLog, ...editedFiche.historiqueAudit],
    };
    onUpdateFiche(finalFiche);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-md">
              {editedFiche.id}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {editedFiche.besoinSEI.intituleBesoin}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Soumis le {formatDateFr(editedFiche.dateSoumission)} · Application : <strong>{editedFiche.besoinSEI.applicationCible}</strong> · Direction : <strong>{editedFiche.besoinSEI.demandeurDirection}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConf.badgeBg} ${statusConf.badgeText} ${statusConf.badgeBorder}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              <span>{statusConf.label}</span>
            </span>

            <button
              onClick={() => onPrintFiche(editedFiche)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Aperçu format officiel Word / PDF"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Imprimer / PDF</span>
            </button>

            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50">
          <WorkflowStepper status={editedFiche.statut} />
        </div>

        {/* Role Action Bar (Contextual workflow decisions) */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-semibold text-blue-900">Décision & Workflow :</span>
            <span className="text-slate-600">
              Rôle actif : <strong className="text-slate-900">{userRoleMeta.title}</strong> ({userRoleMeta.subtitle})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* If Client SEI can arbitrate */}
            {editedFiche.statut === 'EN_ATTENTE_VALIDATION' && (
              <>
                <button
                  onClick={() => setShowDecisionModal('APPROVE')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approuver la fiche</span>
                </button>
                <button
                  onClick={() => setShowDecisionModal('MODIFY')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Demander des modifications</span>
                </button>
                <button
                  onClick={() => setShowDecisionModal('REJECT')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Refuser la fiche</span>
                </button>
              </>
            )}

            {/* If Draft, allow Demandeur to submit to Enedis */}
            {editedFiche.statut === 'REDACTION' && (
              <button
                onClick={() => setShowDecisionModal('SUBMIT_INSTRUCTION')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Transmettre à Enedis pour instruction</span>
              </button>
            )}

            {/* If in instruction / modifications, allow Enedis to submit to Client */}
            {(editedFiche.statut === 'EN_ATTENTE_INSTRUCTION' ||
              editedFiche.statut === 'EN_COURS_ANALYSE' ||
              editedFiche.statut === 'MODIFICATIONS_DEMANDEES') && (
              <button
                onClick={() => setShowDecisionModal('SUBMIT_CLIENT')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Soumettre le chiffrage pour arbitrage client SEI</span>
              </button>
            )}

            {editedFiche.statut === 'VALIDE' && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Prestation contractualisée
              </span>
            )}

            {editedFiche.statut === 'REFUSE' && (
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Demande clôturée
              </span>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('A')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'A'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>A. En-tête & Gouvernance</span>
          </button>

          <button
            onClick={() => setActiveTab('B')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'B'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>B. Expression du Besoin (EDF-SEI)</span>
          </button>

          <button
            onClick={() => setActiveTab('C')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'C'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Euro className="w-4 h-4" />
            <span>C. Chiffrage & Instruction (Enedis)</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
              {formatEuro(totals.totalNonCharge)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('D')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'D'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>D. Traçabilité & Historique d'Audit ({editedFiche.historiqueAudit.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">

          {/* TAB A: En-tête & Gouvernance */}
          {activeTab === 'A' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  1. Informations de Traçabilité & Convention Cadre
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium block">Référence Demande</label>
                    <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">{editedFiche.id}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Date de Soumission Initiale</label>
                    <div className="text-slate-800 font-medium mt-0.5">{formatDateFr(editedFiche.dateSoumission)}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Dernière Mise à Jour</label>
                    <div className="text-slate-800 font-medium mt-0.5">{formatDateFr(editedFiche.dateDerniereModification)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-500 font-medium block">Convention Cadre de Rattachement</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedFiche.gouvernance.conventionCadre}
                        onChange={(e) =>
                          setEditedFiche({
                            ...editedFiche,
                            gouvernance: { ...editedFiche.gouvernance, conventionCadre: e.target.value },
                          })
                        }
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 mt-1"
                      />
                    ) : (
                      <div className="text-slate-800 font-medium mt-0.5">{editedFiche.gouvernance.conventionCadre}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Période de Validité du Chiffrage</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedFiche.gouvernance.periodeValiditeChiffrage}
                        onChange={(e) =>
                          setEditedFiche({
                            ...editedFiche,
                            gouvernance: { ...editedFiche.gouvernance, periodeValiditeChiffrage: e.target.value },
                          })
                        }
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 mt-1"
                      />
                    ) : (
                      <div className="text-slate-800 font-mono font-medium mt-0.5">{editedFiche.gouvernance.periodeValiditeChiffrage}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  2. Comité de Suivi & Acteurs Clés du Projet
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Côté Enedis */}
                  <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-blue-900 text-xs uppercase tracking-wider">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>Équipe Instructrice & Référente (Enedis)</span>
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block">Pilote Opérationnel Enedis</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedFiche.gouvernance.piloteEnedis}
                          onChange={(e) =>
                            setEditedFiche({
                              ...editedFiche,
                              gouvernance: { ...editedFiche.gouvernance, piloteEnedis: e.target.value },
                            })
                          }
                          className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 mt-1"
                        />
                      ) : (
                        <div className="text-slate-900 font-semibold mt-0.5">{editedFiche.gouvernance.piloteEnedis}</div>
                      )}
                      <div className="text-slate-500 text-[11px]">{editedFiche.gouvernance.piloteEnedisEmail}</div>
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block">Signataire Convention Enedis</label>
                      <div className="text-slate-800 font-medium mt-0.5">{editedFiche.gouvernance.signataireEnedis}</div>
                    </div>
                  </div>

                  {/* Côté SEI */}
                  <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs uppercase tracking-wider">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <span>Équipe Demanderesse & Maîtrise d'Ouvrage (EDF-SEI)</span>
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block">Pilote Opérationnel SEI</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedFiche.gouvernance.piloteSEI}
                          onChange={(e) =>
                            setEditedFiche({
                              ...editedFiche,
                              gouvernance: { ...editedFiche.gouvernance, piloteSEI: e.target.value },
                            })
                          }
                          className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 mt-1"
                        />
                      ) : (
                        <div className="text-slate-900 font-semibold mt-0.5">{editedFiche.gouvernance.piloteSEI}</div>
                      )}
                      <div className="text-slate-500 text-[11px]">{editedFiche.gouvernance.piloteSEIEmail}</div>
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block">Signataire Convention SEI</label>
                      <div className="text-slate-800 font-medium mt-0.5">{editedFiche.gouvernance.signataireSEI}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB B: Expression du Besoin (EDF-SEI) */}
          {activeTab === 'B' && (
            <div className="space-y-6">
              {/* Demandeur info card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">
                  1. Identification du Demandeur & Domaine Applicatif
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium block">Demandeur</label>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {editedFiche.besoinSEI.demandeurPrenom} {editedFiche.besoinSEI.demandeurNom}
                    </div>
                    <div className="text-slate-500 text-[11px]">{editedFiche.besoinSEI.demandeurEmail}</div>
                    <div className="text-slate-500 text-[11px]">{editedFiche.besoinSEI.demandeurTelephone}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Direction & Délégation</label>
                    <div className="font-medium text-slate-900 mt-0.5">{editedFiche.besoinSEI.demandeurDirection}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Domaine Fonctionnel</label>
                    <div className="font-medium text-slate-900 mt-0.5">{editedFiche.besoinSEI.domaineFonctionnel}</div>
                    <div className="text-slate-500 text-[11px]">Filière : {editedFiche.besoinSEI.filiereMetier}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Application Cible</label>
                    <div className="font-bold text-blue-700 mt-0.5">{editedFiche.besoinSEI.applicationCible}</div>
                    <div className="text-slate-500 text-[11px]">Jalon souhaité : <strong className="text-slate-800">{editedFiche.besoinSEI.jalonSouhaite}</strong></div>
                  </div>
                </div>
              </div>

              {/* Contexte & Description détaillée */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Contexte & Description Fonctionnelle du Besoin
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Modèle de référence : Gestion HTB dans SIG (F2026-183)
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    rows={8}
                    value={editedFiche.besoinSEI.contexteDescription}
                    onChange={(e) =>
                      setEditedFiche({
                        ...editedFiche,
                        besoinSEI: { ...editedFiche.besoinSEI, contexteDescription: e.target.value },
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-900 leading-relaxed font-sans"
                  />
                ) : (
                  <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    {editedFiche.besoinSEI.contexteDescription}
                  </div>
                )}
              </div>

              {/* Qualification du besoin */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  3. Qualification du Besoin & Justifications Métier
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Criticité */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">Criticité dans le temps</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        editedFiche.besoinSEI.criticiteTemps === 'Critique' ? 'bg-rose-100 text-rose-800' :
                        editedFiche.besoinSEI.criticiteTemps === 'Haute' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {editedFiche.besoinSEI.criticiteTemps}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {editedFiche.besoinSEI.justificationCriticite}
                    </p>
                  </div>

                  {/* Risques à ne pas faire */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40">
                    <div className="flex items-center gap-1.5 font-semibold text-rose-900 mb-1">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Risques à ne pas faire</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {editedFiche.besoinSEI.risquesNonFaire}
                    </p>
                  </div>

                  {/* Prescrits */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40">
                    <div className="font-semibold text-slate-900 mb-1">Prescrits (Réglementaires / Métier / Sûreté)</div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {editedFiche.besoinSEI.prescrits}
                    </p>
                  </div>

                  {/* Apports attendus */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40">
                    <div className="font-semibold text-slate-900 mb-1">Apports attendus & Valeur Métier</div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {editedFiche.besoinSEI.apportsAttendus}
                    </p>
                  </div>

                  {/* Spécificités SEI */}
                  <div className="md:col-span-2 p-3.5 rounded-lg border border-blue-200 bg-blue-50/30">
                    <div className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>Spécificités SEI (Systèmes Énergétiques Insulaires)</span>
                    </div>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      {editedFiche.besoinSEI.specificitesSEI}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pièces jointes & Annexes */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      4. Pièces Jointes & Documents Complémentaires ({editedFiche.besoinSEI.attachments?.length || 0})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddAttachment(!showAddAttachment)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une annexe</span>
                  </button>
                </div>

                {showAddAttachment && (
                  <form onSubmit={handleAddAttachment} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Nom du fichier (ex: Matrice_Regles_GDO.xlsx)"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 flex-1 min-w-[200px]"
                      required
                    />
                    <select
                      value={newAttachmentType}
                      onChange={(e) => setNewAttachmentType(e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-900"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLSX">XLSX</option>
                      <option value="PPTX">PPTX</option>
                      <option value="ZIP">ZIP</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Taille (ex: 1.5 Mo)"
                      value={newAttachmentSize}
                      onChange={(e) => setNewAttachmentSize(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 w-24"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 cursor-pointer"
                    >
                      Attacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAttachment(false)}
                      className="px-2 py-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Annuler
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {editedFiche.besoinSEI.attachments?.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                          {att.type}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate" title={att.name}>
                            {att.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {att.size} · Ajouté le {formatDateFr(att.uploadedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => alert(`Téléchargement simulé de la pièce jointe : ${att.name}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Télécharger l'annexe"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Supprimer l'annexe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB C: Instruction & Chiffrage (Enedis) */}
          {activeTab === 'C' && (
            <div className="space-y-6">
              {/* Technical constraints */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  1. Cadrage Technique, Dépendances & Architecture SI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium block">Instructeur Enedis DSI</label>
                    <div className="font-semibold text-slate-900 mt-0.5">{editedFiche.instructionEnedis.instructeurNom || 'Sylvain DUBOIS'}</div>
                    <div className="text-slate-500 text-[11px]">{editedFiche.instructionEnedis.instructeurEmail || 'sylvain.dubois@enedis.fr'}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Dépendances SI & Prérequis</label>
                    <div className="text-slate-800 font-medium mt-0.5">{editedFiche.instructionEnedis.dependancesSI || 'Aucune dépendance bloquante'}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block">Taux de Charges d'Environnement</label>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {((editedFiche.instructionEnedis.tauxChargesEnvironnement ?? 0.25) * 100).toFixed(0)} %
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-slate-500 font-medium block">Contraintes Techniques & Lotissement de Livraison</label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editedFiche.instructionEnedis.contraintesTechniques}
                        onChange={(e) =>
                          setEditedFiche({
                            ...editedFiche,
                            instructionEnedis: { ...editedFiche.instructionEnedis, contraintesTechniques: e.target.value },
                          })
                        }
                        className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 mt-1"
                      />
                    ) : (
                      <div className="text-slate-800 bg-slate-50/60 p-3 rounded border border-slate-100 mt-1 leading-relaxed">
                        {editedFiche.instructionEnedis.contraintesTechniques || 'Cadrage en attente'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prestation Lines & Financial Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      2. Tableau Financier Détaillé des Prestations
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Découpage par unités d'œuvre (j.h), code EOTP et ventilation comptable CAPEX / OPEX
                    </p>
                  </div>
                  <button
                    onClick={handleAddPrestationLine}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne de prestation</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Poste de Prestation</th>
                        <th className="py-2.5 px-2">Type</th>
                        <th className="py-2.5 px-2">Code EOTP</th>
                        <th className="py-2.5 px-2 text-right">Jours (j.h)</th>
                        <th className="py-2.5 px-3 text-right">Taux Jour (HT)</th>
                        <th className="py-2.5 px-3 text-right">Total HT Non Chargé</th>
                        <th className="py-2.5 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editedFiche.instructionEnedis.lignesPrestation?.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            Aucune ligne de chiffrage enregistrée pour le moment.
                          </td>
                        </tr>
                      ) : (
                        editedFiche.instructionEnedis.lignesPrestation.map((ligne) => (
                          <tr key={ligne.id} className="hover:bg-slate-50/50">
                            {/* Poste */}
                            <td className="py-2.5 px-3 max-w-sm">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={ligne.poste}
                                  onChange={(e) => handleUpdateLine(ligne.id, 'poste', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                />
                              ) : (
                                <div className="font-semibold text-slate-900">{ligne.poste}</div>
                              )}
                              <div className="text-[11px] text-slate-500 mt-0.5">{ligne.description}</div>
                            </td>

                            {/* Type CAPEX/OPEX */}
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={ligne.budgetType}
                                  onChange={(e) => handleUpdateLine(ligne.id, 'budgetType', e.target.value)}
                                  className="border border-slate-300 rounded px-1.5 py-1 text-xs"
                                >
                                  <option value="CAPEX">CAPEX</option>
                                  <option value="OPEX">OPEX</option>
                                </select>
                              ) : (
                                <span className={`font-mono font-semibold text-[10px] px-2 py-0.5 rounded ${
                                  ligne.budgetType === 'CAPEX' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {ligne.budgetType}
                                </span>
                              )}
                            </td>

                            {/* Code EOTP */}
                            <td className="py-2.5 px-2 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={ligne.codeEOTP}
                                  onChange={(e) => handleUpdateLine(ligne.id, 'codeEOTP', e.target.value)}
                                  className="w-28 border border-slate-300 rounded px-1.5 py-1 text-xs"
                                />
                              ) : (
                                ligne.codeEOTP || '—'
                              )}
                            </td>

                            {/* Jours Homme */}
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={ligne.joursHomme}
                                  onChange={(e) => handleUpdateLine(ligne.id, 'joursHomme', parseFloat(e.target.value) || 0)}
                                  className="w-16 border border-slate-300 rounded px-1.5 py-1 text-right text-xs"
                                />
                              ) : (
                                `${ligne.joursHomme} j`
                              )}
                            </td>

                            {/* TJM */}
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={ligne.tauxJournalier}
                                  onChange={(e) => handleUpdateLine(ligne.id, 'tauxJournalier', parseFloat(e.target.value) || 0)}
                                  className="w-20 border border-slate-300 rounded px-1.5 py-1 text-right text-xs"
                                />
                              ) : (
                                `${formatEuro(ligne.tauxJournalier)}/j`
                              )}
                            </td>

                            {/* Montant HT */}
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {formatEuro(ligne.montantHT || ligne.joursHomme * ligne.tauxJournalier)}
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                onClick={() => handleRemovePrestationLine(ligne.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Supprimer la ligne"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-slate-500 font-medium block">Total Jours Homme</span>
                      <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {totals.totalJoursHomme} j.h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Ventilation CAPEX (Non Chargé)</span>
                      <span className="font-mono font-bold text-indigo-700 text-sm tabular-nums">
                        {formatEuro(totals.capexNonCharge)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Ventilation OPEX (Non Chargé)</span>
                      <span className="font-mono font-bold text-slate-700 text-sm tabular-nums">
                        {formatEuro(totals.opexNonCharge)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Taux Charges Enedis</span>
                      <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        +{(totals.tauxCharges * 100).toFixed(0)} %
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="text-slate-500 font-medium">TOTAL HT NON CHARGÉ :</div>
                      <div className="font-mono font-bold text-lg sm:text-xl text-slate-900 tabular-nums">
                        {formatEuro(totals.totalNonCharge)} <span className="text-xs font-normal text-slate-500">HT</span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-blue-900 font-semibold text-xs">TOTAL ESTIMÉ CHARGÉ (FACTURÉ SEI) :</div>
                      <div className="font-mono font-bold text-xl sm:text-2xl text-blue-700 tabular-nums">
                        {formatEuro(totals.totalCharge)} <span className="text-xs font-normal text-slate-500">HT</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        CAPEX chargé : {formatEuro(totals.capexCharge)} · OPEX chargé : {formatEuro(totals.opexCharge)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB D: Traçabilité & Historique d'Audit */}
          {activeTab === 'D' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Journal d'Audit & Historique des Événements
                  </h3>
                  <span className="text-xs text-slate-500">
                    Traçabilité horodatée infalsifiable conforme aux exigences d'audit
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {editedFiche.historiqueAudit.map((log) => (
                    <div key={log.id} className="relative pl-8 text-xs">
                      <span className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="font-mono text-[11px] text-slate-400">{log.date}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Par <strong className="text-slate-800">{log.author}</strong> ({log.role})
                        </div>
                        {log.comment && (
                          <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200/60 mt-1 italic leading-relaxed">
                            "{log.comment}"
                          </div>
                        )}
                        {log.newStatus && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                            <span>Statut résultant :</span>
                            <span className="font-semibold text-blue-700">{STATUS_MAP[log.newStatus]?.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Fiche type : <strong>F2026-183</strong> (Implémentation HTB dans SIG) · Convention SEI/Enedis
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>

      {/* Decision confirmation sub-modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">
              {showDecisionModal === 'APPROVE' && 'Confirmer l\'approbation de la prestation'}
              {showDecisionModal === 'MODIFY' && 'Demander des modifications à Enedis'}
              {showDecisionModal === 'REJECT' && 'Confirmer le refus de la demande'}
              {showDecisionModal === 'SUBMIT_INSTRUCTION' && 'Transmettre pour cadrage Enedis'}
              {showDecisionModal === 'SUBMIT_CLIENT' && 'Soumettre le chiffrage pour arbitrage client'}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {showDecisionModal === 'APPROVE' &&
                'L\'approbation formelle de cette fiche engage les crédits budgétaires (CAPEX/OPEX) et valide le planning de livraison.'}
              {showDecisionModal === 'MODIFY' &&
                'Veuillez préciser ci-dessous les points à corriger ou à réajuster par l\'équipe instructrice Enedis (périmètre, charges, jalons).'}
              {showDecisionModal === 'REJECT' &&
                'Cette action clôturera définitivement la demande dans le référentiel. Veuillez motiver la décision.'}
              {showDecisionModal === 'SUBMIT_INSTRUCTION' &&
                'La fiche sera notifiée aux chefs de projet Enedis DSI pour instruction technique et chiffrage.'}
              {showDecisionModal === 'SUBMIT_CLIENT' &&
                'Le chiffrage sera soumis à la décision du client EDF-SEI avec le détail des lignes budgétaires.'}
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Commentaire d'arbitrage / Remarques traçables :
              </label>
              <textarea
                rows={3}
                placeholder="Indiquez ici vos motivations ou instructions de suivi..."
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowDecisionModal(null);
                  setDecisionComment('');
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => executeWorkflowAction(showDecisionModal)}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm cursor-pointer ${
                  showDecisionModal === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : showDecisionModal === 'MODIFY'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : showDecisionModal === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Valider et enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
