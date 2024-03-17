import { useAuth } from 'hooks';
import Loader from 'components/Loader';
import Welcome from 'components/Welcome';

const WelcomePage = () => {
  const { isLoading } = useAuth();
  console.log(isLoading);
  return isLoading ? <Loader /> : <Welcome />;
};

export default WelcomePage;
