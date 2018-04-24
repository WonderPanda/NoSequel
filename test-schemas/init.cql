CREATE TABLE IF NOT EXISTS test.groupMembers (
    groupname text,
    username text,
    email text,
    age int,
    PRIMARY KEY (groupname, username)
);