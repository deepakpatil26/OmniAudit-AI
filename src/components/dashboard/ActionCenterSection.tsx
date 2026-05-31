import React from 'react';
import { AlertTriangle, CheckCheck, ListTodo } from 'lucide-react';
import { ActionStats, ActionTask } from '../../lib/actionCenter';

interface ActionCenterSectionProps {
  actionTasks: ActionTask[];
  actionStats: ActionStats;
  groupedActionTasks: {
    critical: ActionTask[];
    advisory: ActionTask[];
  };
  onOpenReport: (audit: ActionTask['audit']) => void;
  onStartReaudit: (task: ActionTask) => void;
  onResolveTask: (taskId: string) => void;
}

function getReminderClasses(reminderState?: ActionTask['reminderState']) {
  switch (reminderState) {
    case 'overdue':
      return 'bg-red-500/10 text-red-500';
    case 'due-today':
      return 'bg-red-500/10 text-red-500';
    case 'due-this-week':
      return 'bg-amber-500/10 text-amber-500';
    default:
      return 'bg-emerald-500/10 text-emerald-500';
  }
}

export function ActionCenterSection({
  actionTasks,
  actionStats,
  groupedActionTasks,
  onOpenReport,
  onStartReaudit,
  onResolveTask,
}: ActionCenterSectionProps) {
  return (
    <section className='oa-panel px-5 py-6 sm:px-6 sm:py-7'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            <ListTodo className='h-4 w-4' />
            Action Center
          </div>
          <h3 className='font-display mt-3 text-2xl font-bold text-text-primary'>
            Next best compliance actions
          </h3>
          <p className='mt-2 max-w-2xl text-sm font-medium leading-relaxed text-text-secondary'>
            OmniAudit is now turning high-risk findings into a working queue so
            your team can resolve issues and re-audit faster.
          </p>
        </div>
        <div className='grid grid-cols-2 gap-3 sm:flex sm:items-center'>
          <div className='oa-chip py-3 text-text-primary'>
            {actionTasks.length} open action
            {actionTasks.length === 1 ? '' : 's'}
          </div>
          <div className='oa-chip py-3 text-text-primary'>
            {actionStats.resolved}/{actionStats.total} resolved
          </div>
        </div>
      </div>

      {actionStats.total > 0 && (
        <div className='mt-6 rounded border border-border-primary bg-theme-primary p-5'>
          <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='oa-label'>
                Workflow progress
              </p>
              <p className='mt-1 text-sm font-medium text-text-primary'>
                {actionStats.openCritical} critical action
                {actionStats.openCritical === 1 ? '' : 's'} need attention
                first.
              </p>
            </div>
            <p className='text-sm font-bold text-[var(--accent-primary)]'>
              {actionStats.completionPct}% complete
            </p>
          </div>
          <div className='h-2 overflow-hidden rounded bg-theme-secondary'>
            <div
              className='h-full rounded bg-[var(--accent-primary)] transition-all duration-500'
              style={{ width: `${actionStats.completionPct}%` }}
            />
          </div>
        </div>
      )}

      {actionTasks.length === 0 ? (
        <div className='mt-6 rounded border border-dashed border-border-primary bg-theme-primary px-6 py-12 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded border border-border-primary bg-emerald-500/10 text-emerald-500'>
            <CheckCheck className='h-7 w-7' />
          </div>
          <h4 className='font-display mt-4 text-lg font-bold text-text-primary'>
            Action queue is clear
          </h4>
          <p className='mt-2 text-sm font-medium text-text-secondary'>
            Your current audits do not have unresolved workflow tasks. Run a new
            audit or keep monitoring the ledger.
          </p>
        </div>
      ) : (
        <div className='mt-6 space-y-7'>
          {(
            [
              ['critical', groupedActionTasks.critical],
              ['advisory', groupedActionTasks.advisory],
            ] as const
          ).map(
            ([groupKey, groupTasks]) =>
              groupTasks.length > 0 && (
                <div key={groupKey}>
                  <div className='mb-4 flex items-center gap-2'>
                    <div
                      className={`rounded px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                        groupKey === 'critical'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                      {groupKey === 'critical' ? 'Resolve first' : 'Plan next'}
                    </div>
                    <p className='text-sm font-semibold text-text-primary'>
                      {groupTasks.length} {groupKey} action
                      {groupTasks.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
                    {groupTasks.map((task) => (
                      <div
                        key={task.id}
                        className='rounded border border-border-primary bg-theme-primary p-5'>
                        <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex min-w-0 items-start gap-3'>
                            <div
                              className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded border border-border-primary ${
                                task.priority === 'critical'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}>
                              <AlertTriangle className='h-5 w-5' />
                            </div>
                            <div className='min-w-0'>
                              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                                {task.priority === 'critical'
                                  ? 'Critical action'
                                  : 'Advisory action'}
                              </div>
                              <h4 className='font-display mt-2 text-base font-bold leading-tight text-text-primary'>
                                {task.title}
                              </h4>
                              <p className='mt-2 text-sm font-medium leading-relaxed text-text-secondary'>
                                {task.description}
                              </p>
                              <div className='mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest'>
                                  <span className='oa-chip'>
                                  {task.category}
                                </span>
                                <span className='oa-chip'>
                                  {task.dueLabel}
                                </span>
                                {task.reminderLabel && (
                                  <span
                                    className={`rounded px-3 py-1 ${getReminderClasses(task.reminderState)}`}>
                                    {task.reminderLabel}
                                  </span>
                                )}
                              </div>
                              <p className='mt-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                                {task.audit.productName} |{' '}
                                {new Date(task.audit.createdAt).toLocaleDateString()}
                              </p>
                              <p className='mt-2 text-xs font-semibold text-text-primary'>
                                Next step: {task.nextStepLabel}
                              </p>
                            </div>
                          </div>

                          <div className='flex gap-2 sm:flex-col'>
                            <button
                              onClick={() => onOpenReport(task.audit)}
                              className='oa-button-primary'>
                              Open report
                            </button>
                            <button
                              onClick={() => onStartReaudit(task)}
                              className='oa-button-ghost'>
                              Re-audit
                            </button>
                            <button
                              onClick={() => onResolveTask(task.id)}
                              className='oa-button-ghost'>
                              Mark done
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </section>
  );
}

