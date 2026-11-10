import { useLayoutEffect, useRef, useState } from 'react';
import { useAtlas, type Country } from '../../atlas';
import { distractorPool, getLevel, isMastered, modeInfo, useProgress, type Mode } from '../../levels';
import { AnswerFeedback, QUESTION_SKILL, QuestionView, type Question } from '../../quiz';
import { Icon, ProgressBar, Screen, cn, haptic } from '../../shared';
import { useNavigation } from '../../../navigation';
import { PracticeStatus } from '../components/PracticeStatus';
import { PracticeSummary } from '../components/PracticeSummary';
import { scopeCountries, scopeLabel } from '../utils/scope';
import { nextPracticeQuestion } from '../utils/selection';
import type { PracticeScope } from '../types';

interface PracticePageProps {
  scope: PracticeScope;
  mode: Mode;
}

interface Session {
  question: Question;
  chosenId: string | null;
  recent: string[];
  answered: number;
  correct: number;
  streak: number;
  bestStreak: number;
  misses: Record<string, number>;
  showSummary: boolean;
}

const MAX_NEEDS_WORK = 10;

export function PracticePage({ scope, mode }: PracticePageProps) {
  const atlas = useAtlas();
  const { practicedIds } = useProgress();
  const { pop } = useNavigation();
  // The set of countries is fixed when the session starts.
  const [countries] = useState(() => scopeCountries(atlas, scope, practicedIds));
  if (countries.length === 0) {
    return (
      <Screen title="Endless" onBack={pop}>
        <p className="p-8 text-center text-slate-500">Nothing to practice yet. Play a level first.</p>
      </Screen>
    );
  }
  return <Practice scope={scope} mode={mode} countries={countries} />;
}

function Practice({ scope, mode, countries }: PracticePageProps & { countries: Country[] }) {
  const atlas = useAtlas();
  const progress = useProgress();
  const { pop } = useNavigation();
  const progressRef = useRef(progress);
  useLayoutEffect(() => {
    progressRef.current = progress;
  });

  const poolFor = (country: Country) => {
    const level = getLevel(atlas, country.continent, country.level);
    return level ? distractorPool(atlas, level) : atlas.countries.filter((c) => c.continent === country.continent);
  };
  const nextQuestion = (recent: string[]) => nextPracticeQuestion(countries, mode, progressRef.current, recent, poolFor);

  const [session, setSession] = useState<Session>(() => {
    const question = nextQuestion([]);
    return {
      question,
      chosenId: null,
      recent: [question.country.id],
      answered: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      misses: {},
      showSummary: false,
    };
  });
  const [masteredAtStart] = useState(
    () => new Set(countries.filter((c) => isMastered(progress.masteryOf(c.id, mode))).map((c) => c.id)),
  );

  const masteredIds = countries.filter((c) => isMastered(progress.masteryOf(c.id, mode))).map((c) => c.id);
  const total = countries.length;
  const { question, chosenId } = session;

  const choose = (countryId: string) => {
    if (chosenId !== null) return;
    const correct = countryId === question.country.id;
    haptic(correct ? 'success' : 'error');
    progress.recordAnswer(question.country.id, QUESTION_SKILL[question.type], correct);
    setSession((s) => {
      const streak = correct ? s.streak + 1 : 0;
      return {
        ...s,
        chosenId: countryId,
        answered: s.answered + 1,
        correct: s.correct + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
        misses: correct ? s.misses : { ...s.misses, [question.country.id]: (s.misses[question.country.id] ?? 0) + 1 },
      };
    });
  };

  // Moves on only when the player taps Next.
  const advance = () => {
    if (chosenId === null) return;
    const next = nextQuestion(session.recent);
    setSession((s) => ({ ...s, question: next, chosenId: null, recent: [...s.recent, next.country.id].slice(-8) }));
  };

  if (session.showSummary) {
    const byId = new Map(countries.map((c) => [c.id, c]));
    const newlyMastered = masteredIds.filter((id) => !masteredAtStart.has(id)).flatMap((id) => byId.get(id) ?? []);
    const masteredNow = new Set(masteredIds);
    const needsWork = Object.entries(session.misses)
      .filter(([id]) => !masteredNow.has(id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_NEEDS_WORK)
      .flatMap(([id]) => byId.get(id) ?? []);
    return (
      <Screen title="Summary" onBack={pop} backLabel="Exit">
        <PracticeSummary
          answered={session.answered}
          correct={session.correct}
          bestStreak={session.bestStreak}
          mastered={masteredIds.length}
          total={total}
          newlyMastered={newlyMastered}
          needsWork={needsWork}
          onContinue={() => setSession((s) => ({ ...s, showSummary: false }))}
          onFinish={pop}
        />
      </Screen>
    );
  }

  const locate = question.type === 'locate';
  return (
    <Screen
      title={<ProgressBar value={masteredIds.length / total} className="mx-auto mt-0.5 w-full max-w-[12rem]" />}
      onBack={() => (session.answered > 0 ? setSession((s) => ({ ...s, showSummary: true })) : pop())}
      backLabel="Done"
      right={
        <span className="flex items-center gap-1 pr-3 text-sm font-medium tabular-nums text-slate-500">
          <Icon name="check" className="h-4 w-4 text-emerald-500" />
          {masteredIds.length}/{total}
        </span>
      }
      scroll={!locate}
      footer={chosenId !== null && <AnswerFeedback question={question} chosenId={chosenId} onContinue={advance} />}
    >
      <div className={cn('flex flex-col', locate ? 'min-h-0 flex-1' : 'min-h-full')}>
        <PracticeStatus
          label={`${scopeLabel(scope)} · ${modeInfo(mode).label}`}
          answered={session.answered}
          correct={session.correct}
          streak={session.streak}
          allMastered={masteredIds.length === total}
        />
        <QuestionView key={question.key} question={question} chosenId={chosenId} onChoose={choose} />
      </div>
    </Screen>
  );
}
