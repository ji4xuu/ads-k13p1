import { Component, createContext, type ReactNode } from 'react';
import { authApi, type User } from '../api/auth.api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => { throw new Error('AuthProvider not mounted'); },
  logout: () => {},
});

export class AuthProvider extends Component<{ children: ReactNode }, { user: User | null; token: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    const token = localStorage.getItem('iash_token');
    const raw = localStorage.getItem('iash_user');
    this.state = {
      token,
      user: raw ? JSON.parse(raw) : null,
    };
  }

  login = async (email: string, password: string): Promise<User> => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('iash_token', token);
    localStorage.setItem('iash_user', JSON.stringify(user));
    this.setState({ token, user });
    return user;
  };

  logout = () => {
    localStorage.removeItem('iash_token');
    localStorage.removeItem('iash_user');
    this.setState({ token: null, user: null });
  };

  render() {
    const { user, token } = this.state;
    return (
      <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login: this.login, logout: this.logout }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}
