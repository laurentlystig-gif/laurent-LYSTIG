import React from 'react';
import { FicheDemande } from '../types';
import { STATUS_MAP, computeFicheTotals, formatEuro, formatDateFr } from '../utils/statusUtils';
import { Printer, ArrowLeft, Download, ShieldCheck } from 'lucide-react';

interface PrintFicheViewProps {
  fiche: FicheDemande;
  onBack: () => void;
}

export const PrintFicheView: React.FC<PrintFicheViewProps> = ({ fiche, onBack }) => {
  const totals = computeFicheTotals(fiche);
  const statusConf = STATUS_MAP[fiche.statut];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Aperçu conforme au document Word / Convention officielle
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Official Form Document Body (Printable Paper Style) */}
      <div className="bg-white border border-slate-300 shadow-sm p-8 sm:p-12 text-slate-900 font-sans space-y-8 rounded-lg print:border-none print:shadow-none print:p-0">
        
        {/* Header Strip */}
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black tracking-tight text-blue-900">
                  EDF - SEI
                </span>
                <span className="text-lg text-slate-400 font-light">|</span>
                <span className="text-xl font-black tracking-tight text-emerald-800">
                  Enedis
                </span>
              </div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                Systèmes Énergétiques Insulaires · Direction des Systèmes d'Information
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm font-extrabold text-blue-800 border-2 border-blue-800 px-3 py-1 rounded inline-block">
                FICHE N° {fiche.id}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Émise le {formatDateFr(fiche.dateSoumission)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
              Fiche de Demande de Prestation Spécifique
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Convention Cadre de Coopération SI Enedis / EDF-SEI 2024-2028
            </p>
          </div>
        </div>

        {/* Status Stamp */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-300 rounded text-xs">
          <div>
            <span className="text-slate-500">Statut de la demande :</span>{' '}
            <strong className="text-slate-900 uppercase font-mono">{statusConf.label}</strong>
          </div>
          <div>
            <span className="text-slate-500">Validité du chiffrage :</span>{' '}
            <strong className="font-mono">{fiche.gouvernance.periodeValiditeChiffrage || '31/12/2026'}</strong>
          </div>
        </div>

        {/* SECTION A : En-tête & Gouvernance */}
        <div className="space-y-3">
          <div className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider rounded-xs">
            Section A. En-tête & Gouvernance Partagée
          </div>

          <table className="w-full border-collapse border border-slate-300 text-xs">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold w-1/4">Référence Demande</td>
                <td className="border border-slate-300 p-2 font-mono font-bold w-1/4">{fiche.id}</td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold w-1/4">Date d'instruction</td>
                <td className="border border-slate-300 p-2 w-1/4 font-mono">{formatDateFr(fiche.instructionEnedis.dateRetourInstruction || fiche.dateDerniereModification)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Pilote Opérationnel Enedis</td>
                <td className="border border-slate-300 p-2">
                  <div className="font-semibold">{fiche.gouvernance.piloteEnedis}</div>
                  <div className="text-[10px] text-slate-500">{fiche.gouvernance.piloteEnedisEmail}</div>
                </td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Pilote Opérationnel SEI</td>
                <td className="border border-slate-300 p-2">
                  <div className="font-semibold">{fiche.gouvernance.piloteSEI}</div>
                  <div className="text-[10px] text-slate-500">{fiche.gouvernance.piloteSEIEmail}</div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Signataire Convention Enedis</td>
                <td className="border border-slate-300 p-2 text-slate-700">{fiche.gouvernance.signataireEnedis}</td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Signataire Convention SEI</td>
                <td className="border border-slate-300 p-2 text-slate-700">{fiche.gouvernance.signataireSEI}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION B : Expression du Besoin (EDF-SEI) */}
        <div className="space-y-3">
          <div className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider rounded-xs">
            Section B. Expression du Besoin (EDF-SEI)
          </div>

          <table className="w-full border-collapse border border-slate-300 text-xs">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold w-1/4">Demandeur</td>
                <td className="border border-slate-300 p-2 w-1/4 font-semibold">{fiche.besoinSEI.demandeurPrenom} {fiche.besoinSEI.demandeurNom}</td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold w-1/4">Direction / Entité</td>
                <td className="border border-slate-300 p-2 w-1/4">{fiche.besoinSEI.demandeurDirection}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Domaine Fonctionnel</td>
                <td className="border border-slate-300 p-2">{fiche.besoinSEI.domaineFonctionnel}</td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Application Cible</td>
                <td className="border border-slate-300 p-2 font-bold text-blue-900">{fiche.besoinSEI.applicationCible}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Intitulé du Besoin</td>
                <td colSpan={3} className="border border-slate-300 p-2 font-bold text-slate-900">
                  {fiche.besoinSEI.intituleBesoin}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold align-top">Description & Contexte</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-slate-800 whitespace-pre-line leading-relaxed">
                  {fiche.besoinSEI.contexteDescription}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Criticité dans le temps</td>
                <td className="border border-slate-300 p-2 font-semibold">{fiche.besoinSEI.criticiteTemps} ({fiche.besoinSEI.justificationCriticite})</td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold">Jalon Souhaité</td>
                <td className="border border-slate-300 p-2 font-mono font-bold">{fiche.besoinSEI.jalonSouhaite}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold align-top">Risques à ne pas faire</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-slate-700">
                  {fiche.besoinSEI.risquesNonFaire}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold align-top">Prescrits</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-slate-700">
                  {fiche.besoinSEI.prescrits}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold align-top">Apports & Valeur Métier</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-slate-700">
                  {fiche.besoinSEI.apportsAttendus}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold align-top">Spécificités SEI</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-slate-700">
                  {fiche.besoinSEI.specificitesSEI}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION C : Instruction & Chiffrage Enedis */}
        <div className="space-y-3">
          <div className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider rounded-xs">
            Section C. Instruction Technique & Chiffrage Financier (Enedis)
          </div>

          <table className="w-full border-collapse border border-slate-300 text-xs">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold w-1/4">Instructeur Enedis DSI</td>
                <td className="border border-slate-300 p-2 w-1/4">{fiche.instructionEnedis.instructeurNom}</td>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold w-1/4">Dépendances SI</td>
                <td className="border border-slate-300 p-2 w-1/4">{fiche.instructionEnedis.dependancesSI || 'Néant'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 bg-slate-50 font-semibold align-top">Contraintes & Lotissement</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-slate-700 leading-relaxed">
                  {fiche.instructionEnedis.contraintesTechniques || 'Conforme aux standards'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tableau Financier */}
          <table className="w-full border-collapse border border-slate-300 text-xs mt-3">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800">
                <th className="border border-slate-300 p-2 text-left">Poste de Prestation</th>
                <th className="border border-slate-300 p-2 text-center">Type</th>
                <th className="border border-slate-300 p-2 text-center">Code EOTP</th>
                <th className="border border-slate-300 p-2 text-right">j.h</th>
                <th className="border border-slate-300 p-2 text-right">TJM HT</th>
                <th className="border border-slate-300 p-2 text-right">Montant HT Non Chargé</th>
              </tr>
            </thead>
            <tbody>
              {fiche.instructionEnedis.lignesPrestation?.map((l) => (
                <tr key={l.id}>
                  <td className="border border-slate-300 p-2">
                    <div className="font-semibold">{l.poste}</div>
                    <div className="text-[10px] text-slate-500">{l.description}</div>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-mono">{l.budgetType}</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">{l.codeEOTP}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono tabular-nums">{l.joursHomme}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono tabular-nums">{formatEuro(l.tauxJournalier)}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-semibold tabular-nums">{formatEuro(l.montantHT)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold">
              <tr className="bg-slate-50">
                <td colSpan={3} className="border border-slate-300 p-2 text-right">TOTAL NON CHARGÉ :</td>
                <td className="border border-slate-300 p-2 text-right font-mono tabular-nums">{totals.totalJoursHomme} j.h</td>
                <td className="border border-slate-300 p-2 text-right"></td>
                <td className="border border-slate-300 p-2 text-right font-mono text-sm tabular-nums">{formatEuro(totals.totalNonCharge)} HT</td>
              </tr>
              <tr className="bg-slate-50">
                <td colSpan={5} className="border border-slate-300 p-2 text-right text-slate-600">
                  Taux de charges d'environnement Enedis ({(totals.tauxCharges * 100).toFixed(0)}%) :
                </td>
                <td className="border border-slate-300 p-2 text-right font-mono tabular-nums">
                  {formatEuro(totals.totalCharge - totals.totalNonCharge)} HT
                </td>
              </tr>
              <tr className="bg-blue-50 text-blue-900 text-sm">
                <td colSpan={5} className="border border-slate-300 p-2 text-right">
                  MONTANT TOTAL CHARGÉ ESTIMÉ (FACTURÉ SEI) :
                </td>
                <td className="border border-slate-300 p-2 text-right font-mono font-black tabular-nums">
                  {formatEuro(totals.totalCharge)} HT
                </td>
              </tr>
              <tr className="text-[11px] text-slate-600 bg-white">
                <td colSpan={6} className="border border-slate-300 p-2 text-right">
                  Ventilation comptable : <strong>CAPEX chargé : {formatEuro(totals.capexCharge)}</strong> · <strong>OPEX chargé : {formatEuro(totals.opexCharge)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* SECTION D : Cadre des Signatures & Approbations */}
        <div className="space-y-3 pt-4 border-t-2 border-slate-300">
          <div className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider rounded-xs">
            Section D. Cadre des Signatures & Approbations Officielles
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            {/* Signature Demandeur SEI */}
            <div className="border border-slate-300 p-3 rounded h-32 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-slate-900">Le Demandeur Métier (EDF-SEI)</div>
                <div className="text-[11px] text-slate-500">{fiche.besoinSEI.demandeurPrenom} {fiche.besoinSEI.demandeurNom}</div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-dashed border-slate-200 pt-1">
                Date : {formatDateFr(fiche.dateSoumission)}
                <div className="text-emerald-700 font-medium">✓ Empreinte numérique validée</div>
              </div>
            </div>

            {/* Signature Instructeur Enedis */}
            <div className="border border-slate-300 p-3 rounded h-32 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-slate-900">L'Instructeur Chef de Projet (Enedis)</div>
                <div className="text-[11px] text-slate-500">{fiche.instructionEnedis.instructeurNom || 'Sylvain DUBOIS'}</div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-dashed border-slate-200 pt-1">
                Date : {formatDateFr(fiche.instructionEnedis.dateRetourInstruction || fiche.dateDerniereModification)}
                <div className="text-emerald-700 font-medium">✓ Chiffrage certifié conforme</div>
              </div>
            </div>

            {/* Signature Valideur Client SEI */}
            <div className="border border-slate-300 p-3 rounded h-32 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-slate-900">Le Valideur Budgétaire (EDF-SEI)</div>
                <div className="text-[11px] text-slate-500">Marc LEFEBVRE - Directeur SEI</div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-dashed border-slate-200 pt-1">
                {fiche.statut === 'VALIDE' ? (
                  <div className="text-emerald-700 font-bold">
                    ✓ APPROUVÉ LE {formatDateFr(fiche.dateDerniereModification)}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Signature en attente d'arbitrage</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
          Document généré par le Portail Numérique Centralisé des Prestations Spécifiques EDF-SEI / Enedis DSI · Référence {fiche.id}
        </div>
      </div>
    </div>
  );
};
