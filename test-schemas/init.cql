CREATE TABLE IF NOT EXISTS iot.sensors (
    id uuid,
    display text,
    timestamp timeuuid,
    PRIMARY KEY (id, timestamp)
);