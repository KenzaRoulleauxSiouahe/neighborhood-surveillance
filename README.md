# Neighbourhood Surveillance

## Overview

Neighbourhood Surveillance is a browser-based investigation game where the player investigates a series of murders in a neighbourhood.

The player uses surveillance cameras to observe different zones of the neighbourhood over four investigation days. Cameras can be moved between zones, and the collected surveillance information helps the player identify the possible cult members responsible for the murders.

## How the Game Works

The player has a limited investigation period to gather information.

During an investigation:

1. The player can position surveillance cameras in different zones.
2. The player then starts the investigation.
3. Each investigation day generates activity in the neighbourhood.
4. Camera coverage is recorded and stored in the database.
5. The player can review the collected surveillance information.
6. At the end of the investigation, the player uses the available information (resident files and camera logs) to identify the 3 suspected killers.

Camera coverage history is stored per investigation day, allowing the final report to show which zones each camera monitored.

## Main Features

- Persistent MongoDB database
- Individual player identification using a unique UID
- Active game persistence
- Camera placement and movement
- Camera coverage history
- Investigation days
- Generated resident activity
- Murder locations
- Cult member data
- Investigation/case report
- Visualisation of collected surveillance data
- REST API built with Express
- Docker-based backend and database environment
- Environment variables using `.env`
- Front-end API communication using `fetch()`

## Technologies

### Front-end

- HTML
- CSS
- JavaScript
- Fetch API
- DOM manipulation

### Back-end

- Node.js
- Express
- Mongoose
- MongoDB

### Development Environment

- Docker
- Docker Compose
- Nodemon
- Git / GitHub

## Project Structure

The project is separated into a front-end and back-end.

neighbourhood-surveillance/
│
├── frontend/
│ ├── Dockerfile
│ ├── index.html
│ ├── script.js
│ └── style.css
│
├── backend/
│ ├── src/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── seeds/
│ │ └── utils/
│ ├── server.js
│ ├── package.json
│ └── Dockerfile
│
├── docker-compose.yml
├── .env
├── STANDARD.md
└── README.md

## Database

The project uses MongoDB.

The database stores information such as:

- Players / game sessions
- Residents
- Locations
- Zones
- Cameras
- Camera coverage history
- Murder spots
- Investigation data

## Data Influencing the User Interface

The data stored in MongoDB is used directly by the front-end.

For example:

- Camera positions determine what is displayed on the map.
- Camera coverage history is displayed in the case report.
- Resident activity is used to generate surveillance logs.
- Murder spots are used as part of the investigation.
- The active player's game state determines the current investigation day.
- The player's UID determines which active investigation is loaded.

## Running the Project

### Requirements

Make sure you have:

- Docker Desktop
- Git

The project is designed to run locally using Docker.

### Environment Variables

The project uses a `.env` file for environment-specific configuration.

### Start the Project

From the project root, run:

docker compose up --build

Once the containers are running, open the game in your browser:

http://localhost:8080

The frontend is served through an Nginx Docker container.

The backend API is available at:

http://localhost:5000

MongoDB runs in its own Docker container and uses a persistent Docker volume for database storage.

### Stop the Project

To stop the containers, press Ctrl + C in the terminal.

Alternatively, run:

docker compose down

## Documentation and Sources

The sources used during the development of the project are documented separately in:

STANDARD.md

This file contains the documentation and references for the technologies, APIs, JavaScript features, database functionality, Docker setup, AI link and other development concepts used in the project.

## AI Usage

ChatGPT was used as a development support tool during the project.

Mainly used for:

- Understanding technical errors
- Debugging
- Explaining unfamiliar concepts
- Suggesting implementation approaches
- Improving and restructuring code
- Helping identify issues during development
