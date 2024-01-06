# YugaMovies UI

## Prerequisites

- Install Node.js v18

## Project Setup

1. From the Terminal, navigate to `/ui`.

2. Install Dependencies:
```
npm install
```

3. Create project environment variables in `.env.development` and `.env.production` files, using `.env.development.example` and `.env.production.example` for reference.

4. Run UI Locally (*Optional*)
```
npm run dev
```
5. Build UI
```
npm run build
```

## Deploying to Google Cloud

1. Create a Storage Bucket in GCP.
2. Under `Edit website configuration`, set both the index page and error page to `index.html`. This will ensure that all frontend routes handled by `react-router` serve `index.html`.

3. Upload the contents from the `/dist` directory, which is produced after building the UI. 
   
   **Note: Do not upload the /dist directory itself, only the files and subdirectories**

4. Create a Load Balancer.

    This load balancer should be configured with a static IP address. The backend configuration for this load balancer should point to the storage bucket you just created.

    After deploying this load balancer, the UI should be accessible from the provided static IP address.