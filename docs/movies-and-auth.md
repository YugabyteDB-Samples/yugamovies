# Movies Service and Auth Service

## Building and Pushing Docker Images to Google Container Registry

From /movies-service
```
docker build -t gcr.io/yugaworld/movies-service .

# NOTE: Remember to supply the platform argument, if necessary on your system
docker build --platform=linux/amd64 -t gcr.io/yugaworld/movies-service .

# Push Docker image to Google Container Registry
docker push gcr.io/yugaworld/movies-service
```

From /auth-service
```
# build Docker image
docker build -t gcr.io/yugaworld/auth-service .

# NOTE: Remember to supply the platform argument, if necessary on your system
docker build --platform=linux/amd64 -t gcr.io/yugaworld/auth-service .

# Push Docker image to Google Container Registry
docker push gcr.io/yugaworld/auth-service
```

## Create service account with Vertex AI access
- In GCP Console, create a service account, add Vertex AI Admin role
- Click on service account, and create a key of type JSON
- Copy this file to the `/certs` directory upon downloading. It will later be stored as a secret in Kubernetes.

## Create movies deployment file
Using `deployment.example.yaml` as a reference, create `deployment.yaml`
- Set environment variables for DB_HOST and DB_PASSWORD
- To change the default text embedding model in Vertex AI, change the VERTEX_AI_MODEL environment variable

## Create auth deployment file
Using `deployment.example.yaml` as a reference, create `deployment.yaml`.
- Set environment variables for DB_HOST and DB_PASSWORD

## Creating Kubernetes Secrets
```
kubectl create secret generic root-certificate --from-file=root.crt=/Users/bhoyer/Projects/google-apigee-project/certs/root.crt

# This adds the credentials required to access Google Vertex AI from the movies service
kubectl create secret generic movies-credentials --from-file=credentials.json=/path/to/Projects/google-apigee-project/certs/SERVICE_ACCOUNT_CREDENTIALS_FILE.json
```

## Deploying Application to Kubernetes
```
# from /movies-service
kubectl apply -f deployment.yaml 

# from /auth-service
kubectl apply -f deployment.yaml 
```

## Create Service for LoadBalancer (NOTE: exposes public IP, eventually switch to cluster-ip-service or other)

```
# from /movies-service
kubectl apply -f load-balancer-service.yaml 

# from /auth-service
kubectl apply -f load-balancer-service.yaml 
```