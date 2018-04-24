CREATE KEYSPACE IF NOT EXISTS filetest WITH replication = 
{
    'class': 'SimpleStrategy', 
    'replication_factor': '3' 
}