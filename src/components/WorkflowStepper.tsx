import React from 'react';
import { FicheStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, XCircle, FileText, ArrowRight } from 'lucide-react';

interface WorkflowStepperProps {
  status: FicheStatus;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ status }) => {
  // Determine current step index
  let currentStep = 1;
  let isRefused = false;
  let isModRequested = false;

  switch (status) {
    case 'REDACTION':
      currentStep = 1;
      break;
    case 'EN_ATTENTE_INSTRUCTION':
    case 'EN_COURS_ANALYSE':
      currentStep = 2;
      break;
    case 'MODIFICATIONS_DEMANDEES':
      currentStep = 2;
      isModRequested = true;
      break;
    case 'EN_ATTENTE_VALIDATION':
      currentStep = 3;
      break;
    case 'VALIDE':
      currentStep = 4;
      break;
    case 'REFUSE':
      currentStep = 3;
      isRefused = true;
      break;
  }

  const steps = [
    {
      num: 1,
      title: 'Expression du Besoin',
      actor: 'EDF-SEI (Demandeur)',
      desc: 'Rédaction du CCTP & prescrits',
    },
    {
      num: 2,
      title: 'Instruction & Chiffrage',
      actor: 'Enedis DSI (Instructeur)',
      desc: 'Étude faisabilité & lignes budgétaires',
    },
    {
      num: 3,
      title: 'Arbitrage Client',
      actor: 'EDF-SEI (Valideur)',
      desc: 'Validation financière & jalons',
    },
    {
      num: 4,
      title: 'Engagement & Clôture',
      actor: 'Gouvernance Partagée',
      desc: 'Prestation contractualisée',
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Circuit d'instruction et de validation électronique
        </span>
        <span className="text-xs font-medium text-slate-500">
          {status === 'VALIDE' && 'Processus achevé avec succès'}
          {status === 'REFUSE' && 'Demande rejetée ou clôturée sans suite'}
          {status === 'EN_ATTENTE_VALIDATION' && 'En attente de décision du client SEI'}
          {status === 'MODIFICATIONS_DEMANDEES' && 'En révision suite à remarques client'}
          {(status === 'EN_ATTENTE_INSTRUCTION' || status === 'EN_COURS_ANALYSE') && 'En cours d\'instruction technique Enedis'}
          {status === 'REDACTION' && 'Brouillon initial'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const isPassed = currentStep > step.num || (step.num === 4 && status === 'VALIDE');
          const isCurrent = currentStep === step.num;
          const isPending = currentStep < step.num;

          return (
            <div
              key={step.num}
              className={`relative flex flex-col p-3 rounded-lg border transition-all ${
                isCurrent
                  ? isRefused
                    ? 'border-rose-300 bg-rose-50/50'
                    : isModRequested
                    ? 'border-orange-300 bg-orange-50/50'
                    : 'border-blue-500 bg-blue-50/60 shadow-sm'
                  : isPassed
                  ? 'border-slate-200 bg-slate-50/70 text-slate-700'
                  : 'border-dashed border-slate-200 bg-white opacity-60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono tracking-tight text-slate-500">
                  ÉTAPE 0{step.num}
                </span>

                {isPassed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {isCurrent && !isRefused && !isModRequested && (
                  <Clock className="w-4 h-4 text-blue-600 animate-spin-slow shrink-0" />
                )}
                {isCurrent && isModRequested && (
                  <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                )}
                {isCurrent && isRefused && (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                {isPending && (
                  <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </div>

              <div className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight mb-1">
                {step.title}
              </div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">
                {step.actor}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
