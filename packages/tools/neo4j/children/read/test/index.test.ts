import { describe, expect, it } from "vitest";
import {
  assertReadOnlyCypher,
  stripCypherCommentsAndLiterals,
} from "../../../client";
import { InputType, tool } from "../src";

const baseInput = {
  uri: "neo4j://localhost:7687",
  username: "neo4j",
  password: "password",
  cypher: "MATCH (n) RETURN n LIMIT $limit",
  parameters: '{"limit": 5}',
};

describe("Neo4j read tool", () => {
  it("parses JSON parameters and strips a trailing semicolon", async () => {
    const result = await InputType.parseAsync({
      ...baseInput,
      cypher: "MATCH (n) RETURN n;",
    });

    expect(result.parameters).toEqual({ limit: 5 });
    expect(result.cypher).toBe("MATCH (n) RETURN n");
  });

  it("rejects invalid parameter JSON", async () => {
    await expect(
      InputType.parseAsync({
        ...baseInput,
        parameters: "[1,2,3]",
      }),
    ).rejects.toThrow("Parameters must be a JSON object");
  });

  it("rejects mutating Cypher before connecting", async () => {
    await expect(
      tool({
        ...baseInput,
        cypher: "CREATE (n:Person {name: $name})",
        parameters: { name: "Ada" },
        connectionTimeout: 10000,
        maxTransactionRetryTime: 30000,
      }),
    ).rejects.toThrow("Read Cypher cannot contain mutating operations");
  });

  it("allows mutating keywords inside strings and comments", () => {
    expect(() =>
      assertReadOnlyCypher(`
        // CREATE should be ignored in comments
        MATCH (n)
        RETURN "DELETE", n.name
      `),
    ).not.toThrow();
  });

  it("allows keyword-like label and property names in read queries", () => {
    expect(() =>
      assertReadOnlyCypher("MATCH (n:Set) RETURN n.set, n.delete"),
    ).not.toThrow();
  });

  it("strips literals before keyword detection", () => {
    const stripped = stripCypherCommentsAndLiterals(
      'RETURN "CREATE", `DELETE`',
    );

    expect(stripped).not.toContain("CREATE");
    expect(stripped).not.toContain("DELETE");
  });
});
