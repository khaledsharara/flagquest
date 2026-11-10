import { SegmentedControl } from '../../shared';
import { MODES, modeInfo } from '../utils/modes';
import { useProgress } from './ProgressProvider';

export function ModePicker({ showDescription = true }: { showDescription?: boolean }) {
  const { mode, setMode } = useProgress();
  return (
    <div>
      <SegmentedControl options={MODES.map((m) => ({ value: m.id, label: m.label }))} value={mode} onChange={setMode} />
      {showDescription && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{modeInfo(mode).description}</p>}
    </div>
  );
}
