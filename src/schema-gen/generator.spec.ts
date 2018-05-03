import { generateSchemaForType } from './generator';
import { GameScore } from '../models/test.entities';

describe('Schema Generator', () => {
    it('should generate tables and materialized view schemas based on entity meta', () => {
        const schema = generateSchemaForType<GameScore>(GameScore);

        console.log(schema);
    })
});