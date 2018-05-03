DROP KEYSPACE games;

CREATE KEYSPACE IF NOT EXISTS games WITH REPLICATION = { 
    'class' : 'SimpleStrategy', 
    'replication_factor' : 1 
};


CREATE TABLE games.scores
(
  user TEXT,
  game TEXT,
  year INT,
  month INT,
  day INT,
  score INT,
  PRIMARY KEY (user, game, year, month, day)
)

CREATE MATERIALIZED VIEW games.alltimehigh AS
       SELECT user FROM scores
       WHERE game IS NOT NULL AND score IS NOT NULL AND user IS NOT NULL AND year IS NOT NULL AND month IS NOT NULL AND day IS NOT NULL
       PRIMARY KEY (game, score, user, year, month, day)
       WITH CLUSTERING ORDER BY (score desc)

CREATE MATERIALIZED VIEW games.dailyhigh AS
       SELECT day FROM scores
       WHERE game IS NOT NULL AND year IS NOT NULL AND month IS NOT NULL AND day IS NOT NULL AND score IS NOT NULL AND user IS NOT NULL
       PRIMARY KEY ((game, year, month, day), score, user)
       WITH CLUSTERING ORDER BY (score DESC)
 
CREATE MATERIALIZED VIEW games.monthlyhigh AS
       SELECT user FROM scores
       WHERE game IS NOT NULL AND year IS NOT NULL AND month IS NOT NULL AND score IS NOT NULL AND user IS NOT NULL AND day IS NOT NULL
       PRIMARY KEY ((game, year, month), score, user, day)
       WITH CLUSTERING ORDER BY (score DESC)

INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('pcmanus', 'Coup', 2015, 05, 01, 4000)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('jbellis', 'Coup', 2015, 05, 03, 1750)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('yukim', 'Coup', 2015, 05, 03, 2250)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('tjake', 'Coup', 2015, 05, 03, 500)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('jmckenzie', 'Coup', 2015, 06, 01, 2000)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('iamaleksey', 'Coup', 2015, 06, 01, 2500)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('tjake', 'Coup', 2015, 06, 02, 1000)
INSERT INTO games.scores (user, game, year, month, day, score) VALUES ('pcmanus', 'Coup', 2015, 06, 02, 2000)

SELECT user, score FROM games.alltimehigh WHERE game = 'Coup'