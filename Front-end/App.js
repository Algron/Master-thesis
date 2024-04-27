import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Navbar from './components/Navbar';
import Tabs from './components/Tabs';
import ContentView from './components/ContentView';
import YearlyView from './components/YearlyView';
import MonthlyView from './components/MonthlyView';
import MapView from './components/MapView';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register components for Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  // State hooks for various application states
  const [searchInput, setSearchInput] = useState('');
  const [currentView, setCurrentView] = useState('daily');
  const [content, setContent] = useState('');
  const [isYearlyDataReady, setIsYearlyDataReady] = useState(false);
  const [isMonthlyDataReady, setIsMonthlyDataReady] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [yearRangeError, setYearRangeError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [articles, setArticles] = useState([]);
  const [viewingArticles, setViewingArticles] = useState(false);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [tagPages, setTagPages] = useState({});

  // Fetch daily view data from the server
  const fetchDailyView = async () => {
    try {
      const response = await axios.get('http://localhost:3050/');
      console.log("Fetched data:", response.data);
      setDailyEntries(response.data);
      setTagPages({});
    } catch (error) {
      console.error('Error fetching daily view:', error);
    }
  };
  
  // Fetch yearly data from the server
  const fetchYearlyView = async () => {
    try {
      const response = await axios.get('http://localhost:3050/yearly');
      setContent(response.data);
      setIsYearlyDataReady(true); // Indicate that yearly data is ready
    } catch (error) {
      console.error('Error fetching yearly view:', error);
      setIsYearlyDataReady(false); // Handle errors
    }
  };

  // Handler for year selection in the yearly view, triggers monthly view fetch
  const handleYearClick = (year) => {
    setYearFrom(year);
    setYearTo(year);
    setCurrentView('monthly');
    fetchMonthlyView(year, year);
  };

  // Fetch monthly data based on year range from the server
  const fetchMonthlyView = async (from = '', to = '') => {
    let url = `http://localhost:3050/monthly`;
    if (from && to) {
      url += `?yearFrom=${from}&yearTo=${to}`;
    }
    try {
      const response = await axios.get(url);
      setContent(response.data);
      setIsMonthlyDataReady(true);
    } catch (error) {
      console.error('Error fetching monthly view:', error);
      setIsMonthlyDataReady(false); // Handle errors
    }
  };
 
  // Validate year range and fetch data
  const handleYearRangeSubmit = () => {
    if (yearFrom.length !== 4 || yearTo.length !== 4) {
        setYearRangeError('Year must be in YYYY format.');
        return;
    }
    fetchMonthlyView(yearFrom, yearTo);
  };
  
  // Reset year selection
  const handleReset = () => {
    setYearFrom('');
    setYearTo('');
    setYearRangeError('');
    fetchMonthlyView();
  };

  // Fetch articles based on month selection
  const handleMonthClick = async (month) => {
    const formattedMonth = month.toString().padStart(2, '0');
    const fromYear = yearFrom; // Assumes default or set value
    const toYear = yearTo; // Assumes default or set value
    
    try {
      const response = await axios.get(`http://localhost:3050/articles`, {
        params: {
          month: formattedMonth,
          yearFrom: fromYear,
          yearTo: toYear
        }
      });
      setArticles(response.data); // Set the articles state with the response data
      setViewingArticles(true); // This will trigger the view to switch to the articles table
      setTagPages({});
    } catch (error) {
      console.error('Error fetching articles for month:', error);
    }
  };

  // Initialize daily view on component mount
  useEffect(() => {
    fetchDailyView();
  }, []);

  // Handle changes in search input
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Perform search and update view with results
  const handleSearchClick = async () => {
    try {
      const response = await axios.get(`http://localhost:3050/search?q=${searchInput}`);
      setArticles(response.data);
      setViewingArticles(true); 
      setCurrentView('search'); 
      setTagPages({});
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };
  
  // Fetch articles by city
  const fetchArticlesByCity = async (city) => {
    try {
      const response = await axios.get(`http://localhost:3050/articles-by-city`, {
        params: { city: city }
      });
      setArticles(response.data);
      setViewingArticles(true); 
      setCurrentView('articles');
      setTagPages({});
    } catch (error) {
      console.error('Error fetching articles by city:', error);
    }
  };
  
  // Handle tab selection changes
  const handleTabClick = (view) => {
    setSearchResults(null);
    setCurrentView(view);
    setViewingArticles(false); 
  
    if (view === 'daily') {
        fetchDailyView();
    } else if (view === 'monthly') {
        fetchMonthlyView(yearFrom, yearTo);
    } else if (view === 'yearly') {
        fetchYearlyView();
    }    
  };

  // Utility function to limit content display to 100 words
  const limitContentTo100Words = (content) => {
    const words = content.split(' ');
    return words.slice(0, 100).join(' ');
  };

  // Format and display tags, handling different tag formats
  const formatTags = (tags) => {
    if (!tags) return 'No tags found';
    if (typeof tags === 'string') {
      return tags.replace(/^\[|\]$/g, '').replace(/'/g, '').split(',').map(tag => tag.trim()).join(', ');
    }
    if (Array.isArray(tags)) {
      return tags.join(', ');
    }
    return 'Invalid tag format';
  };

  // Handle tag selection and fetch articles by tag
  const handleTagClick = async (tag) => {
    try {
      const response = await axios.get(`http://localhost:3050/articles-by-tag?tag=${encodeURIComponent(tag)}`);
      setArticles(response.data);
      setViewingArticles(true);
      setCurrentView('articles');
      setTagPages({});
    } catch (error) {
      console.error('Error fetching articles by tag:', error);
    }
  };

  // Function to change the tag page
  const setTagPage = (index, shift) => {
    setTagPages(prev => ({
      ...prev,
      [index]: (prev[index] || 0) + shift,
    }));
  };

// Render tags with pagination
  const renderTags = (tags, index) => {
    const pageSize = 20;  // Number of tags per page
    const currentPage = tagPages[index] || 0; 
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const currentTags = tags.slice(start, end);

    return (
      <>
        {currentPage > 0 && (
          <button onClick={() => setTagPage(index, -1)}>{"<"}</button>
        )}
        {currentTags.map((tag, idx) => (
          <button key={idx} onClick={() => handleTagClick(tag.trim())} style={{ marginRight: '5px' }}>
            {tag}
          </button>
        ))}
        {end < tags.length && (
          <button onClick={() => setTagPage(index, 1)}>{">"}</button>
        )}
      </>
    );
  };

  // Define column styles for article table
  const tableColumnStyles = {
    date: { width: '10%' },
    place: { width: '10%' },
    tags: { width: '30%' },
    content: { width: '40%' },
    actions: { width: '10%' }
  };

  // Render articles table
  function renderArticlesTable(articlesToRender) {
    return (
      <table style={{ width: '100%', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={tableColumnStyles.date}>Date</th>
            <th style={tableColumnStyles.place}>Place</th>
            <th style={tableColumnStyles.tags}>Tags</th>
            <th style={tableColumnStyles.content}>Content (First 100 Words)</th>
            <th style={tableColumnStyles.actions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articlesToRender.map((article, index) => (
            <tr key={index}>
              <td>{moment(article.date).format('YYYY-MM-DD')}</td>
              <td>{article.place}</td>
              <td>
                {renderTags(formatTags(article.words).split(', '), index)}
              </td>
              <td>{limitContentTo100Words(article.content)}</td>
              <td><a href={`http://localhost:3050/entry?id=${article.id}`} target="_blank" rel="noopener noreferrer">View Details</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  // Render view based on current state
  function renderCurrentView() {
    if (viewingArticles || currentView === 'daily' || currentView === 'search') {
      const articlesToRender = currentView === 'daily' ? dailyEntries : articles;
      return renderArticlesTable(articlesToRender);
    } else if (searchResults) {
      if (searchResults.__html) {
        return <div dangerouslySetInnerHTML={searchResults} />;
      } else {
        return <ContentView content={searchResults} />;
      }
    } else if (currentView === 'map') {
        return <MapView fetchArticlesByCity={fetchArticlesByCity} />;
    } else if (currentView === 'search' && searchResults) {
      return <div dangerouslySetInnerHTML={searchResults} />;
    } else if (currentView === 'yearly' && isYearlyDataReady) {
      return <YearlyView data={content} onYearClick={handleYearClick} />;
    } else if (currentView === 'monthly' && isMonthlyDataReady) {
      return (
        <>
          <div className="monthly-search-container">
              <div className="row">
                <input
                  type="text"
                  placeholder="Year From"
                  value={yearFrom}
                  onChange={e => setYearFrom(e.target.value)}
                  className="input"
                />
                <button onClick={handleYearRangeSubmit} className="button">Filter</button>
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="Year To"
                  value={yearTo}
                  onChange={e => setYearTo(e.target.value)}
                  className="input"
                />
                <button onClick={handleReset} className="button">Reset</button>
              </div>
              {yearRangeError && <p style={{color: 'red'}}>{yearRangeError}</p>}
            </div>
            <MonthlyView data={content} onMonthClick={handleMonthClick} />
        </>
      );
    } else {
      if (content && content.__html) {
        return <div dangerouslySetInnerHTML={content} />;
      } else {
        return <ContentView content={content} />;
      }
    }
  }
  
  // Main render function for the App component
  return (
    <div className="App">
      <Navbar onSearchChange={handleSearchChange} onSearchClick={handleSearchClick} />
      <Tabs onSelectView={handleTabClick} />
      {renderCurrentView()}
    </div>
  );
}

// Export the App component as default
export default App;