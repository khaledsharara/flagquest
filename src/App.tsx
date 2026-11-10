import { AtlasPage, AtlasProvider, CountryPage } from './modules/atlas';
import { ContinentPage, HomePage, LevelPage, ProgressProvider } from './modules/levels';
import { PracticePage } from './modules/practice';
import { QuizPage } from './modules/quiz';
import { NavigationProvider, useNavigation, type Route } from './navigation';

function RouteView({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'continent':
      return <ContinentPage continent={route.continent} />;
    case 'level':
      return <LevelPage continent={route.continent} level={route.level} />;
    case 'quiz':
      return <QuizPage continent={route.continent} level={route.level} mode={route.mode} />;
    case 'practice':
      return <PracticePage scope={route.scope} mode={route.mode} />;
    case 'atlas':
      return <AtlasPage />;
    case 'country':
      return <CountryPage ids={route.ids} index={route.index} />;
  }
}

/** Renders the whole navigation stack; only the top page is visible, the rest keep their state. */
function PageStack() {
  const { stack } = useNavigation();
  return (
    <>
      {stack.map((entry, i) => (
        <div key={entry.key} className={i === stack.length - 1 ? 'absolute inset-0 animate-page-in' : 'hidden'}>
          <RouteView route={entry.route} />
        </div>
      ))}
    </>
  );
}

export function App() {
  return (
    <AtlasProvider>
      <ProgressProvider>
        <NavigationProvider>
          <PageStack />
        </NavigationProvider>
      </ProgressProvider>
    </AtlasProvider>
  );
}
