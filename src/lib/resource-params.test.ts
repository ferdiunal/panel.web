import { describe, expect, it } from "vitest";
import qs from "qs";
import {
  areParamsEqual,
  parseResourceParams,
  stringifyResourceParams,
  toApiParams,
  type ResourceParams,
} from "./resource-params";

describe("resource-params", () => {
  it("parses nested params including grid view", () => {
    const params = parseResourceParams(
      "?users[search]=ferdi&users[view]=grid&users[page]=2&users[per_page]=25&users[sort][name]=desc",
      "users"
    );

    expect(params.search).toBe("ferdi");
    expect(params.view).toBe("grid");
    expect(params.page).toBe(2);
    expect(params.per_page).toBe(25);
    expect(params.sort).toEqual({ column: "name", direction: "desc" });
  });

  it("defaults to table view for invalid or missing view", () => {
    const missingView = parseResourceParams("?users[search]=abc", "users");
    const invalidView = parseResourceParams("?users[view]=kanban", "users");

    expect(missingView.view).toBe("table");
    expect(invalidView.view).toBe("table");
  });

  it("stringifies grid view and keeps other query namespaces", () => {
    const query = stringifyResourceParams(
      {
        page: 1,
        per_page: 10,
        view: "grid",
      },
      "users",
      "teams[search]=ops"
    );

    const parsed = qs.parse(query, { depth: 5 }) as Record<string, any>;
    expect(parsed.teams.search).toBe("ops");
    expect(parsed.users.view).toBe("grid");
  });

  it("compares view in areParamsEqual", () => {
    const base: ResourceParams = {
      page: 1,
      per_page: 10,
      view: "table",
    };

    expect(
      areParamsEqual(base, {
        ...base,
        view: "grid",
      })
    ).toBe(false);
  });

  it("builds api params with nested view only for grid", () => {
    const gridParams = toApiParams(
      {
        page: 1,
        per_page: 10,
        view: "grid",
      },
      "users"
    );

    const tableParams = toApiParams(
      {
        page: 1,
        per_page: 10,
        view: "table",
      },
      "users"
    );

    expect(gridParams["users[view]"]).toBe("grid");
    expect(tableParams["users[view]"]).toBeUndefined();
  });
});
