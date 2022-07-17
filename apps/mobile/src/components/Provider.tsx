import { StatusBar } from 'expo-status-bar';
import {
  createContext,
  FC,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { transformer, trpc } from '../utils/trpc';

interface IAppContext {
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
  currentUser: IUser | null;
  setCurrentUser: Dispatch<SetStateAction<IUser | null>>;
}

const AppContext = createContext({} as IAppContext);

const TEST_USER = {
  name: 'string',
  email: 'string',
  picture: 'string',
  uid: 'string',
  exp: 123456,
  jti: 'string',
};

type IUser = typeof TEST_USER;

export const Provider: FC = ({ children }) => {
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState<IUser | null>(TEST_USER);
  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        currentUser,
        setCurrentUser,
      }}
    >
      <TrcpProvider>{children}</TrcpProvider>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

const TrcpProvider: FC = ({ children }) => {
  const { token } = useApp();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: 'http://localhost:3000/api/trpc',
      async headers() {
        return {
          Authorization: token,
        };
      },
      transformer,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style='dark' />
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
