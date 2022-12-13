-- Table: public.packages
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE EXTENSION pgcrypto;

CREATE TABLE packages (
    pointer UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creation_method VARCHAR(128),
    downloads BIGINT NOT NULL DEFAULT 0,
    stargazers_count BIGINT NOT NULL DEFAULT 0,
    original_stargazers BIGINT NOT NULL DEFAULT 0,
    data JSONB
);

-- https://github.com/confused-Techie/atom-backend/issues/90

ALTER TABLE packages ADD CONSTRAINT lowercase_names CHECK (name = LOWER(name));

ALTER TABLE packages ADD COLUMN package_type VARCHAR(20);

UPDATE packages
SET package_type = 'theme'
WHERE LOWER(data ->'metadata'->> 'theme') = 'syntax' OR LOWER(data ->'metadata'->>'theme') = 'ui';

UPDATE packages
SET package_type = 'package'
WHERE package_type IS DISTINCT FROM 'theme';

CREATE TYPE packageType AS ENUM('package', 'theme');

ALTER TABLE packages
ALTER COLUMN package_type TYPE packageType USING (package_type::packageType),
ALTER COLUMN package_type SET NOT NULL;
