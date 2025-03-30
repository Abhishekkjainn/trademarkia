import { use } from 'react';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('Owners');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('nike'); // For main search bar
  const [filterSearchTerm, setFilterSearchTerm] = useState(''); // For sidebar search bar
  const [selectedItems, setSelectedItems] = useState({
    Owners: [],
    'Law Firms': [],
    Attorneys: [],
  });
  const [cardData, setCardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Sample data - replace with your actual data
  const [filterData, setFilterData] = useState({
    Owners: [
      'Tesla, Inc.',
      'LEGALFORCE RAPC.',
      'SpaceX Inc.',
      'Apple Inc.',
      'Google LLC',
    ],
    'Law Firms': [
      'LegalForce RAPC',
      'Baker McKenzie',
      'Jones Day',
      'Latham & Watkins',
    ],
    Attorneys: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'],
  });

  // const fetchTrademarkData = async (query) => {
  //   setIsLoading(true);
  //   setIsError(false);
  //   try {
  //     const response = await fetch(
  //       'https://vit-tm-task.api.trademarkia.app/api/v3/us',
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           input_query: query,
  //           input_query_type: '',
  //           sort_by: 'default',
  //           status: [],
  //           exact_match: false,
  //           date_query: false,
  //           owners: [],
  //           attorneys: [],
  //           law_firms: [],
  //           mark_description_description: [],
  //           classes: [],
  //           page: 1,
  //           rows: 10,
  //           sort_order: 'desc',
  //           states: [],
  //           counties: [],
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       // setIsError(true);
  //       throw new Error('Network response was not ok');
  //     }

  //     const data = await response.json();
  //     console.log('API Response:', data);

  //     // Extract attorney names from the API response
  //     const attorneys =
  //       data.body?.aggregations?.attorneys?.buckets?.map(
  //         (bucket) => bucket.key
  //       ) || [];

  //     const lawfirms =
  //       data.body?.aggregations?.law_firms?.buckets?.map(
  //         (bucket) => bucket.key
  //       ) || [];
  //     const owners =
  //       data.body?.aggregations?.current_owners?.buckets?.map(
  //         (bucket) => bucket.key
  //       ) || [];

  //     // Extract card details from hits
  //     const cardDetails =
  //       data.body?.hits?.hits?.map((hit) => {
  //         const source = hit._source || {};
  //         return {
  //           registered: source.status_type || 'Unknown',
  //           registration_number: source.registration_number || 'N/A',
  //           registration_date: source.registration_date || 'N/A',
  //           renewal_date: source.renewal_date || 'N/A',
  //           attorneys: source.search_bar?.attorneys || 'N/A',
  //           law_firm: source.search_bar?.law_firm || 'N/A',
  //           owner: source.search_bar?.owner || 'N/A',
  //           mark_identification: source.mark_identification || 'N/A',
  //           law_firm_cleaned: source.law_firm_cleaned || 'N/A',
  //           attorney_name: source.search_bar?.attorneys || 'N/A',
  //           mark_description: source.mark_description_description || [],
  //           class_codes: source.class_codes || [],
  //           country: source.country || 'N/A',
  //         };
  //       }) || [];

  //     // Update state with extracted attorney names and card details
  //     setFilterData((prevData) => ({
  //       ...prevData,
  //       Owners: owners,
  //       'Law Firms': lawfirms,
  //       Attorneys: attorneys,
  //     }));

  //     setCardData(cardDetails); // Assuming you have a state setter for card data
  //   } catch (error) {
  //     setIsError(true);
  //     console.error('Error fetching data:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchTrademarkData = async (query) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(
        'https://vit-tm-task.api.trademarkia.app/api/v3/us',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_query: query,
            input_query_type: '',
            sort_by: 'default',
            status: [],
            exact_match: false,
            date_query: false,
            owners: [],
            attorneys: [],
            law_firms: [],
            mark_description_description: [],
            classes: [],
            page: 1,
            rows: 10,
            sort_order: 'desc',
            states: [],
            counties: [],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Extract unique owners, law firms, and attorneys from the hits section
      const ownersSet = new Set();
      const lawFirmsSet = new Set();
      const attorneysSet = new Set();

      const cardDetails =
        data.body?.hits?.hits?.map((hit) => {
          const source = hit._source || {};

          // Extract uncleaned owner, law firm, and attorney names
          const owner = source.current_owner || source.search_bar?.owner || '';
          const lawFirm = source.law_firm || source.search_bar?.law_firm || '';
          const attorney = source.search_bar?.attorneys || '';

          if (owner) ownersSet.add(owner);
          if (lawFirm) lawFirmsSet.add(lawFirm);
          if (attorney) attorneysSet.add(attorney);

          return {
            registered: source.status_type || 'Unknown',
            registration_number: source.registration_number || 'N/A',
            registration_date: source.registration_date || 'N/A',
            renewal_date: source.renewal_date || 'N/A',
            attorneys: attorney,
            law_firm: lawFirm,
            owner: owner,
            mark_identification: source.mark_identification || 'N/A',
            law_firm_cleaned: source.law_firm_cleaned || 'N/A',
            attorney_name: attorney,
            mark_description: source.mark_description_description || [],
            class_codes: source.class_codes || [],
            country: source.country || 'N/A',
          };
        }) || [];

      if (cardDetails.length === 0) {
        setNoResults(true); // Handle empty results
      }

      // Convert sets to arrays and update state
      setFilterData((prevData) => ({
        ...prevData,
        Owners: Array.from(ownersSet),
        'Law Firms': Array.from(lawFirmsSet),
        Attorneys: Array.from(attorneysSet),
      }));

      setCardData(cardDetails);
    } catch (error) {
      setIsError(true);
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit format
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Call API on component mount with 'nike'
  useEffect(() => {
    fetchTrademarkData('nike');
  }, []);

  const handleStatusClick = (status) => {
    console.log(status);
    // status = status.toLowerCase();
    setSelectedStatus(status);
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    fetchTrademarkData(searchTerm);
  };

  // const handleItemClick = (item) => {
  //   setSelectedItems((prev) => {
  //     const currentTabItems = [...prev[activeTab]];
  //     const itemIndex = currentTabItems.indexOf(item);

  //     if (itemIndex === -1) {
  //       currentTabItems.push(item);
  //     } else {
  //       currentTabItems.splice(itemIndex, 1);
  //     }

  //     return {
  //       ...prev,
  //       [activeTab]: currentTabItems,
  //     };
  //   });
  // };

  const handleItemClick = (item) => {
    setSelectedItems((prev) => {
      const newSelected = prev[activeTab].includes(item)
        ? prev[activeTab].filter((i) => i !== item)
        : [...prev[activeTab], item];

      return { ...prev, [activeTab]: newSelected };
    });
  };

  const filteredCardData = cardData.filter((card) => {
    // Status Filter
    if (
      selectedStatus !== 'All' &&
      card.registered.toLowerCase() !== selectedStatus.toLowerCase()
    ) {
      return false;
    }

    // Owners Filter
    if (
      selectedItems.Owners.length > 0 &&
      !selectedItems.Owners.includes(card.owner)
    ) {
      return false;
    }

    // Law Firms Filter
    if (
      selectedItems['Law Firms'].length > 0 &&
      !selectedItems['Law Firms'].includes(card.law_firm)
    ) {
      return false;
    }

    // Attorneys Filter
    if (
      selectedItems.Attorneys.length > 0 &&
      !selectedItems.Attorneys.includes(card.attorney_name)
    ) {
      return false;
    }

    return true;
  });

  const filteredItems = filterData[activeTab].filter(
    (item) => item.toLowerCase().includes(filterSearchTerm.toLowerCase()) // Use filterSearchTerm instead of searchTerm
  );

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      )}

      {isError && (
        <div className="loading-overlay">
          <img src="/error.png" alt="Error" className="errorimage" />
          <div className="error-text">Error ! Please Try Again Later</div>
        </div>
      )}

      <div className="header">
        <img src="/textlogo.png" alt="" className="compimg" />
        <div className="searchbar">
          <img src="/searchicon.png" alt="SearchIcon" className="searchicon" />
          <input
            type="text"
            name="searchbarinp"
            id="searchbarinp"
            className="searchbarinp"
            placeholder="Search Trademark Here eg. Mickey Mouse"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="searchbutton" onClick={handleSearchClick}>
          Search
        </div>
      </div>
      <div className="results">
        <div className="filtersection">
          <div className="tags">
            {' '}
            About {filteredCardData.length} Trademarsks for "{searchTerm}"
          </div>
          <div className="filteractions">
            <div className="filterbutton">
              <img src="/filter.png" alt="Filter Icon" className="filtericon" />
              <div className="filtertag">Filter</div>
            </div>
            <div className="sharebutton">
              <img
                src="/share.png"
                alt="Share button"
                className="sharebuttonicon"
              />
            </div>
            <div className="sharebutton">
              <img
                src="/sort.png"
                alt="Share button"
                className="sharebuttonicon"
              />
            </div>
          </div>
        </div>
        <div className="resultfinal">
          <div className="resultlist">
            {noResults && <div className="noresult">No Results Found</div>}
            <div className="topresultlist">
              <div className="imgreslisttop">Mark</div>
              <div className="detailsreslisttop">Details</div>
              <div className="statusreslisttop">Status</div>
              <div className="classdescreslisttop">Class/Description</div>
            </div>
            <div className="bottomresultlist">
              {/* {cardData.map((card, key)=>)}
              <div className="card">
                <img
                  src="/imageplaceholder.png"
                  alt=""
                  className="imgreslistbottom"
                />
                <div className="detailsreslistbottom">
                  <div className="topdet">
                    <span className="compdetname1">Meta Logo</span>
                    <span className="compdetname2">Facebook INC.</span>
                  </div>
                  <div className="bottomdet">
                    <span className="bottomdet1">8872451</span>
                    <span className="bottomdet2">26th Jan 2020</span>
                  </div>
                </div>
                <div className="statusreslistbottom">
                  <div className="topstatus">
                    <div className="topstatus1">
                      <div className="circle green"></div>Live/Registered
                    </div>
                    <div className="topstatus2">on 26th Feb 2020</div>
                  </div>
                  <div className="bottomstatus">
                    <img
                      src="/arrowcircle.png"
                      alt="Circlearrow"
                      className="arrowcircle"
                    />
                    26 Dec 2027
                  </div>
                </div>
                <div className="descriptionreslistbottom">
                  <div className="desctop">
                    Computer services, Social Media, Networking, Virtual
                    Communities, Community
                  </div>
                  <div className="descbottom">
                    <img src="/classicon.png" alt="" className="descimg" />{' '}
                    Class 45
                    <img src="/classicon.png" alt="" className="descimg" />{' '}
                    Class 8
                  </div>
                </div>
              </div> */}
              {filteredCardData.map((card, index) => (
                <div className="card" key={index}>
                  <img
                    src="/imageplaceholder.png" // You can update this to a dynamic image if available
                    alt=""
                    className="imgreslistbottom"
                  />
                  <div className="detailsreslistbottom">
                    <div className="topdet">
                      <span className="compdetname1">
                        {card.mark_identification || 'N/A'}
                      </span>
                      <span className="compdetname2">
                        {card.owner || 'Unknown Owner'}
                      </span>
                    </div>
                    <div className="bottomdet">
                      <span className="bottomdet1">
                        {card.registration_number || 'N/A'}
                      </span>
                      <span className="bottomdet2">
                        {formatDate(card.registration_date) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="statusreslistbottom">
                    <div className="topstatus">
                      <div className="topstatus1">
                        <div
                          className={`circle ${
                            card.registered === 'registered' ? 'green' : 'red'
                          }`}
                        ></div>
                        {card.registered == 'registered'
                          ? 'Registered'
                          : 'Unknown Status'}
                      </div>
                      <div className="topstatus2">
                        on {formatDate(card.registration_date) || 'N/A'}
                      </div>
                    </div>
                    <div className="bottomstatus">
                      <img
                        src="/arrowcircle.png"
                        alt="Circlearrow"
                        className="arrowcircle"
                      />
                      {formatDate(card.renewal_date) || 'N/A'}
                    </div>
                  </div>
                  <div className="descriptionreslistbottom">
                    <div className="desctop">
                      {card.mark_description.length > 0
                        ? card.mark_description.join(', ')
                        : 'No description available'}
                    </div>
                    <div className="descbottom">
                      {card.class_codes.length > 0 ? (
                        <>
                          {card.class_codes.slice(0, 3).map((classCode, i) => (
                            <span key={i} className="descbot">
                              <img
                                src="/classicon.png"
                                alt=""
                                className="descimg"
                              />{' '}
                              Class {classCode}
                            </span>
                          ))}
                          {card.class_codes.length > 3 && (
                            <span className="extra-classes">
                              <div className="circleinfo">
                                {card.class_codes.length - 3}+
                              </div>
                            </span>
                          )}
                        </>
                      ) : (
                        <span>No class info</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar">
            <div className="statusbar">
              <div className="statusheader">Status</div>
              <div className="statustags">
                {['All', 'Registered', 'Pending', 'Abandoned', 'Others'].map(
                  (status) => (
                    <div
                      key={status}
                      className={`tag ${
                        selectedStatus === status ? 'active-tag' : ''
                      }`}
                      onClick={() => handleStatusClick(status)}
                    >
                      <div
                        className={`circle ${
                          status === 'Registered'
                            ? 'green'
                            : status === 'Pending'
                            ? 'yellow'
                            : status === 'Abandoned'
                            ? 'red'
                            : status === 'Others'
                            ? 'blue'
                            : ''
                        }`}
                      ></div>
                      <div className="tagtext">{status}</div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="ownerslawfirmsattorneysbar">
              <div className="top">
                {['Owners', 'Law Firms', 'Attorneys'].map((tab) => (
                  <div
                    key={tab}
                    className={`t ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="active-indicator"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="tsearchbar">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}`}
                  value={filterSearchTerm} // Use separate state
                  onChange={(e) => setFilterSearchTerm(e.target.value)} // Update filter search term
                />
              </div>

              <div className="tresult">
                {filteredItems.length > 0 ? (
                  <ul>
                    {filteredItems.map((item) => (
                      <li
                        key={item}
                        className={
                          selectedItems[activeTab].includes(item)
                            ? 'selected'
                            : ''
                        }
                        onClick={() => handleItemClick(item)}
                      >
                        <div
                          className={`checkbox ${
                            selectedItems[activeTab].includes(item)
                              ? 'checked'
                              : ''
                          }`}
                        >
                          {selectedItems[activeTab].includes(item) && (
                            <div className="checkmark">
                              <img
                                src="/check.png"
                                alt=""
                                className="checkimg"
                              />
                            </div>
                          )}
                        </div>
                        <div className="resitem">{item}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-results">No results found</div>
                )}
              </div>

              {/* For debugging - show selected items */}
              <div className="selected-items">
                <h4>Selected Filters:</h4>
                {Object.entries(selectedItems).map(
                  ([tab, items]) =>
                    items.length > 0 && (
                      <div key={tab}>
                        <strong>{tab}:</strong> {items.join(', ')}
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
