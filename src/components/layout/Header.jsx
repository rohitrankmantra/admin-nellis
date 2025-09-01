import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 lg:ml-0 ml-12">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;