# YugaMovies

## Overview
YugaMovies is a movie recommendation service powered by Google Vertex AI and YugabyteDB. This service features a React.js frontend served by the Google Cloud CDN. This frontend makes requests through Google Apigee to Node.js backend services for *authentication* and *movies*, running in Google Kubernetes Engine.

## Prerequisites
- Create Google Cloud account with write permissions
- Install `kubectl` commend-line utility

## Setup Documents

| Component    | Description   |         
| ------------------ |:--------------|
| [YugabyteDB](docs/data.md)       | Instructions to set up geo-partitioned YugabyteDB cluster |
| [Movies and Auth Services](docs/movies-and-auth.md)        | Instructions to build and deploy the Movies and Auth services to Kubernetes |
| [UI](docs/ui.md)             | Instructions to build and deploy UI |