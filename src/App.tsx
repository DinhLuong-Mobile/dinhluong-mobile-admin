import { AuthProvider } from './providers/AuthProvider';
// Import file chứa cấu hình useRouteElements của bạn (thay đổi đường dẫn cho phù hợp)
import useRouteElements from './routes/useRouteElements'; 

function App() {
  // Gọi hook để lấy toàn bộ element của các route
  const routeElements = useRouteElements();

  return (
    <AuthProvider>
      {/* Hiển thị tập hợp các route ra đây */}
      {routeElements}
    </AuthProvider>
  );
}

export default App;