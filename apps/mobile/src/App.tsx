import './utils/ignore-warnings';
import { FC } from 'react';
import { Provider } from './components';
import { LoginScreen } from './screens';

const App: FC = () => {
  return (
    <Provider>
      <LoginScreen />
    </Provider>
  );
};

export default App;
