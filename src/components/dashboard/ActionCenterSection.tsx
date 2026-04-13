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
      return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
    case 'due-today':
      return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
    case 'due-this-week':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
    default:
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
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
    <section className='mb-12 rounded-[2.5rem] border border-border-primary bg-theme-primary p-6 shadow-sm sm:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-500'>
            <ListTodo className='h-4 w-4' />
            Action Center
          </div>
          <h3 className='mt-3 text-2xl font-bold tracking-tight text-text-primary'>
            Next best compliance actions
          </h3>
          <p className='mt-2 max-w-2xl text-sm font-medium text-text-secondary'>
            OmniAudit is now turning high-risk findings into a working queue so
            your team can resolve issues and re-audit faster.
          </p>
        </div>
        <div className='grid grid-cols-2 gap-3 sm:flex sm:items-center'>
          <div className='rounded-2xl border border-border-primary bg-theme-secondary/50 px-4 py-3 text-sm font-semibold text-text-primary'>
            {actionTasks.length} open action
            {actionTasks.length === 1 ? '' : 's'}
          </div>
          <div className='rounded-2xl border border-border-primary bg-theme-secondary/50 px-4 py-3 text-sm font-semibold text-text-primary'>
            {actionStats.resolved}/{actionStats.total} resolved
          </div>
        </div>
      </div>

      {actionStats.total > 0 && (
        <div className='mt-6 rounded-[1.75rem] border border-border-primary bg-theme-secondary/35 p-4'>
          <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                Workflow progress
              </p>
              <p className='mt-1 text-sm font-medium text-text-primary'>
                {actionStats.openCritical} critical action
                {actionStats.openCritical === 1 ? '' : 's'} need attention
                first.
              </p>
            </div>
            <p className='text-sm font-bold text-indigo-600 dark:text-indigo-400'>
              {actionStats.completionPct}% complete
            </p>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-theme-primary'>
            <div
              className='h-full rounded-full bg-indigo-600 transition-all duration-500'
              style={{ width: `${actionStats.completionPct}%` }}
            />
          </div>
        </div>
      )}

      {actionTasks.length === 0 ? (
        <div className='mt-6 rounded-[2rem] border border-dashed border-border-primary bg-theme-secondary/30 px-6 py-10 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
            <CheckCheck className='h-7 w-7' />
          </div>
          <h4 className='mt-4 text-lg font-bold text-text-primary'>
            Action queue is clear
          </h4>
          <p className='mt-2 text-sm font-medium text-text-secondary'>
            Your current audits do not have unresolved workflow tasks. Run a new
            audit or keep monitoring the ledger.
          </p>
        </div>
      ) : (
        <div className='mt-6 space-y-6'>
          {(
            [
              ['critical', groupedActionTasks.critical],
              ['advisory', groupedActionTasks.advisory],
            ] as const
          ).map(
            ([groupKey, groupTasks]) =>
              groupTasks.length > 0 && (
                <div key={groupKey}>
                  <div className='mb-3 flex items-center gap-2'>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        groupKey === 'critical'
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                      {groupKey === 'critical' ? 'Resolve first' : 'Plan next'}
                    </div>
                    <p className='text-sm font-semibold text-text-primary'>
                      {groupTasks.length} {groupKey} action
                      {groupTasks.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
                    {groupTasks.map((task) => (
                      <div
                        key={task.id}
                        className='rounded-[1.75rem] border border-border-primary bg-theme-secondary/40 p-5'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex min-w-0 items-start gap-3'>
                            <div
                              className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                                task.priority === 'critical'
                                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                              }`}>
                              <AlertTriangle className='h-5 w-5' />
                            </div>
                            <div className='min-w-0'>
                              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                                {task.priority === 'critical'
                                  ? 'Critical action'
                                  : 'Advisory action'}
                              </div>
                              <h4 className='mt-2 text-base font-bold leading-tight text-text-primary'>
                                {task.title}
                              </h4>
                              <p className='mt-2 text-sm font-medium leading-relaxed text-text-secondary'>
                                {task.description}
                              </p>
                              <div className='mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest'>
                                <span className='rounded-full border border-border-primary bg-theme-primary px-3 py-1 text-text-secondary'>
                                  {task.category}
                                </span>
                                <span className='rounded-full border border-border-primary bg-theme-primary px-3 py-1 text-text-secondary'>
                                  {task.dueLabel}
                                </span>
                                {task.reminderLabel && (
                                  <span
                                    className={`rounded-full px-3 py-1 ${getReminderClasses(task.reminderState)}`}>
                                    {task.reminderLabel}
                                  </span>
                                )}
                              </div>
                              <p className='mt-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400'>
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
                              className='rounded-xl bg-gray-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.01] dark:bg-indigo-600'>
                              Open report
                            </button>
                            <button
                              onClick={() => onStartReaudit(task)}
                              className='rounded-xl border border-border-primary bg-theme-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary transition-colors hover:bg-theme-secondary'>
                              Re-audit
                            </button>
                            <button
                              onClick={() => onResolveTask(task.id)}
                              className='rounded-xl border border-border-primary bg-theme-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary transition-colors hover:bg-theme-secondary'>
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
