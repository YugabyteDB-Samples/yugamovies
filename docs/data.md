# YugabyteDB for YB-Movies

## Deploying a cluster in YugabyteDB's fully-managed cloud service
1. Create a [VPC network](https://docs.yugabyte.com/preview/yugabyte-cloud/cloud-basics/cloud-vpcs/cloud-add-vpc/) on GCP.
2. Create multi-region, geo-partitioned cluster on GCP in the `us-west2`, `us-central1` and `us-east4` regions. This cluster should be deployed to the VPC network you just created.
3. [Create Peering Connection](https://docs.yugabyte.com/preview/yugabyte-cloud/cloud-basics/cloud-vpcs/cloud-add-vpc-gcp/#create-a-peering-connection) from your application services to YugabyteDB.
4. In order to connect from your local machine, [enable public access to your cluster](https://docs.yugabyte.com/preview/yugabyte-cloud/cloud-secure-clusters/add-connections/#enabling-public-access) and add your IP address to the IP allow list.
5. Download the root certificate for this cluster and place it in the `/certs` directory.

## Movie Schema

Using the [`ysqlsh` shell](https://docs.yugabyte.com/preview/admin/ysqlsh/):
1. Connect to your cluster.
  ```
  ysqlsh -h YUGABYTEDB_PUBLIC_HOST -U admin -d yugabyte -p 5433
  ```

2. Execute the ***movie_schema.sql*** file against the cluster.
   ```
   \i /path/to/google-apigee-project/data/movie_schema.sql
   ```
3. Execute the ***movie_data.sql*** file against the cluster.
   ```
   \i /path/to/google-apigee-project/data/movie_data.sql
   ```

This will seed the cluster with ~45,000 movies and their respective metadata. In order to use Google Vertex AI for text embeddings, additional configuration is required.

1. Install the `pgvector` extension.
   ```
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. Create a column for text embeddings.
   ```
    ALTER TABLE movie ADD COLUMN embeddings vector(768);
   ```
3. Create a `.env` file with variables defined in `.env.example`.
4. Run the `embeddings_generator.js` script to generate embeddings for each movie using Vertex AI.
   ```
   node embeddings_generator.js
   ```

### User Schema

The users table is geo-partitioned, using the tablespaces created automatically when provisioning a geo-partitioned cluster in YugabyteDB Managed.

1. Execute the `users` schema.
   ```
   \i /path/to/google-apigee-project/data/user_schema.sql
   ```

### User Data

Seed users can be inserted using the ***user_data.sql*** script.

```
\i /path/to/google-apigee-project/data/user_data.sql
```

### Movies
Data originates from the IMDB Dataset in ***movies_metadata.csv***.
