import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtlas, type ContinentId, type Country } from '../../atlas';
import { distractorPool, getLevel, useProgress, type Level, type Mode } from '../../levels';
import { ProgressBar, Screen, cn, haptic } from '../../shared';
import { useNavigation } from '../../../navigation';
import { AnswerFeedback } from '../components/AnswerFeedback';
import { QuestionView } from '../components/QuestionView';
import { QuizResults } from '../components/QuizResults';
import { QUESTION_SKILL, buildQuiz, reviewQuestion } from '../utils/questions';
import type { Answer, Question } from '../types';

interface QuizPageProps {
  continent: ContinentId;
  level: number;
  mode: Mode;
}

interface QuizState {
  queue: Question[];
  index: number;
  chosenId: string | null;
  answers: Answer[];
  done: boolean;
}

const freshState = (level: Level, pool: Country[], mode: Mode): QuizState => ({
  queue: buildQuiz(level, pool, mode),
  index: 0,
  chosenId: null,
  answers: [],
  done: false,
});

export function QuizPage({ continent, level: number, mode }: QuizPageProps) {
  const atlas = useAtlas();
  const level = getLevel(atlas, continent, number);
  if (!level) return null;
  return <Quiz level={level} mode={mode} />;
}

function Quiz({ level, mode }: { level: Level; mode: Mode }) {
  const atlas = useAtlas();
  const { recordResult, recordAnswer, isUnlocked } = useProgress();
  const { pop, replace } = useNavigation();
  const pool = useMemo(() => distractorPool(atlas, level), [atlas, level]);
  const [state, setState] = useState(() => freshState(level, pool, mode));
  const [stars, setStars] = useState(0);
  const recorded = useRef(false);

  const question = state.queue[state.index];
  const firstTries = state.answers.filter((a) => !a.question.review);
  const correctCount = firstTries.filter((a) => a.correct).length;
  const total = level.countries.length;

  useEffect(() => {
    if (!state.done || recorded.current) return;
    recorded.current = true;
    setStars(recordResult(mode, level, correctCount / total));
  }, [state.done, recordResult, mode, level, correctCount, total]);

  // Always waits for the player to tap Next; there is no automatic advance.
  const advance = () => {
    setState((s) => {
      if (s.chosenId === null) return s;
      return s.index + 1 < s.queue.length ? { ...s, index: s.index + 1, chosenId: null } : { ...s, done: true };
    });
  };

  const choose = (countryId: string) => {
    if (!question || state.chosenId !== null) return;
    const correct = countryId === question.country.id;
    haptic(correct ? 'success' : 'error');
    recordAnswer(question.country.id, QUESTION_SKILL[question.type], correct);
    const retry = !correct && !question.review ? reviewQuestion(question, pool, mode) : null;
    setState((s) => ({
      ...s,
      chosenId: countryId,
      answers: [...s.answers, { question, chosenId: countryId, correct }],
      queue: retry ? [...s.queue, retry] : s.queue,
    }));
  };

  const restart = () => {
    recorded.current = false;
    setState(freshState(level, pool, mode));
  };

  if (state.done) {
    const missed = [...new Map(firstTries.filter((a) => !a.correct).map((a) => [a.question.country.id, a.question.country])).values()];
    const nextLevel = getNextLevel(atlas, level);
    return (
      <Screen title="Results" onBack={pop} backLabel="Level">
        <QuizResults
          correct={correctCount}
          total={total}
          stars={stars}
          missed={missed}
          canContinue={nextLevel !== undefined && isUnlocked(mode, nextLevel)}
          onRetry={restart}
          onNext={() => {
            if (!nextLevel) return;
            pop();
            replace({ name: 'level', continent: level.continent, level: nextLevel.number });
          }}
          onExit={pop}
        />
      </Screen>
    );
  }

  if (!question) return null;
  const answered = state.answers.length;

  return (
    <Screen
      title={<ProgressBar value={answered / state.queue.length} className="mx-auto mt-0.5 w-full max-w-[12rem]" />}
      onBack={pop}
      backLabel="Quit"
      right={
        <span className="pr-3 text-sm font-medium tabular-nums text-slate-500">
          {Math.min(state.index + 1, state.queue.length)}/{state.queue.length}
        </span>
      }
      scroll={question.type !== 'locate'}
      footer={
        state.chosenId !== null && <AnswerFeedback question={question} chosenId={state.chosenId} onContinue={advance} />
      }
    >
      <div className={cn('flex flex-col', question.type === 'locate' ? 'min-h-0 flex-1' : 'min-h-full')}>
        {question.review && (
          <p className="pt-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-600">Second chance</p>
        )}
        <QuestionView key={question.key} question={question} chosenId={state.chosenId} onChoose={choose} />
      </div>
    </Screen>
  );
}

function getNextLevel(atlas: ReturnType<typeof useAtlas>, level: Level): Level | undefined {
  return getLevel(atlas, level.continent, level.number + 1);
}
