import './App.css';
import { Table } from './Table';
import ReactDOM from 'react-dom/client';


function App() {
  return (
    <div className="App">
      <Table/>
    </div>
  );
}

export default App;
const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<Table />);