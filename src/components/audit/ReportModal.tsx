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
  if (!audit) return null;

  const shelfLifeActionId = getShelfLifeActionId(audit);
  const twinMismatchActionId = getTwinMismatchActionId(audit);

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
          className='absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm'
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className='relative flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-border-primary bg-theme-primary shadow-2xl transition-colors duration-300 sm:max-h-[90vh] sm:rounded-[2.5rem]'>
          <div className='sticky top-0 z-10 flex shrink-0 items-start justify-between gap-3 border-b border-border-primary bg-theme-primary px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <Shield className='w-4 h-4 text-indigo-600' />
                <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary'>
                  Statutory Report
                </span>
              </div>
              <h2 className='truncate pr-2 text-lg font-bold tracking-tight text-text-primary sm:text-2xl'>
                {audit.productName}
              </h2>
            </div>
            <div className='flex shrink-0 items-center gap-2'>
              <button
                onClick={() => onGeneratePDF(audit)}
                className='hidden sm:flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none'>
                <Download className='w-4 h-4' />
                Certificate
              </button>
              <button
                onClick={onClose}
                className='p-2.5 text-text-secondary hover:text-text-primary hover:bg-theme-secondary rounded-xl transition-all'>
                <X className='w-6 h-6' />
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-1 space-y-6'>
                <div className='overflow-hidden rounded-[2rem] border-4 border-theme-secondary bg-theme-secondary shadow-inner'>
                  <div
                    className={`grid gap-3 p-3 ${
                      audit.digitalImage ? 'grid-cols-2' : 'grid-cols-1'
                    }`}>
                    {audit.productImage && (
                      <div className='overflow-hidden rounded-[1.5rem] border border-border-primary bg-theme-primary'>
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
                        <div className='overflow-hidden rounded-[1.5rem] border border-border-primary bg-theme-primary'>
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

                <div className='bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden'>
                  <div className='absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl' />
                  <p className='text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80'>
                    Compliance Integrity
                  </p>
                  <div className='text-5xl font-bold mb-1 tracking-tighter'>
                    {audit.complianceScore}
                  </div>
                  <p className='text-xs font-semibold opacity-60 uppercase tracking-widest'>
                    Statutory Score / 100
                  </p>
                </div>

                {audit.region && (
                  <div className='bg-theme-secondary/50 p-6 rounded-2xl border border-border-primary'>
                    <h4 className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2'>
                      <Globe className='w-3 h-3 text-indigo-500' /> Target
                      Market
                    </h4>
                    <p className='text-sm font-bold text-text-primary'>
                      {formatRegionLabel(audit.region)}
                    </p>
                    {audit.fssaiCategory && (
                      <div className='mt-3 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800'>
                        FSSAI CAT: {audit.fssaiCategory}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className='lg:col-span-2 space-y-8'>
                <section>
                  <h4 className='text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                    <Info className='w-4 h-4 text-indigo-500' /> Expert Risk
                    Summary
                  </h4>
                  <div className='prose prose-sm prose-indigo dark:prose-invert max-w-none'>
                    <div className='text-text-secondary font-medium leading-relaxed italic'>
                      <ReactMarkdown>{audit.riskSummary}</ReactMarkdown>
                    </div>
                  </div>
                </section>

                <section className='rounded-[2rem] border border-border-primary bg-theme-secondary/40 p-5 sm:p-6'>
                  <div className='mb-4 flex items-center gap-2'>
                    <MessageSquareText className='h-4 w-4 text-indigo-500' />
                    <h4 className='text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary'>
                      Ask This Report
                    </h4>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => void handleAskReport(question)}
                        className='rounded-full border border-border-primary bg-theme-primary px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:hover:border-indigo-900/40'>
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
                      className='w-full resize-none rounded-[1.25rem] border border-border-primary bg-theme-primary p-4 text-sm font-medium text-text-primary outline-none transition-all focus:ring-2 focus:ring-indigo-500'
                    />
                    <button
                      onClick={() => void handleAskReport(reportQuestion)}
                      disabled={isAnsweringReport || reportQuestion.trim().length < 3}
                      className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.01] disabled:opacity-50 dark:bg-indigo-600'>
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
                    <div className='mt-4 rounded-[1.5rem] bg-slate-950 px-4 py-4 text-slate-100 dark:bg-[#070B16]'>
                      <div className='mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-300'>
                        <Sparkles className='h-4 w-4' />
                        Report copilot
                      </div>
                      {isAnsweringReport ? (
                        <div className='flex items-center gap-2 text-sm text-slate-300'>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Reviewing this report...
                        </div>
                      ) : reportError ? (
                        <p className='text-sm font-medium text-rose-300'>
                          {reportError}
                        </p>
                      ) : (
                        <p className='text-sm font-medium leading-relaxed text-slate-100'>
                          {reportAnswer}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {audit.twinMismatches && audit.twinMismatches.length > 0 && (
                  <section className='bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30'>
                    <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <h4 className='text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                        <Search className='w-4 h-4' /> Digital Twin Mismatch
                        Detection
                      </h4>
                      <button
                        onClick={() => onResolveAction(twinMismatchActionId)}
                        disabled={resolvedActionIds.includes(twinMismatchActionId)}
                        className='rounded-xl border border-indigo-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-900/40 dark:bg-[#10182A] dark:text-indigo-300 dark:hover:bg-indigo-900/20'>
                        {resolvedActionIds.includes(twinMismatchActionId)
                          ? 'Mismatch task resolved'
                          : 'Mark mismatch resolved'}
                      </button>
                    </div>
                    <div className='overflow-x-auto'>
                      <table className='w-full border-separate border-spacing-y-2'>
                        <thead>
                          <tr>
                            <th className='text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4'>
                              Attribute
                            </th>
                            <th className='text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4'>
                              Physical
                            </th>
                            <th className='text-left text-[9px] font-bold text-indigo-500 uppercase tracking-widest px-4'>
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

                {audit.shelfLife && (
                  <div
                    className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden transition-colors duration-300 ${
                      audit.shelfLife.status === 'expired'
                        ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                        : audit.shelfLife.status === 'near-expiry'
                          ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                          : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                    }`}>
                    <div
                      className={`absolute top-0 right-0 py-1.5 px-6 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-bl-2xl ${
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
                        className='rounded-xl border border-border-primary bg-theme-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary transition-colors hover:bg-theme-secondary disabled:opacity-50'>
                        {resolvedActionIds.includes(shelfLifeActionId)
                          ? 'Shelf-life task resolved'
                          : 'Mark shelf-life reviewed'}
                      </button>
                    </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center'>
                      <div className='space-y-4'>
                        <div className='flex items-end justify-between gap-4'>
                          <div>
                            <p className='text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1'>
                              Exp Date
                            </p>
                            <div className='text-base font-bold text-text-primary tracking-tight leading-none'>
                              {audit.shelfLife.expDate}
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1'>
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
                        <div className='h-2.5 bg-theme-secondary border border-border-primary/50 rounded-full overflow-hidden'>
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

                      <div className='p-5 bg-theme-primary/60 backdrop-blur-md rounded-2xl border border-border-primary'>
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

                <section>
                  <h4 className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4 text-emerald-500' />{' '}
                    Statutory Verification
                  </h4>
                  <div className='space-y-4'>
                    {audit.findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className={`p-6 rounded-2xl border transition-all ${
                          finding.status === 'discrepancy'
                            ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                            : 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
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
                                className='flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50'>
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
                                className='flex items-center gap-2 rounded-lg border border-border-primary bg-theme-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary transition-colors hover:bg-theme-secondary disabled:opacity-50'>
                                {resolvedActionIds.includes(getFindingActionId(audit, idx))
                                  ? 'Action resolved'
                                  : 'Mark action done'}
                              </button>
                            )}

                            {finding.visualFixPrompt && onFixImage && (
                              <button
                                onClick={() => !isFixing && onFixImage(idx)}
                                disabled={!!isFixing}
                                className='flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-gray-200 dark:shadow-none'>
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
                          <div className='mt-5 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/80 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10'>
                            <div className='flex flex-wrap items-center justify-between gap-3'>
                              <p className='text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400'>
                                AI Rewrite Suggestion
                              </p>
                              <span className='rounded-full border border-indigo-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:border-indigo-900/50 dark:bg-[#10182A] dark:text-indigo-300'>
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
              </div>
            </div>
          </div>

          <div className='flex shrink-0 flex-col gap-3 border-t border-border-primary bg-theme-secondary/50 px-4 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8'>
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




