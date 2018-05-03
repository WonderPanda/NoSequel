DROP KEYSPACE games;

CREATE KEYSPACE IF NOT EXISTS games WITH REPLICATION = { 
    'class' : 'SimpleStrategy', 
    'replication_factor' : 1 
};

INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('pcmanus', 'Coup', 2015, 05, 01, 4000);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('jbellis', 'Coup', 2015, 05, 03, 1750);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('yukim', 'Coup', 2015, 05, 03, 2250);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('tjake', 'Coup', 2015, 05, 03, 500);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('jmckenzie', 'Coup', 2015, 06, 01, 2000);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('iamaleksey', 'Coup', 2015, 06, 01, 2500);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('tjake', 'Coup', 2015, 06, 02, 1000);
INSERT INTO games.user_scores (user, gameTitle, year, month, day, score) VALUES ('pcmanus', 'Coup', 2015, 06, 02, 2000);

-- SELECT * FROM games.user_scores;

SELECT DISTINCT gameTitle FROM games.user_scores WHERE user = 'james' ALLOW FILTERING

SELECT * FROM games.alltimehigh WHERE gameTitle = 'Coup'

SELECT DISTINCT gameTitle, score FROM games.usersGamesScoredByTitle WHERE user = 'mike'

SELECT * FROM games.monthlyHigh WHERE gameTitle = 'Coup' AND year = 2015 AND month = 5 LIMIT 1

SELECT user, score FROM games.dailyhigh WHERE gameTitle = 'Chess' AND year = 2015 AND month = 6 AND day = 2 LIMIT 1
`