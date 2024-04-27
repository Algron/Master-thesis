# A web application showing old newspapers

In my master thesis entitled 'Preserving Historical Newspapers with a Node.js API', I developed an web application in JavaScript to display old newspapers. The idea was that journalists, historians, and other professionals could use the tool to filter the newspapers in different way to get the desired results. 

The back-end was developed with Node.js and the front-end was developed with React.js.

## Getting the data
The data used in this project originates from the Mannheimer Korpus Historischer Zeitungen und Zeitschriften: https://repos.ids-mannheim.de/fedora/objects/clarin-ids:mkhz1.00000/datastreams/CMDI/content

Here the TEI data file was downloaded and processed as shown in the Python code file. 

## Installation Instructions
In Python the following libraries must be used:
- os
- re
- xml.etree.ElementTree
- BeautifulSoup
- pandas
- spacy (the language model used is this: de_core_news_lg)
- geopy

A PostgreSQL database needs to be genereated in pgAdmin 4 (https://www.pgadmin.org/). The table must include these columns as extracted in the python file:
- id (used as key); VARCHAR
- date in YYYY-MM-DD format; DATE
- place; VARCHAR
- content; VARCHAR
- words (named entities); VARCHAR
- year; INT
- day-month in DD-MM; CHAR(5)
- month; INT
- day; INT
- place_corrected (to be sure that old place names are updated); VARCHAR
- latitude; NUMERIC
- longitude; NUMERIC

N.B. Remember to change login to the database in the back-end code.

Node.js is required to run the back-end server and execute the JavaScript code. Download and install it from Node.js official website. 

In the Node.js back-end, the following libraries must be used:
- express: The framework used to build the back-end server.
- pg (PostgreSQL): The PostgreSQL client for Node.js, used to interact with a PostgreSQL database.
- dotenv: To load environment variables from a .env file.
- cors: To enable Cross-Origin Resource Sharing on the back-end server.
- path: To handle and transform file paths.
- fs (File System): To interact with the file system, particularly for reading files.
- moment: Used to handle dates and times.

With the node package manager (npm) you can set up an React.js front-end folder. 

In the React.js front-end, the following libraries must be used:
- React: Used across all components for building the user interface.
- axios: Utilized for making HTTP requests from your front-end to the back-end.
- moment: Used to handle dates and times.
- react-chartjs-2: Integrated for displaying charts in the MonthlyView and YearlyView components.
- chart.js: Necessary for the chart components used alongside react-chartjs-2.
- react-leaflet: Employed in the MapView component to render maps and handle geographic data.
- leaflet/dist/leaflet.css: CSS for the react-leaflet library to style the map components.

### Usage
The data must be downloaded and processed through the Python file. Then a database must be built. Remember to adjust the database login in the back-end file. Then you can run the back-end with 'node app public.js' and the front-end in another window with 'npm start'.

### Acknowledgments
I would like to thank my supervisor Tariq Yousef for guiding me and my boyfriend David for supporting me. 
