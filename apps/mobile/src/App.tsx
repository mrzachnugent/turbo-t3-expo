import { FC } from 'react';
import { Provider } from './components';
import { useAppReady } from './hooks';
import { LoginScreen } from './screens';
import { useStore } from './store';
import './utils/ignore-warnings';

const App: FC = () => {
  const { isAppReady } = useStore();
  useAppReady();

  if (!isAppReady) {
    return null;
  }
  return (
    <Provider>
      <LoginScreen />
    </Provider>
  );
};

export default App;
