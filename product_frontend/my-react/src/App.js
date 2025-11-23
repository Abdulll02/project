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
        <header className="header">
          <div className="brand">
            <div className="logo">PA</div>
            <div>
              <h1>Product Analytics</h1>
              <p>Парсер Wildberries — интерфейс управления</p>
            </div>
          </div>
          <div className="controls">
            <div className="panel form-row">
              <form onSubmit={handleParse} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Введите товар для парсинга"
                  value={parseQuery}
                  onChange={e => setParseQuery(e.target.value)}
                  disabled={parsing}
                  required
                />
                <button type="submit" disabled={parsing || !parseQuery}>
                  {parsing ? 'Парсинг...' : 'Запустить'}
                </button>
              </form>
              <button className="secondary" type="button" onClick={handleClear} disabled={parsing} style={{ marginLeft: '8px' }}>
                Очистить
              </button>
            </div>
          </div>
        </header>

        <div style={{ marginTop: 12 }}>
          {parsing && <div className="panel" style={{ color: 'var(--accent)' }}>Парсинг выполняется, пожалуйста, подождите...</div>}
          {parseError && <div className="panel" style={{ color: '#ff8b8b' }}>{parseError}</div>}
          {parseSuccess && <div className="panel" style={{ color: '#9ef6c9' }}>Парсинг завершён!</div>}
          {clearError && <div className="panel" style={{ color: '#ff8b8b' }}>{clearError}</div>}
          {clearSuccess && <div className="panel" style={{ color: '#9ef6c9' }}>Таблица очищена!</div>}
        </div>

        <div className="grid">
          <main className="main-card">
            <ProductTable reload={reloadTable} />
          </main>
          <aside className="charts-panel panel">
            <h3 style={{margin:'6px 0 12px 0'}}>Аналитика</h3>
            <p style={{color:'var(--muted)',fontSize:13}}>Здесь будут графики и дополнительные фильтры.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
