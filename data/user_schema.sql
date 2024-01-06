CREATE TABLE IF NOT EXISTS
    users (
        id SERIAL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        username VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        geo VARCHAR(10)
    )
PARTITION BY
    LIST (geo);

--  Tablespaces are created automatically in YBM when geo-partitioned option is selected. Otherwise, add tablespace creation to the schema.
--  West partition table
CREATE TABLE IF NOT EXISTS
    us_west PARTITION OF users (id, geo, PRIMARY KEY (id HASH, geo)) FOR
VALUES
    IN ('west') TABLESPACE us_west2_ts;

--  Central partition table
CREATE TABLE IF NOT EXISTS
    us_central PARTITION OF users (id, geo, PRIMARY KEY (id HASH, geo)) FOR
VALUES
    IN ('central') TABLESPACE us_central1_ts;

--  East partition table
CREATE TABLE IF NOT EXISTS
    us_east PARTITION OF users (id, geo, PRIMARY KEY (id HASH, geo)) FOR
VALUES
    IN ('east') TABLESPACE us_east4_ts;

-- This function first tries to locate the user's credentials in a particular region.
-- If this regional lookup returns no results, the cluster is queried across all nodes.
CREATE
OR REPLACE FUNCTION find_user_credentials (p_username VARCHAR, p_geo VARCHAR) RETURNS SETOF users AS $$
BEGIN
    -- First try to find with both username and geo
    RETURN QUERY SELECT * FROM users WHERE username = p_username AND geo = p_geo;

    -- Check if the first query returned results
    IF NOT FOUND THEN
        -- Try to find with just the username
        RETURN QUERY SELECT * FROM users WHERE username = p_username;
    END IF;
END;
$$ LANGUAGE plpgsql;