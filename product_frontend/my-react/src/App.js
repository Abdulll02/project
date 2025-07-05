import React, { useState } from 'react';
import './App.css';
import ProductTable from './ProductTable';
import axios from 'axios';

function App() {
  const [parseQuery, setParseQuery] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [reloadTable, setReloadTable] = useState(0);
  const [clearError, setClearError] = useState(null);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleParse = async (e) => {
    e.preventDefault();
    setParsing(true);
    setParseError(null);
    setParseSuccess(false);
    try {
      await axios.post('http://127.0.0.1:8000/api/parse/', { query: parseQuery });
      setParseSuccess(true);
      setReloadTable(prev => prev + 1); // обновить таблицу после парсинга
    } catch (error) {
      setParseError('Ошибка при запуске парсинга');
    } finally {
      setParsing(false);
    }
  };

  const handleClear = async () => {
    setClearError(null);
    setClearSuccess(false);
    try {
      await axios.post('http://127.0.0.1:8000/api/clear_products/');
      setClearSuccess(true);
      setReloadTable(prev => prev + 1); // обновить таблицу после очистки
    } catch (error) {
      setClearError('Ошибка при очистке таблицы');
    }
  };

  return (
    <div className="App">
      <div className="content-wrapper">
        <form onSubmit={handleParse} style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Введите товар для парсинга"
            value={parseQuery}
            onChange={e => setParseQuery(e.target.value)}
            disabled={parsing}
            required
          />
          <button type="submit" disabled={parsing || !parseQuery}>
            {parsing ? 'Парсинг...' : 'Запустить парсинг'}
          </button>
          <button type="button" onClick={handleClear} disabled={parsing} style={{ marginLeft: '10px' }}>
            Очистить таблицу
          </button>
        </form>
        {parsing && <div>Парсинг выполняется, пожалуйста, подождите...</div>}
        {parseError && <div style={{ color: 'red' }}>{parseError}</div>}
        {parseSuccess && <div style={{ color: 'green' }}>Парсинг завершён!</div>}
        {clearError && <div style={{ color: 'red' }}>{clearError}</div>}
        {clearSuccess && <div style={{ color: 'green' }}>Таблица очищена!</div>}
        <ProductTable reload={reloadTable} />
      </div>
    </div>
  );
}

export default App;
