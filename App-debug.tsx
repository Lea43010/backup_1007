import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function SimpleComponent() {
  return (
    <div>
      <h1>Simple Test Component</h1>
      <p>If you see this, React is working correctly.</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleComponent />
    </QueryClientProvider>
  );
}

export default App;