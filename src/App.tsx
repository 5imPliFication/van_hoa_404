import { useGameStore } from './state/gameStore';
import { Navbar } from './components/Navbar';
import { ConsequenceToast } from './components/ConsequenceToast';

import { LandingScreen } from './screens/LandingScreen';
import { SetupScreen } from './screens/SetupScreen';
import { FeedScreen } from './screens/FeedScreen';
import { CoreScreen } from './screens/CoreScreen';
import { StrategyScreen } from './screens/StrategyScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SourcesScreen } from './screens/SourcesScreen';

export function App() {
  const { phase } = useGameStore();

  const renderScreen = () => {
    switch (phase) {
      case 'landing':
        return <LandingScreen />;
      case 'setup':
        return <SetupScreen />;
      case 'feed':
        return <FeedScreen />;
      case 'core':
        return <CoreScreen />;
      case 'strategy':
        return <StrategyScreen />;
      case 'timeline':
        return <TimelineScreen />;
      case 'result':
        return <ResultScreen />;
      case 'sources':
        return <SourcesScreen />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {renderScreen()}
      </main>
      <ConsequenceToast />
    </div>
  );
}

export default App;
