import { Component, type ComponentType } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContext';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P & { auth: AuthContextType }>) {
  return class extends Component<P> {
    static contextType = AuthContext;
    declare context: AuthContextType;

    render() {
      return <WrappedComponent {...this.props} auth={this.context} />;
    }
  };
}
