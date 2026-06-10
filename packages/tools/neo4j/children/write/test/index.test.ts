import { describe, expect, it } from "vitest";
import { InputType } from "../src";

describe("Neo4j write tool", () => {
  it("accepts mutating Cypher and object parameters", async () => {
    const result = await InputType.parseAsync({
      uri: "bolt://localhost:7687",
      username: "neo4j",
      password: "password",
      cypher: "MERGE (n:Person {id: $id}) SET n.name = $name RETURN n",
      parameters: {
        id: "person-1",
        name: "Ada Lovelace",
      },
    });

    expect(result.parameters).toEqual({
      id: "person-1",
      name: "Ada Lovelace",
    });
    expect(result.cypher).toBe(
      "MERGE (n:Person {id: $id}) SET n.name = $name RETURN n",
    );
  });
});
