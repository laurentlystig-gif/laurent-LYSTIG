import React, { useState } from 'react';
import { FicheDemande, UserRole } from '../types';
import { USER_ROLES_INFO } from '../utils/statusUtils';
import { X, Plus, FileText, Send, Sparkles } from 'lucide-react';

interface NewFicheModalProps {
  onClose: () => void;
  onCreateFiche: (fiche: FicheDemande) => void;
  currentRole: UserRole;
  nextId: string;
}

export const NewFicheModal: React.FC<NewFicheModalProps> = ({
  onClose,
  onCreateFiche,
  currentRole,
  nextId,
}) => {
  const userMeta = USER_ROLES_INFO[currentRole];

  const [demandeurNom, setDemandeurNom] = useState(
    currentRole === 'DEMANDEUR_SEI' ? 'TAMBOURAN' : 'DUPONT'
  );
  const [demandeurPrenom, setDemandeurPrenom] = useState(
    currentRole === 'DEMANDEUR_SEI' ? 'Willy' : 'Alexandre'
  );
  const [demandeurDirection, setDemandeurDirection] = useState('Délégation Réseau et Patrimoine / SEI');
  const [demandeurTelephone, setDemandeurTelephone] = useState('05 90 21 44 80');
  const [demandeurEmail, setDemandeurEmail] = useState('willy.tambouran@edf.fr');
  const [filiereMetier, setFiliereMetier] = useState('Exploitation & Ingénierie Réseaux');
  const [domaineFonctionnel, setDomaineFonctionnel] = useState('Patrimoine & Cartographie');
  const [applicationCible, setApplicationCible] = useState('SIG (Système d\'Information Géographique)');
  const [intituleBesoin, setIntituleBesoin] = useState('');
  const [contexteDescription, setContexteDescription] = useState('');
  const [criticiteTemps, setCriticiteTemps] = useState<'Faible' | 'Moyenne' | 'Haute' | 'Critique'>('Haute');
  const [justificationCriticite, setJustificationCriticite] = useState('');
  const [risquesNonFaire, setRisquesNonFaire] = useState('');
  const [prescrits, setPrescrits] = useState('');
  const [apportsAttendus, setApportsAttendus] = useState('');
  const [specificitesSEI, setSpecificitesSEI] = useState('');
  const [jalonSouhaite, setJalonSouhaite] = useState('T4-2027');

  const handleSubmit = (submitToInstruction: boolean) => {
    if (!intituleBesoin.trim()) {
      alert('Veuillez renseigner un intitulé explicite pour le besoin.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const initialStatus = submitToInstruction ? 'EN_ATTENTE_INSTRUCTION' : 'REDACTION';

    const newFiche: FicheDemande = {
      id: nextId,
      dateSoumission: today,
      dateDerniereModification: today,
      statut: initialStatus,
      gouvernance: {
        piloteEnedis: 'Sylvain DUBOIS',
        piloteEnedisEmail: 'sylvain.dubois@enedis.fr',
        piloteSEI: `${demandeurPrenom} ${demandeurNom}`,
        piloteSEIEmail: demandeurEmail,
        signataireEnedis: 'Direction DSI Enedis',
        signataireSEI: demandeurDirection,
        conventionCadre: 'Convention Cadre SI Enedis / EDF-SEI 2024-2028',
        periodeValiditeChiffrage: '31/12/2027',
      },
      besoinSEI: {
        demandeurNom,
        demandeurPrenom,
        demandeurDirection,
        demandeurTelephone,
        demandeurEmail,
        filiereMetier,
        domaineFonctionnel,
        applicationCible,
        intituleBesoin,
        contexteDescription,
        criticiteTemps,
        justificationCriticite: justificationCriticite || 'Échéance fixée par le calendrier des investissements.',
        risquesNonFaire: risquesNonFaire || 'Risque de décalage dans la mise en conformité des référentiels.',
        prescrits: prescrits || 'Réglementation CRE et normes de sécurité électrique SEI.',
        apportsAttendus: apportsAttendus || 'Fiabilisation des opérations et centralisation des données.',
        specificitesSEI: specificitesSEI || 'Réseau insulaire non interconnecté avec contraintes de fuseaux horaires.',
        jalonSouhaite,
        dateCibleMiseEnService: '2027-12-31',
        attachments: [],
      },
      instructionEnedis: {
        instructeurNom: 'Sylvain DUBOIS',
        instructeurEmail: 'sylvain.dubois@enedis.fr',
        contraintesTechniques: 'Instruction technique préliminaire à initialiser.',
        dependancesSI: 'Socle applicatif standard.',
        impactArchitecture: 'À qualifier lors du cadrage.',
        tauxChargesEnvironnement: 0.25,
        lignesPrestation: [],
      },
      historiqueAudit: [
        {
          id: `aud-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: `${demandeurPrenom} ${demandeurNom}`,
          role: 'Demandeur EDF-SEI',
          action: submitToInstruction ? 'Création et transmission directe pour instruction' : 'Création du brouillon de fiche',
          comment: submitToInstruction ? 'Dossier transmis aux équipes Enedis DSI.' : 'Fiche initiée en mode rédaction.',
          newStatus: initialStatus,
        },
      ],
    };

    onCreateFiche(newFiche);
  };

  const loadExampleTemplate = () => {
    setIntituleBesoin('Interconnexion topologique des postes sources HTB/HTA avec le SIG');
    setContexteDescription(`Dans la continuité du projet F2026-183 (Gestion HTB dans le SIG), ce besoin vise à modéliser la topologie fine interne des postes sources HTB/HTA insulaires (travées disjoncteurs, transformateurs de puissance, départs HTA).
    
Objectif : permettre aux aiguilleurs de la conduite et aux cartographes d'avoir une vision unifiée sans rupture entre le réseau de transport insulaire et le réseau de distribution.`);
    setJustificationCriticite('Harmonisation avec la version 14.3 du SIG et le nouveau système SCADA insulaire.');
    setRisquesNonFaire('Impossibilité de visualiser les schémas d\'exploitation unifiés des postes sources clés.');
    setPrescrits('Prescriptions d\'ingénierie réseaux ZNI v4.');
    setApportsAttendus('Gain estimé à 30 minutes lors des manœuvres de réalimentation post-cyclone.');
    setSpecificitesSEI('Les postes sources intègrent des groupes diesels de secours et des batteries BESS spécifiques aux SEI.');
    setJalonSouhaite('T4-2027');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-md">
              {nextId}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Nouvelle Fiche de Demande de Prestation Spécifique
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Expression du besoin EDF-SEI à destination des équipes d'ingénierie Enedis DSI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadExampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              title="Pré-remplir avec un exemple réaliste complémentaire"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Charger modèle exemple</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-slate-50/30">
          {/* Section 1: Demandeur */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Demandeur & Périmètre Organisationnel (EDF-SEI)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Prénom & Nom du demandeur</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={demandeurPrenom}
                    onChange={(e) => setDemandeurPrenom(e.target.value)}
                    placeholder="Prénom"
                    className="w-1/2 border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    value={demandeurNom}
                    onChange={(e) => setDemandeurNom(e.target.value)}
                    placeholder="Nom"
                    className="w-1/2 border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 uppercase font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Direction / Délégation</label>
                <select
                  value={demandeurDirection}
                  onChange={(e) => setDemandeurDirection(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
                >
                  <option value="Délégation Réseau et Patrimoine / SEI">Délégation Réseau et Patrimoine / SEI</option>
                  <option value="Direction Régionale Corse / SEI">Direction Régionale Corse / SEI</option>
                  <option value="Direction Régionale Guadeloupe / SEI">Direction Régionale Guadeloupe / SEI</option>
                  <option value="Direction Régionale Martinique / SEI">Direction Régionale Martinique / SEI</option>
                  <option value="Direction Régionale Guyane / SEI">Direction Régionale Guyane / SEI</option>
                  <option value="Direction Régionale La Réunion / SEI">Direction Régionale La Réunion / SEI</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Email professionnel</label>
                <input
                  type="email"
                  value={demandeurEmail}
                  onChange={(e) => setDemandeurEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Domaine Fonctionnel</label>
                <select
                  value={domaineFonctionnel}
                  onChange={(e) => setDomaineFonctionnel(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
                >
                  <option value="Patrimoine & Cartographie">Patrimoine & Cartographie</option>
                  <option value="Téléconduite & SCADA">Téléconduite & SCADA</option>
                  <option value="Comptage & Métrologie">Comptage & Métrologie</option>
                  <option value="GMAO & Maintenance">GMAO & Maintenance</option>
                  <option value="Calcul Réseau & Transition Énergétique">Calcul Réseau & Transition Énergétique</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Application Cible</label>
                <select
                  value={applicationCible}
                  onChange={(e) => setApplicationCible(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 font-medium"
                >
                  <option value="SIG (Système d'Information Géographique)">SIG (Système d'Information Géographique)</option>
                  <option value="ADMS / SCADA e-Téra">ADMS / SCADA e-Téra</option>
                  <option value="SGE-SEI / Linky Insulaire">SGE-SEI / Linky Insulaire</option>
                  <option value="GMAO Maximo">GMAO Maximo</option>
                  <option value="Portail Carto Web Nomade">Portail Carto Web Nomade</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Jalon Souhaité</label>
                <select
                  value={jalonSouhaite}
                  onChange={(e) => setJalonSouhaite(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 font-medium"
                >
                  <option value="T4-2026">T4-2026</option>
                  <option value="T1-2027">T1-2027</option>
                  <option value="T2-2027">T2-2027</option>
                  <option value="T3-2027">T3-2027</option>
                  <option value="T4-2027">T4-2027</option>
                  <option value="T1-2028">T1-2028</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Intitulé & Description */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              2. Intitulé & Description Fonctionnelle Détaillée
            </h3>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Intitulé du Besoin (Titre clair et explicite) *
              </label>
              <input
                type="text"
                value={intituleBesoin}
                onChange={(e) => setIntituleBesoin(e.target.value)}
                placeholder="Ex: Implémentation de la gestion de la HTB dans le SIG"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Contexte & Description Détaillée du Besoin
              </label>
              <textarea
                rows={5}
                value={contexteDescription}
                onChange={(e) => setContexteDescription(e.target.value)}
                placeholder="Décrire le contexte opérationnel, les évolutions du modèle de données requises, les impacts cartographiques, les interfaces à prévoir..."
                className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-900 leading-relaxed bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Qualification */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              3. Qualification & Spécificités Insulaires
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Criticité dans le temps</label>
                <select
                  value={criticiteTemps}
                  onChange={(e) => setCriticiteTemps(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 font-semibold"
                >
                  <option value="Faible">Faible (Amélioration de confort)</option>
                  <option value="Moyenne">Moyenne (Projet pluriannuel standard)</option>
                  <option value="Haute">Haute (Échéance réglementaire ou conventionnelle)</option>
                  <option value="Critique">Critique (Risque de crise ou pénalités)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Justification de la criticité</label>
                <input
                  type="text"
                  value={justificationCriticite}
                  onChange={(e) => setJustificationCriticite(e.target.value)}
                  placeholder="Ex: Échéance audit CRE ou contrat de concession"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Risques à ne pas faire</label>
                <textarea
                  rows={2}
                  value={risquesNonFaire}
                  onChange={(e) => setRisquesNonFaire(e.target.value)}
                  placeholder="Ex: Rupture de traçabilité, non-conformité, erreurs de manœuvre"
                  className="w-full border border-slate-300 rounded p-2 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Apports attendus & Valeur métier</label>
                <textarea
                  rows={2}
                  value={apportsAttendus}
                  onChange={(e) => setApportsAttendus(e.target.value)}
                  placeholder="Ex: Centralisation des données, gain de temps, réduction d'erreurs"
                  className="w-full border border-slate-300 rounded p-2 bg-white text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-600 font-medium block mb-1">
                  Spécificités SEI (Zones Non Interconnectées, gestion HTB, fuseaux...)
                </label>
                <input
                  type="text"
                  value={specificitesSEI}
                  onChange={(e) => setSpecificitesSEI(e.target.value)}
                  placeholder="Ex: Gestion HTB en direct par SEI, concessions insulaires étanches, décalages horaires"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Enregistrer en Brouillon
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre pour Cadrage Enedis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
