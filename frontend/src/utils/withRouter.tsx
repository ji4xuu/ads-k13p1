import { useNavigate, useLocation, useParams } from 'react-router-dom';

// Ini adalah "Pembungkus Ajaib" agar Class Component bisa pindah halaman
export const withRouter = (Component: any) => {
  const Wrapper = (props: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    
    return (
      <Component
        navigate={navigate}
        location={location}
        params={params}
        {...props}
      />
    );
  };
  
  return Wrapper;
};