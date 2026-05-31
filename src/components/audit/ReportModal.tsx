import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Search,
  Shield,
  Zap,
  Info,
  AlertCircle,
  Globe,
  Loader2,
  CheckCircle,
  MessageSquareText,
  Send,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuditReport } from '../../types/audit';
import { formatRegionLabel } from '../../lib/auditConfig';
import {
  getFindingActionId,
  getShelfLifeActionId,
  getTwinMismatchActionId,
} from '../../lib/actionCenter';
import {
  getFindingRewriteSuggestion,
  getReportConsultationResponse,
} from '../../services/gemini';
import { useDismissableLayer } from '../../hooks/useDismissableLayer';

interface ReportModalProps {
  audit: AuditReport | null;
  onClose: () => void;
  onGeneratePDF: (audit: AuditReport) => void;
  onFixImage?: (findingIdx: number) => void;
  isFixing: string | null;
  resolvedActionIds: string[];
  onResolveAction: (actionId: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  audit,
  onClose,
  onGeneratePDF,
  onFixImage,
  isFixing,
  resolvedActionIds,
  onResolveAction,
}) => {
  const modalRef = useDismissableLayer<HTMLDivElement>(!!audit, onClose);
  const [reportTab, setReportTab] = useState<
    'summary' | 'findings' | 'evidence' | 'copilot'
  >('summary');
  const [reportQuestion, setReportQuestion] = useState('');
  const [reportAnswer, setReportAnswer] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [isAnsweringReport, setIsAnsweringReport] = useState(false);
  const [rewriteLoadingIndex, setRewriteLoadingIndex] = useState<number | null>(
    null,
  );
  const [rewriteError, setRewriteError] = useState<{
    index: number;
    message: string;
  } | null>(null);
  const [rewriteSuggestions, setRewriteSuggestions] = useState<
    Record<
      number,
      {
        suggestedCopy: string;
        rationale: string;
        confidence: 'high' | 'medium' | 'low';
      }
    >
  >({});

  const reportContext = useMemo(() => {
    if (!audit) return '';

    const findingsSummary = audit.findings
      .map(
        (finding, index) =>
          `Finding ${index + 1}: claim="${finding.claim}", status="${finding.status}", reasoning="${finding.reasoning}", legalReference="${finding.legalReference}", correctiveAction="${finding.correctiveAction || 'none'}"`,
      )
      .join('\n');

    return `Product: ${audit.productName}
Region: ${audit.region}
Compliance score: ${audit.complianceScore}
Risk summary: ${audit.riskSummary}
FSSAI category: ${audit.fssaiCategory || 'not provided'}
Shelf life status: ${audit.shelfLife?.status || 'not provided'}
Twin mismatches: ${audit.twinMismatches?.length || 0}
Findings:
${findingsSummary}`;
  }, [audit]);

  const quickQuestions = [
    'What should I fix first in this report?',
    'Why is the score not higher?',
    'How should I explain this audit to my team?',
  ];

  if (!audit) return null;

  const shelfLifeActionId = getShelfLifeActionId(audit);
  const twinMismatchActionId = getTwinMismatchActionId(audit);
  const reportTabs: {
    id: typeof reportTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'summary', label: 'Summary', icon: Info },
    { id: 'findings', label: 'Findings', icon: CheckCircle },
    { id: 'evidence', label: 'Evidence', icon: Shield },
    { id: 'copilot', label: 'Copilot', icon: MessageSquareText },
  ];

  const handleAskReport = async (question: string) => {
    const nextQuestion = question.trim();
    if (nextQuestion.length < 3) return;

    setIsAnsweringReport(true);
    setReportError(null);
    setReportAnswer('');

    try {
      const answer = await getReportConsultationResponse(
        nextQuestion,
        reportContext,
      );
      setReportAnswer(answer);
      setReportQuestion(nextQuestion);
    } catch (error) {
      console.error('Report copilot failed:', error);
      setReportError('Unable to answer this report question right now.');
    } finally {
      setIsAnsweringReport(false);
    }
  };

  const handleGenerateRewrite = async (findingIdx: number) => {
    const finding = audit.findings[findingIdx];
    if (!finding) return;

    setRewriteLoadingIndex(findingIdx);
    setRewriteError(null);

    try {
      const suggestion = await getFindingRewriteSuggestion({
        claim: finding.claim,
        reasoning: finding.reasoning,
        legalReference: finding.legalReference,
        region: audit.region,
        productName: audit.productName,
        correctiveAction: finding.correctiveAction,
      });

      setRewriteSuggestions((current) => ({
        ...current,
        [findingIdx]: suggestion,
      }));
    } catch (error) {
      console.error('Rewrite suggestion failed:', error);
      setRewriteError({
        index: findingIdx,
        message: 'Unable to generate a safer rewrite right now.',
      });
    } finally {
      setRewriteLoadingIndex(null);
    }
  };

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        />

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className='oa-panel relative flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col shadow-2xl shadow-black/30 transition-colors duration-300 sm:max-h-[90vh]'>
          <div className='sticky top-0 z-10 flex shrink-0 items-start justify-between gap-3 border-b border-border-primary bg-theme-primary px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <Shield className='h-4 w-4 text-[var(--accent-primary)]' />
                <span className='oa-label'>
                  Statutory Report
                </span>
              </div>
              <h2 className='font-display truncate pr-2 text-lg font-bold text-text-primary sm:text-2xl'>
                {audit.productName}
              </h2>
            </div>
            <div className='flex shrink-0 items-center gap-2'>
              <button
                onClick={() => onGeneratePDF(audit)}
                className='oa-button-primary hidden px-6 py-2.5 sm:flex'>
                <Download className='w-4 h-4' />
                Certificate
              </button>
              <button
                onClick={onClose}
                className='rounded p-2.5 text-text-secondary transition-all hover:bg-accent-primary-soft hover:text-text-primary'>
                <X className='w-6 h-6' />
              </button>
            </div>
          </div>

          <div className='flex shrink-0 gap-2 overflow-x-auto border-b border-border-primary bg-theme-secondary px-4 py-3 sm:px-6 lg:px-8'>
            {reportTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type='button'
                onClick={() => setReportTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded border-l-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  reportTab === id
                    ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                    : 'border-transparent text-text-secondary hover:bg-accent-primary-soft hover:text-text-primary'
                }`}>
                <Icon className='h-3.5 w-3.5' />
                {label}
              </button>
            ))}
          </div>

          <div className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'>
            <div
              className={
                reportTab === 'summary' || reportTab === 'evidence'
                  ? 'grid grid-cols-1 gap-8 lg:grid-cols-3'
                  : 'space-y-8'
              }>
              {(reportTab === 'summary' || reportTab === 'evidence') && (
              <div className='lg:col-span-1 space-y-6'>
                <div className='overflow-hidden rounded border border-border-primary bg-theme-secondary'>
                  <div
                    className={`grid gap-3 p-3 ${
                      audit.digitalImage ? 'grid-cols-2' : 'grid-cols-1'
                    }`}>
                    {audit.productImage && (
                      <div className='overflow-hidden rounded border border-border-primary bg-theme-primary'>
                        <div className='border-b border-border-primary px-3 py-2 text-[8px] font-bold uppercase tracking-widest text-text-secondary'>
                          Physical label
                        </div>
                        <img
                          src={audit.productImage}
                          alt='Product packaging'
                          className='h-44 w-full object-contain p-4 sm:h-56'
                        />
                      </div>
                    )}
                    {audit.digitalImage && (
                        <div className='overflow-hidden rounded border border-border-primary bg-theme-primary'>
                        <div className='border-b border-border-primary px-3 py-2 text-[8px] font-bold uppercase tracking-widest text-text-secondary'>
                          Digital listing
                        </div>
                        <img
                          src={audit.digitalImage}
                          alt='Marketplace listing'
                          className='h-44 w-full object-contain p-4 sm:h-56'
                        />
                      </div>
                    )}
                  </div>
                  <div className='border-t border-border-primary bg-theme-primary/80 px-4 py-3 backdrop-blur-md'>
                    <p className='text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1'>
                      Vision Hash
                    </p>
                    <p className='text-[9px] font-mono text-text-secondary truncate'>
                      {audit.thoughtSignature}
                    </p>
                  </div>
                </div>

                <div className='relative overflow-hidden rounded border border-amber-500/30 bg-accent-primary-soft p-8 text-text-primary'>
                  <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                    Compliance Integrity
                  </p>
                  <div className='font-display mb-1 text-5xl font-extrabold text-text-primary'>
                    {audit.complianceScore}
                  </div>
                  <p className='text-xs font-semibold uppercase tracking-widest text-text-secondary'>
                    Statutory Score / 100
                  </p>
                </div>

                {audit.region && (
                  <div className='rounded border border-border-primary bg-theme-secondary p-6'>
                    <h4 className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2'>
                      <Globe className='h-3 w-3 text-[var(--accent-primary)]' /> Target
                      Market
                    </h4>
                    <p className='text-sm font-bold text-text-primary'>
                      {formatRegionLabel(audit.region)}
                    </p>
                    {audit.fssaiCategory && (
                      <div className='mt-3 inline-block rounded border border-amber-500/30 bg-accent-primary-soft px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                        FSSAI CAT: {audit.fssaiCategory}
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              <div
                className={
                  reportTab === 'summary' || reportTab === 'evidence'
                    ? 'space-y-8 lg:col-span-2'
                    : 'space-y-8'
                }>
                {reportTab === 'summary' && (
                <section>
                  <h4 className='text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                    <Info className='h-4 w-4 text-[var(--accent-primary)]' /> Expert Risk
                    Summary
                  </h4>
                  <div className='prose prose-sm dark:prose-invert max-w-none'>
                    <div className='text-text-secondary font-medium leading-relaxed italic'>
                      <ReactMarkdown>{audit.riskSummary}</ReactMarkdown>
                    </div>
                  </div>
                </section>
                )}

                {reportTab === 'copilot' && (
                <section className='rounded border border-border-primary bg-theme-secondary p-5 sm:p-6'>
                  <div className='mb-4 flex items-center gap-2'>
                    <MessageSquareText className='h-4 w-4 text-[var(--accent-primary)]' />
                    <h4 className='text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary'>
                      Ask This Report
                    </h4>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => void handleAskReport(question)}
                        className='rounded border border-border-primary bg-theme-primary px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-amber-500/50 hover:bg-accent-primary-soft hover:text-[var(--accent-primary)]'>
                        {question}
                      </button>
                    ))}
                  </div>

                  <div className='mt-4'>
                    <textarea
                      value={reportQuestion}
                      onChange={(event) => setReportQuestion(event.target.value)}
                      rows={3}
                      placeholder='Ask about the score, highest-priority fixes, or what this report means.'
                      className='w-full resize-none rounded border border-border-primary bg-theme-primary p-4 text-sm font-medium text-text-primary outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
                    />
                    <button
                      onClick={() => void handleAskReport(reportQuestion)}
                      disabled={isAnsweringReport || reportQuestion.trim().length < 3}
                      className='oa-button-primary mt-3 w-full py-3 disabled:opacity-50'>
                      {isAnsweringReport ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Thinking
                        </>
                      ) : (
                        <>
                          <Send className='h-4 w-4' />
                          Ask OmniAudit
                        </>
                      )}
                    </button>
                  </div>

                  {(reportAnswer || reportError || isAnsweringReport) && (
                    <div className='mt-4 rounded border border-border-primary bg-theme-primary px-4 py-4 text-text-primary'>
                      <div className='mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                        <Sparkles className='h-4 w-4' />
                        Report copilot
                      </div>
                      {isAnsweringReport ? (
                        <div className='flex items-center gap-2 text-sm text-text-secondary'>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Reviewing this report...
                        </div>
                      ) : reportError ? (
                        <p className='text-sm font-medium text-red-400'>
                          {reportError}
                        </p>
                      ) : (
                        <p className='text-sm font-medium leading-relaxed text-text-primary'>
                          {reportAnswer}
                        </p>
                      )}
                    </div>
                  )}
                </section>
                )}

                {reportTab === 'findings' && audit.twinMismatches && audit.twinMismatches.length > 0 && (
                  <section className='rounded border border-border-primary bg-theme-secondary p-6'>
                    <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <h4 className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                        <Search className='w-4 h-4' /> Digital Twin Mismatch
                        Detection
                      </h4>
                      <button
                        onClick={() => onResolveAction(twinMismatchActionId)}
                        disabled={resolvedActionIds.includes(twinMismatchActionId)}
                        className='oa-button-ghost disabled:opacity-50'>
                        {resolvedActionIds.includes(twinMismatchActionId)
                          ? 'Mismatch task resolved'
                          : 'Mark mismatch resolved'}
                      </button>
                    </div>
                    <div className='overflow-x-auto'>
                      <table className='w-full border-separate border-spacing-y-2'>
                        <thead>
                          <tr>
                            <th className='px-4 text-left text-[9px] font-bold uppercase tracking-widest text-text-secondary'>
                              Attribute
                            </th>
                            <th className='px-4 text-left text-[9px] font-bold uppercase tracking-widest text-text-secondary'>
                              Physical
                            </th>
                            <th className='px-4 text-left text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                              Listing
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {audit.twinMismatches.map((mismatch, i) => (
                            <tr
                              key={i}
                              className='bg-theme-primary/50 border-b border-border-primary/50'>
                              <td className='text-[10px] font-bold text-text-primary p-4 rounded-l-xl uppercase tracking-tighter'>
                                {mismatch.attribute}
                              </td>
                              <td className='text-xs text-text-secondary p-4 font-medium'>
                                {mismatch.physicalValue}
                              </td>
                              <td className='text-xs font-bold text-red-600 dark:text-red-400 p-4 rounded-r-xl bg-red-50 dark:bg-red-900/10 border-l border-red-100 dark:border-red-900/30'>
                                {mismatch.digitalValue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {reportTab === 'findings' && audit.shelfLife && (
                  <div
                    className={`relative overflow-hidden rounded border p-6 transition-colors duration-300 ${
                      audit.shelfLife.status === 'expired'
                        ? 'border-red-500/30 bg-red-500/10'
                        : audit.shelfLife.status === 'near-expiry'
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-emerald-500/30 bg-emerald-500/10'
                    }`}>
                    <div
                        className={`absolute right-0 top-0 px-6 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black ${
                        audit.shelfLife.status === 'expired'
                          ? 'bg-red-600'
                          : audit.shelfLife.status === 'near-expiry'
                            ? 'bg-amber-600'
                            : 'bg-emerald-600'
                      }`}>
                      {audit.shelfLife.status}
                    </div>

                    <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <h4
                        className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                        audit.shelfLife.status === 'expired'
                          ? 'text-red-900 dark:text-red-400'
                          : audit.shelfLife.status === 'near-expiry'
                            ? 'text-amber-900 dark:text-amber-400'
                            : 'text-emerald-900 dark:text-emerald-400'
                      }`}>
                        <Zap className='w-4 h-4' /> Freshness Guard
                      </h4>
                      <button
                        onClick={() => onResolveAction(shelfLifeActionId)}
                        disabled={resolvedActionIds.includes(shelfLifeActionId)}
                        className='oa-button-ghost disabled:opacity-50'>
                        {resolvedActionIds.includes(shelfLifeActionId)
                          ? 'Shelf-life task resolved'
                          : 'Mark shelf-life reviewed'}
                      </button>
                    </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center'>
                      <div className='space-y-4'>
                        <div className='flex items-end justify-between gap-4'>
                          <div>
                            <p className='mb-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary'>
                              Exp Date
                            </p>
                            <div className='text-base font-bold text-text-primary tracking-tight leading-none'>
                              {audit.shelfLife.expDate}
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='mb-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary'>
                              Days Left
                            </p>
                            <div
                              className={`text-base font-bold tracking-tight leading-none ${
                                audit.shelfLife.remainingDays <= 0
                                  ? 'text-red-600'
                                  : audit.shelfLife.remainingDays < 45
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                              }`}>
                              {audit.shelfLife.remainingDays}
                            </div>
                          </div>
                        </div>
                        <div className='h-2.5 overflow-hidden rounded border border-border-primary/50 bg-theme-secondary'>
                          <div
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  (audit.shelfLife.remainingDays / 365) * 100,
                                ),
                              )}%`,
                            }}
                            className={`h-full transition-all duration-1000 ${
                              audit.shelfLife.status === 'expired'
                                ? 'bg-red-600'
                                : audit.shelfLife.status === 'near-expiry'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className='rounded border border-border-primary bg-theme-primary p-5'>
                        <p className='text-[11px] text-text-secondary font-medium italic leading-relaxed'>
                          {audit.shelfLife.status === 'expired'
                            ? 'Product exceeds safety dates.'
                            : audit.shelfLife.status === 'near-expiry'
                              ? 'Approaching end-of-life status. High attention required.'
                              : 'Product maintains optimal freshness according to statutory OCR verification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {reportTab === 'findings' && (
                <section>
                  <h4 className='mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <CheckCircle className='w-4 h-4 text-emerald-500' />{' '}
                    Statutory Verification
                  </h4>
                  <div className='space-y-4'>
                    {audit.findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className={`rounded border p-6 transition-all ${
                          finding.status === 'discrepancy'
                            ? 'border-amber-500/30 bg-amber-500/10'
                            : 'border-emerald-500/30 bg-emerald-500/10'
                        }`}>
                        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                          <div className='flex items-start gap-4 min-w-0'>
                            <div className='mt-1'>
                              {finding.status === 'discrepancy' ? (
                                <AlertCircle className='w-6 h-6 text-amber-500' />
                              ) : (
                                <CheckCircle className='w-6 h-6 text-emerald-500' />
                              )}
                            </div>
                            <div className='min-w-0'>
                              <h5 className='mb-1 text-base font-bold leading-tight tracking-tight text-text-primary uppercase'>
                                {finding.claim}
                              </h5>
                              <p className='text-[10px] text-text-secondary font-semibold uppercase tracking-widest mb-4'>
                                Legal Ref: {finding.legalReference}
                              </p>
                              <p className='text-[11px] text-text-secondary font-medium leading-relaxed italic'>
                                {finding.reasoning}
                              </p>
                              {finding.correctiveAction && (
                                <p className='mt-4 text-[11px] font-semibold leading-relaxed text-text-primary'>
                                  Recommended action: {finding.correctiveAction}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className='flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col'>
                            {finding.status === 'discrepancy' && (
                              <button
                                onClick={() => void handleGenerateRewrite(idx)}
                                disabled={rewriteLoadingIndex !== null}
                                className='oa-button-primary disabled:opacity-50'>
                                {rewriteLoadingIndex === idx ? (
                                  <>
                                    <Loader2 className='h-3 w-3 animate-spin' />
                                    Rewriting...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className='h-3 w-3' />
                                    Safer Rewrite
                                  </>
                                )}
                              </button>
                            )}
                            {finding.status === 'discrepancy' && (
                              <button
                                onClick={() => onResolveAction(getFindingActionId(audit, idx))}
                                disabled={resolvedActionIds.includes(
                                  getFindingActionId(audit, idx),
                                )}
                                className='oa-button-ghost disabled:opacity-50'>
                                {resolvedActionIds.includes(getFindingActionId(audit, idx))
                                  ? 'Action resolved'
                                  : 'Mark action done'}
                              </button>
                            )}

                            {finding.visualFixPrompt && onFixImage && (
                              <button
                                onClick={() => !isFixing && onFixImage(idx)}
                                disabled={!!isFixing}
                                className='oa-button-primary disabled:opacity-50'>
                                {isFixing === idx.toString() ? (
                                  <>
                                    <Loader2 className='w-3 h-3 animate-spin' />
                                    Applying...
                                  </>
                                ) : (
                                  <>
                                    <Zap className='w-3 h-3' />
                                    Visual Fix
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {rewriteError?.index === idx &&
                          rewriteLoadingIndex === null && (
                          <p className='mt-4 text-sm font-medium text-red-600 dark:text-red-400'>
                            {rewriteError.message}
                          </p>
                        )}

                        {rewriteSuggestions[idx] && (
                          <div className='mt-5 rounded border border-amber-500/30 bg-accent-primary-soft p-4'>
                            <div className='flex flex-wrap items-center justify-between gap-3'>
                              <p className='text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                                AI Rewrite Suggestion
                              </p>
                              <span className='rounded border border-amber-500/30 bg-theme-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                                {rewriteSuggestions[idx].confidence} confidence
                              </span>
                            </div>
                            <p className='mt-3 text-sm font-semibold leading-relaxed text-text-primary'>
                              {rewriteSuggestions[idx].suggestedCopy}
                            </p>
                            <p className='mt-3 text-sm font-medium leading-relaxed text-text-secondary'>
                              {rewriteSuggestions[idx].rationale}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                )}

                {reportTab === 'evidence' && (
                  <section className='rounded border border-border-primary bg-theme-secondary p-5 sm:p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                      <Shield className='h-4 w-4 text-[var(--accent-primary)]' />
                      <h4 className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Evidence notes
                      </h4>
                    </div>
                    <p className='text-sm font-medium leading-relaxed text-text-secondary'>
                      Visual evidence and market metadata are separated here so
                      reviewers can inspect source material without reading the
                      whole report at once.
                    </p>
                    <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <div className='rounded border border-border-primary bg-theme-primary p-4'>
                        <div className='oa-label'>Physical source</div>
                        <p className='mt-2 text-sm font-semibold text-text-primary'>
                          {audit.productImage ? 'Attached' : 'Not provided'}
                        </p>
                      </div>
                      <div className='rounded border border-border-primary bg-theme-primary p-4'>
                        <div className='oa-label'>Digital source</div>
                        <p className='mt-2 text-sm font-semibold text-text-primary'>
                          {audit.digitalImage ? 'Attached' : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          <div className='flex shrink-0 flex-col gap-3 border-t border-border-primary bg-theme-secondary px-4 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8'>
            <div className='text-[9px] text-text-secondary font-bold uppercase tracking-widest'>
              Generated by OmniAudit AI v3.0 Statutory Engine
            </div>
            <button
              onClick={onClose}
              className='text-[10px] font-bold text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors p-2'>
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};





