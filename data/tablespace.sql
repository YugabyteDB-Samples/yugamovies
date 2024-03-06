-- if deploying a cluster without automatic tablespace creation
CREATE TABLESPACE us_west2_ts
WITH
    (
        replica_placement = '{"num_replicas": 1, 
    "placement_blocks":[
        {"cloud":"gcp","region":"us-west2","zone":"us-west2-c","min_num_replicas":1}
        ]}'
    );

CREATE TABLESPACE us_central1_ts
WITH
    (
        replica_placement = '{"num_replicas": 1, 
    "placement_blocks":[
        {"cloud":"gcp","region":"us-central1","zone":"us-central1-f","min_num_replicas":1}
        ]}'
    );

CREATE TABLESPACE us_east4_ts
WITH
    (
        replica_placement = '{"num_replicas": 1, 
    "placement_blocks":[
        {"cloud":"gcp","region":"us-east4","zone":"us-east4-a","min_num_replicas":1}
        ]}'
    );

-- use a global_tablespace for a global table that needs to be replicated across regions
CREATE TABLESPACE global_tablespace
WITH
    (
        replica_placement = '{"num_replicas": 3, 
    "placement_blocks":[
        {"cloud":"gcp","region":"us-west2","zone":"us-west2-a","min_num_replicas":3},
        {"cloud":"gcp","region":"us-central1","zone":"us-central1-f","min_num_replicas":3},
        {"cloud":"gcp","region":"us-east4","zone":"us-east4-c","min_num_replicas":3}
        ]}'
    );