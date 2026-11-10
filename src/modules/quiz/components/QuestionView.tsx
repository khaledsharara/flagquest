import { useMemo } from 'react';
import { ContinentMap, CountryShape, Flag, FocusMap } from '../../atlas';
import type { Tone } from '../../shared';
import { optionState } from '../utils/questions';
import { ChoiceButton, ChoiceTile } from './ChoiceButton';
import type { Question } from '../types';

interface QuestionViewProps {
  question: Question;
  chosenId: string | null;
  onChoose: (countryId: string) => void;
}

function PromptText({ children, name }: { children: string; name?: string }) {
  return (
    <div className="text-center">
      <p className="text-slate-500 dark:text-slate-400">{children}</p>
      {name && <p className="font-rounded text-3xl font-bold leading-tight">{name}</p>}
    </div>
  );
}

/** Colours for the map after an answer: the right country green, a wrong guess red. */
function useAnswerHighlights(question: Question, chosenId: string | null, before: Tone | null) {
  return useMemo(() => {
    const target = question.country.id;
    if (!chosenId) return before ? { [target]: before } : {};
    const tones: Record<string, Tone> = { [target]: 'correct' };
    if (chosenId !== target) tones[chosenId] = 'wrong';
    return tones;
  }, [question, chosenId, before]);
}

function LocateQuestion({ question, chosenId, onChoose }: QuestionViewProps) {
  const highlights = useAnswerHighlights(question, chosenId, null);
  const missed = chosenId !== null && chosenId !== question.country.id;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-center gap-3 px-4 py-3">
        <Flag country={question.country} className="h-8" />
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tap on</p>
          <p className="font-rounded text-2xl font-bold leading-tight">{question.country.name}</p>
        </div>
      </div>
      <div className="map-sea relative mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
        <ContinentMap
          continent={question.country.continent}
          highlights={highlights}
          onSelect={onChoose}
          zoomToId={missed ? question.country.id : null}
        />
        <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-slate-500/80">
          Pinch to zoom · small countries are circles
        </p>
      </div>
    </div>
  );
}

function MapPrompt({ question, chosenId }: Omit<QuestionViewProps, 'onChoose'>) {
  const answered = chosenId !== null;
  const extra = useMemo(
    () => (chosenId && chosenId !== question.country.id ? { [chosenId]: 'wrong' as Tone } : undefined),
    [chosenId, question.country.id],
  );
  return (
    <div className="map-sea aspect-[10/7] w-full max-w-md overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
      <FocusMap country={question.country} tone={answered ? 'correct' : 'accent'} extra={extra} />
    </div>
  );
}

function Prompt({ question, chosenId }: Omit<QuestionViewProps, 'onChoose'>) {
  const { country } = question;
  switch (question.type) {
    case 'flag-name':
      return (
        <>
          <PromptText>Which country's flag is this?</PromptText>
          <Flag country={country} className="h-[min(24vh,12rem)] max-w-full" />
        </>
      );
    case 'name-flag':
      return <PromptText name={country.name}>Which flag belongs to</PromptText>;
    case 'shape-name':
      return (
        <>
          <PromptText>Which country has this shape?</PromptText>
          <CountryShape country={country} className="h-[min(30vh,15rem)] w-[min(30vh,15rem)]" />
        </>
      );
    case 'name-shape':
      return <PromptText name={country.name}>Which shape is</PromptText>;
    case 'map-name':
      return (
        <>
          <PromptText>Which country is highlighted?</PromptText>
          <MapPrompt question={question} chosenId={chosenId} />
        </>
      );
    case 'capital':
      return (
        <>
          <Flag country={country} className="h-[min(14vh,7rem)]" />
          <PromptText name={country.name}>What is the capital of</PromptText>
        </>
      );
    case 'locate':
      return null;
  }
}

function Answers({ question, chosenId, onChoose }: QuestionViewProps) {
  const state = (id: string) => optionState(question, chosenId, id);
  if (question.type === 'name-flag' || question.type === 'name-shape') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option) => (
          <ChoiceTile key={option.id} state={state(option.id)} onClick={() => onChoose(option.id)}>
            {question.type === 'name-flag' ? (
              <Flag country={option} className="w-full" />
            ) : (
              <CountryShape country={option} className="aspect-square h-auto w-full max-w-[9rem]" />
            )}
          </ChoiceTile>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <ChoiceButton key={option.id} state={state(option.id)} onClick={() => onChoose(option.id)}>
          {question.type === 'capital' ? option.capital : option.name}
        </ChoiceButton>
      ))}
    </div>
  );
}

export function QuestionView(props: QuestionViewProps) {
  if (props.question.type === 'locate') return <LocateQuestion {...props} />;
  const pictureAnswers = props.question.type === 'name-flag' || props.question.type === 'name-shape';
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col px-4 pb-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
        <Prompt question={props.question} chosenId={props.chosenId} />
      </div>
      <div className={pictureAnswers ? 'pb-2' : ''}>
        <Answers {...props} />
      </div>
    </div>
  );
}
